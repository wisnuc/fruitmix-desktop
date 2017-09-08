const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const childProcess = require('child_process')
const debug = require('debug')('node:lib:uploadTransform:')
const request = require('request')

const Transform = require('./transform')
const { readXattr, setXattr } = require('./xattr')
const { createFoldAsync, UploadMultipleFiles, serverGetAsync } = require('./server')
const { getMainWindow } = require('./window')
const { Tasks, sendMsg } = require('./transmissionUpdate')

/* return a new file name */
const getName = async (currPath, dirUUID, driveUUID) => currPath.replace(/^.*\//, '') // TODO

class Task {
  constructor(props) {
    /* props: { uuid, entries, dirUUID, driveUUID, taskType, createTime, isNew } */

    this.initStatus = () => {
      Object.assign(this, props)
      this.completeSize = 0
      this.lastTimeSize = 0
      this.count = 0
      this.finishCount = 0
      this.finishDate = 0
      this.name = props.entries[0].replace(/^.*\//, '')
      this.paused = false
      this.restTime = 0
      this.size = 0
      this.speed = 0
      this.lastSpeed = 0
      this.state = 'visitless'
      this.trsType = 'upload'
    }

    this.initStatus()

    this.countSpeedFunc = () => {
      if (this.paused) {
        this.speed = 0
        this.restTime = 0
        return
      }
      const speed = this.completeSize - this.lastTimeSize
      this.speed = (this.lastSpeed + speed) / 2
      this.lastSpeed = speed
      this.restTime = this.speed && (this.size - this.completeSize) / this.speed
      this.lastTimeSize = this.completeSize
      sendMsg()
    }

    this.reqHandles = []

    /* Transform must be an asynchronous function !!! */
    this.readDir = new Transform({
      name: 'readDir',
      concurrency: 8,
      transform(x, callback) {
        const read = async (entries, dirUUID, driveUUID, task) => {
          const files = []
          for (let i = 0; i < entries.length; i++) {
            if (task.paused) throw Error('task paused !')
            const entry = entries[i]
            const stat = await fs.lstatAsync(path.resolve(entry))
            task.count += 1
            if (stat.isDirectory()) {
              /* create fold and return the uuid */
              const dirname = await getName(entry, dirUUID, driveUUID)
              const Entries = await createFoldAsync(driveUUID, dirUUID, dirname)
              const uuid = Entries.find(e => e.name === dirname).uuid

              /* read child */
              const children = await fs.readdirAsync(path.resolve(entry))
              const newEntries = []
              children.forEach(c => newEntries.push(path.join(entry, c)))
              this.push({ entries: newEntries, dirUUID: uuid, driveUUID, task })
            } else {
              task.size += stat.size
            }
            files.push({ entry, stat })
          }
          return ({ files, dirUUID, driveUUID, task })
        }
        const { entries, dirUUID, driveUUID, task } = x
        read(entries, dirUUID, driveUUID, task).then(y => callback(null, y)).catch(e => callback(e))
      }
    })

    this.hash = new Transform({
      name: 'hash',
      concurrency: 4,
      push(x) {
        const { files, dirUUID, driveUUID, task } = x
        files.forEach((f) => {
          if (f.stat.isDirectory()) {
            this.outs.forEach(t => t.push(Object.assign({}, f, { dirUUID, driveUUID, task, type: 'folder' })))
          } else {
            this.pending.push(Object.assign({}, f, { dirUUID, driveUUID, task }))
            this.schedule()
          }
        })
      },
      transform: (x, callback) => {
        const { entry, dirUUID, driveUUID, stat, task } = x
        if (task.state !== 'uploading' && task.state !== 'diffing') task.state = 'hashing'
        readXattr(entry, (error, attr) => {
          if (!error && attr && attr.parts) {
            callback(null, { entry, dirUUID, driveUUID, parts: attr.parts, type: 'file', stat, task })
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
              callback(err, { entry, dirUUID, driveUUID, parts: xattr && xattr.parts, type: 'file', stat, task })
            })
          })
          child.on('error', callback)
        })
      }
    })

    this.diff = new Transform({
      name: 'diff',
      concurrency: 4,
      push(x) {
        if (x.type === 'folder' || x.task.isNew) {
          this.outs.forEach(t => t.push([x]))
        } else {
          /* combine to one post */
          const { dirUUID } = x
          const i = this.pending.findIndex(p => p[0].dirUUID === dirUUID)
          if (i > -1) {
            this.pending[i].push(x)
          } else {
            this.pending.push([x])
          }
          this.schedule()
        }
      },

      transform: (X, callback) => {
        debug('this.diff transform', X.length)
        const diffAsync = async (local, driveUUID, dirUUID, task) => {
          const listNav = await serverGetAsync(`drives/${driveUUID}/dirs/${dirUUID}`)
          const remote = listNav.entries
          if (!remote.length) return local
          const map = new Map()
          local.forEach(l => map.set(l.entry.replace(/^.*\//, ''), l))
          remote.forEach((r) => {
            if (map.has(r.name)) {
              task.finishCount += 1
              debug('this.diff transform find already finished', task.finishCount, r.name)
              task.completeSize += map.get(r.name).stat.size
              map.delete(r.name)
            }
          })
          return [...map.values()]
        }

        const { driveUUID, dirUUID, task } = X[0]
        if (task.state !== 'uploading') task.state = 'diffing'

        diffAsync(X, driveUUID, dirUUID, task).then(value => callback(null, value)).catch(callback)
      }
    })

    this.upload = new Transform({
      name: 'upload',
      concurrency: 4,
      push(X) {
        X.forEach((x) => {
          if (x.type === 'folder') {
            x.task.finishCount += 1
            this.root().emit('data', x)
          } else {
            /* combine to one post */
            const { dirUUID, uuid } = x
            const i = this.pending.findIndex(p => p.length < 10 && p[0].dirUUID === dirUUID && p[0].uuid === uuid)
            if (i > -1) {
              this.pending[i].push(x)
            } else {
              this.pending.push([x])
            }
          }
        })
        this.schedule()
      },
      transform: (X, callback) => {
        debug('upload transform start', X.length, X[0].entry)

        const Files = X.map((x) => {
          const { entry, parts, task } = x
          const name = entry.replace(/^.*\//, '')
          const readStreams = parts.map(part => fs.createReadStream(entry, { start: part.start, end: part.end, autoClose: true }))
          for (let i = 0; i < parts.length; i++) {
            const rs = readStreams[i]
            rs.on('data', (chunk) => {
              sendMsg()
              if (task.paused) return
              task.completeSize += chunk.length
            })
            rs.on('end', () => {
              // debug('readStreams end', entry)
              if (task.paused) return
              task.finishCount += 1
              if (task.finishCount === task.count) {
                task.finishDate = (new Date()).getTime()
                task.state = 'finished'
                clearInterval(task.countSpeed)
              }
              sendMsg()
            })
          }
          return ({ name, parts, readStreams })
        })

        const { driveUUID, dirUUID, task } = X[0]
        task.state = 'uploading'
        const handle = new UploadMultipleFiles(driveUUID, dirUUID, Files, (error) => {
          this.reqHandles.splice(this.reqHandles.indexOf(handle), 1)
          callback(error, { driveUUID, dirUUID, Files, task })
        })
        this.reqHandles.push(handle)
        handle.upload()
      }
    })

    this.readDir.pipe(this.hash).pipe(this.diff).pipe(this.upload)

    this.readDir.on('data', (x) => {
      const { dirUUID } = x
      getMainWindow().webContents.send('driveListUpdate', { uuid: dirUUID })
      if (x.type === 'folder') debug('done folder', x.name)
      if (x.Files) debug('done files:', x.Files.length, x.Files[0].name)
      sendMsg()
    })

    this.readDir.on('step', () => {
      // debug('===================================')
      // this.readDir.print()
    })
  }

  run() {
    this.countSpeed = setInterval(this.countSpeedFunc, 1000)
    this.readDir.push({ entries: this.entries, dirUUID: this.dirUUID, driveUUID: this.driveUUID, task: this })
  }

  status() {
    const { uuid, entries, dirUUID, driveUUID, taskType, createTime, isNew, completeSize, lastTimeSize, count,
      finishCount, finishDate, name, paused, restTime, size, speed, lastSpeed, state, trsType } = this
    return ({ uuid,
      entries,
      dirUUID,
      driveUUID,
      taskType,
      createTime,
      isNew,
      completeSize,
      lastTimeSize,
      count,
      finishCount,
      finishDate,
      name,
      paused,
      restTime,
      size,
      speed,
      lastSpeed,
      state,
      trsType })
  }

  pause() {
    if (this.paused) return
    this.paused = true
    this.readDir.clear()
    this.hash.clear()
    this.upload.clear()
    this.reqHandles.forEach(h => h.abort())
    clearInterval(this.countSpeed)
    sendMsg()
  }

  resume() {
    this.initStatus()
    this.isNew = false
    this.run()
    sendMsg()
  }
}

const createTask = (uuid, entries, dirUUID, driveUUID, taskType, createTime, isNew) => {
  const task = new Task({ uuid, entries, dirUUID, driveUUID, taskType, createTime, isNew })
  Tasks.push(task)
  task.run()
  sendMsg()
}

export { createTask }
