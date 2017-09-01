import store from '../serve/store/store'

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const childProcess = require('child_process')
const debug = require('debug')('node:lib:applyTransform:')
const request = require('request')

const Transform = require('./transform')
const { readXattr, setXattr } = require('./xattr')
const { createFoldAsync } = require('./server')
const { Tasks, sendMsg } = require('./transmissionUpdate')


/* init request */
let server
let tokenObj
let Authorization
const initArgs = () => {
  server = `http://${store.getState().login.device.mdev.address}:3000`
  tokenObj = store.getState().login.device.token.data
  Authorization = `${tokenObj.type} ${tokenObj.token}`
}

/* return a new file name */
const getName = async (currPath, dirUUID, driveUUID) => currPath.replace(/^.*\//, '') // TODO

/* Transform must be an asynchronous function !!! */
const task = new Transform({
  name: 'task',
  concurrency: 10240,
  transform(x, callback) {
    const { taskUUID, entry, dirUUID, driveUUID, taskType, createTime, newWork } = x
    const taskStatus = {
      abspath: entry,
      completeSize: 0,
      count: 0,
      finishCount: 0,
      finishDate: '',
      name: entry.replace(/^.*\//, ''),
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
      callback(null, { entries: [entry], dirUUID, driveUUID, taskStatus })
    })
  }
})

const readDir = new Transform({
  name: 'readDir',
  concurrency: 4,
  transform(x, callback) {
    const read = async (entries, dirUUID, driveUUID, taskStatus) => {
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]
        const stat = await fs.lstatAsync(path.resolve(entry))
        taskStatus.count += 1
        if (taskStatus.type === 'file') taskStatus.size = stat.size
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
        }
        callback(null, { entry, dirUUID, driveUUID, stat, taskStatus })
      }
    }
    const { entries, dirUUID, driveUUID, taskStatus } = x
    read(entries, dirUUID, driveUUID, taskStatus).catch(e => callback(e))
  }
})

const hash = new Transform({
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

const upload = new Transform({
  name: 'upload',
  concurrency: 4,
  push(x) {
    if (x.type === 'folder') {
      this.root().emit('data', x)
    } else {
      this.pending.push(x)
      this.schedule()
    }
  },
  /* targets: array of taskUUIDs which need to be aborted */
  abort(targets) {
    if (targets && targets.length) {
      const aborted = []
      targets.forEach((t) => {
        const index = this.working.findIndex(x => x.taskStatus && x.taskStatus.uuid === t)
        if (index > -1) {
          const x = this.working[index]
          if (x.taskStatus) x.taskStatus.pause = true
          if (x.abort) {
            debug('abort', x.taskStatus.abspath)
            x.abort()
            this.working.splice(index, 1)
            aborted.push(x)
          }
        }
      })
      this.pending.unshift(...aborted)
    }
  },

  delete(targets) {
    debug('delete', targets)
    if (targets && targets.length) {
      targets.forEach((t) => {
        let index = this.pending.findIndex(x => x.taskStatus && x.taskStatus.uuid === t)
        if (index > -1) {
          this.pending.splice(index, 1)
        } else {
          index = this.working.findIndex(x => x.taskStatus && x.taskStatus.uuid === t)
          if (index > -1) this.working.splice(index, 1)
        }
      })
    }
  },

  transform: (x, callback) => {
    const { entry, dirUUID, driveUUID, type, parts, taskStatus } = x
    taskStatus.state = 'uploading'
    initArgs()
    const name = entry.replace(/^.*\//, '')
    const readStreams = parts.map(part => fs.createReadStream(entry, { start: part.start, end: part.end, autoClose: true }))
    const op = {
      url: `${server}/drives/${driveUUID}/dirs/${dirUUID}/entries`,
      headers: { Authorization }
    }

    const handle = request.post(op, (error, response, body) => {
      if (error) return callback(error)
      if (response && response.statusCode === 200) return callback(null, { entry, dirUUID, driveUUID, type, parts, taskStatus })
      debug(error, response && response.statusCode, body)
      return callback(Error('respose not 200'))
    })
    const form = handle.form()
    x.abort = () => {
      handle.abort()
    }

    for (let i = 0; i < parts.length; i++) {
      const rs = readStreams[i]
      rs.on('data', (chunk) => {
        sendMsg()
        if (taskStatus.pause) {
          taskStatus.completeSize = 0
          return
        }
        taskStatus.completeSize += chunk.length
      })
      const part = parts[i]
      let formDataOptions = {
        size: part.end ? part.end - part.start + 1 : 0,
        sha256: part.sha
      }
      debug('formDataOptions', i, formDataOptions.size)
      if (part.start) formDataOptions = Object.assign(formDataOptions, { append: part.fingerprint })
      form.append(name, rs, JSON.stringify(formDataOptions))
    }
  }
})

task.pipe(readDir).pipe(hash).pipe(upload)

task.on('data', (x) => {
  x.taskStatus.finishCount += 1
  if (x.taskStatus.finishCount === x.taskStatus.count) {
    x.taskStatus.finishDate = (new Date()).getTime()
    x.taskStatus.state = 'finished'
  }
  debug('done:', x.taskStatus.abspath)
  sendMsg()
})

task.on('step', () => {
  // debug('===================================')
  // task.print()
})

const createTask = (taskUUID, entry, dirUUID, driveUUID, taskType, createTime, newWork) => {
  task.push({ taskUUID, entry, dirUUID, driveUUID, taskType, createTime, newWork })
}

const forceSchedule = () => upload.schedule()

const abortTask = targets => upload.abort(targets)

export { createTask, forceSchedule, abortTask }
