const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const childProcess = require('child_process')
const debug = require('debug')('node:lib:uploadTransform:')
const request = require('request')

const Transform = require('./transform')
const { readXattr, setXattr } = require('./xattr')
const { createFoldAsync, UploadMultipleFiles } = require('./server')
const { Tasks, sendMsg } = require('./transmissionUpdate')

/* return a new file name */
const getName = async (currPath, dirUUID, driveUUID) => currPath.replace(/^.*\//, '') // TODO

class Task {
  constructor() {
    /* Transform must be an asynchronous function !!! */
    this.task = new Transform({
      name: 'task',
      concurrency: 10240,
      transform(x, callback) {
        const { taskUUID, entries, dirUUID, driveUUID, taskType, createTime, newWork } = x
        const taskStatus = {
          entries,
          completeSize: 0,
          count: 0,
          finishCount: 0,
          finishDate: '',
          name: entries[0].replace(/^.*\//, ''),
          pause: false,
          restTime: '',
          size: 0,
          speed: '',
          state: 'visitless',
          trsType: 'upload',
          type: taskType,
          uuid: taskUUID
        }
        /* add task to global task list */
        Tasks.push(taskStatus)
        sendMsg()
        setImmediate(() => {
          callback(null, { entries, dirUUID, driveUUID, taskStatus })
        })
      }
    })

    this.readDir = new Transform({
      name: 'readDir',
      concurrency: 4,
      transform(x, callback) {
        const read = async (entries, dirUUID, driveUUID, taskStatus) => {
          for (let i = 0; i < entries.length; i++) {
            const entry = entries[i]
            const stat = await fs.lstatAsync(path.resolve(entry))
            taskStatus.count += 1
            if (stat.isDirectory()) {
              /* create fold and return the uuid */
              const dirname = await getName(entry, dirUUID, driveUUID)
              const Entries = await createFoldAsync(driveUUID, dirUUID, dirname)
              const uuid = Entries.find(e => e.name === dirname).uuid

              /* read child */
              const children = await fs.readdirAsync(path.resolve(entry))
              const newEntries = []
              children.forEach(c => newEntries.push(path.join(entry, c)))
              this.push({ entries: newEntries, dirUUID: uuid, driveUUID, taskStatus })
            } else {
              taskStatus.size += stat.size
            }
            callback(null, { entry, dirUUID, driveUUID, stat, taskStatus })
          }
        }
        const { entries, dirUUID, driveUUID, taskStatus } = x
        read(entries, dirUUID, driveUUID, taskStatus).catch(e => callback(e))
      }
    })

    this.hash = new Transform({
      name: 'hash',
      concurrency: 4,
      push(x) {
        if (x.stat.isDirectory()) {
          this.outs.forEach(t => t.push(Object.assign({}, x, { type: 'folder' })))
        } else {
          this.pending.push(x)
          this.schedule()
        }
      },
      transform: (x, callback) => {
        const { entry, dirUUID, driveUUID, stat, taskStatus } = x
        taskStatus.state = 'hashing'
        readXattr(entry, (error, attr) => {
          if (!error && attr && attr.parts) {
            callback(null, { entry, dirUUID, driveUUID, parts: attr.parts, type: 'file', taskStatus })
            return
          }
          const options = {
            env: { absPath: entry, size: stat.size, partSize: 1024 * 1024 * 1024 },
            encoding: 'utf8',
            cwd: process.cwd()
          }
          const child = childProcess.fork(path.join(__dirname, './filehash'), [], options)
          child.on('message', (result) => {
            setXattr(entry, result, (err, xattr) => {
              callback(err, { entry, dirUUID, driveUUID, parts: xattr && xattr.parts, type: 'file', taskStatus })
            })
          })
          child.on('error', callback)
        })
      }
    })

    this.upload = new Transform({
      name: 'upload',
      concurrency: 4,
      push(x) {
        if (x.type === 'folder') {
          x.taskStatus.finishCount += 1
          this.root().emit('data', x)
        } else {
          const { dirUUID, driveUUID } = x
          const index = this.pending.findIndex(p => p[0].dirUUID === dirUUID && p[0].driveUUID === driveUUID)
          if (index > -1 && this.pending[index].length < 100) {
            this.pending[index].push(x)
          } else {
            this.pending.push([x])
          }
          this.schedule()
        }
      },

      transform: (X, callback) => {
        debug('upload transform', X.length, X[0].dirUUID)

        const Files = X.map((x) => {
          const { entry, parts, taskStatus } = x
          taskStatus.state = 'uploading'
          const name = entry.replace(/^.*\//, '')
          const readStreams = parts.map(part => fs.createReadStream(entry, { start: part.start, end: part.end, autoClose: true }))
          for (let i = 0; i < parts.length; i++) {
            const rs = readStreams[i]
            rs.on('data', (chunk) => {
              sendMsg()
              taskStatus.completeSize += chunk.length
            })
            rs.on('end', () => {
              debug('readStreams end', entry)
              taskStatus.finishCount += 1
              if (taskStatus.finishCount === taskStatus.count) {
                taskStatus.finishDate = (new Date()).getTime()
                taskStatus.state = 'finished'
              }
              sendMsg()
            })
          }
          return ({ name, parts, readStreams })
        })
        const { driveUUID, dirUUID } = X[0]
        const handle = new UploadMultipleFiles(driveUUID, dirUUID, Files, callback)
        handle.upload()
      }
    })

    this.task.pipe(this.readDir).pipe(this.hash).pipe(this.upload)

    this.task.on('data', (X) => {
      if (!Array.isArray(X)) return
      X.forEach((x) => {
        debug('done:', x.name)
        sendMsg()
      })
    })

    this.task.on('step', () => {
      // debug('===================================')
      // task.print()
    })
  }

  push({ taskUUID, entries, dirUUID, driveUUID, taskType, createTime, newWork }) {
    this.task.push({ taskUUID, entries, dirUUID, driveUUID, taskType, createTime, newWork })
  }

  status() {
    return this.taskStatus
  }

  pause() {
  }

  resume() {
    this.upload.schedule()
  }

  abort() {
  }
}

const task = new Task()
const createTask = (taskUUID, entries, dirUUID, driveUUID, taskType, createTime, newWork) => {
  debug('createTask', taskUUID, entries, dirUUID, driveUUID, taskType, createTime, newWork)
  task.push({ taskUUID, entries, dirUUID, driveUUID, taskType, createTime, newWork })
}

const forceSchedule = () => upload.schedule()

const abortTask = targets => upload.abort(targets)

export { createTask, forceSchedule, abortTask }
