const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const childProcess = require('child_process')
const debug = require('debug')('node:lib:applyTransform:')

const { getMainWindow } = require('../window')
const Transform = require('./transform')
const { readXattr, setXattr } = require('../xattr')
const { createFoldAsync, uploadFileWithStreamAsync } = require('../server')

/* return a new file name */
const getName = async (currPath, dirUUID, driveUUID) => currPath.replace(/^.*\//, '') // TODO

/* send message */
let preLength = 0
let lock = false
let last = true

const Tasks = []
const sendMsg = () => {
  if (lock || !last) return (last = true)
  lock = true
  const userTasks = []
  const finishTasks = []
  Tasks.forEach((task) => {
    if (task.state === 'finished') {
      finishTasks.push(task)
    } else {
      userTasks.push(task)
    }
  })
  userTasks.sort((a, b) => a.createTime - b.createTime) // Ascending
  finishTasks.sort((a, b) => b.finishDate - a.finishDate) // Descending

  /* send message when all tasks finished */
  if (preLength !== 0 && userTasks.length === 0) {
    getMainWindow().webContents.send('snackbarMessage', { message: '文件传输任务完成' })
  }
  preLength = userTasks.length

  /* Error: Object has been destroyed */
  try {
    debug('sendMsg', userTasks.length, finishTasks.length)
    getMainWindow().webContents.send('UPDATE_TRANSMISSION', [...userTasks], [...finishTasks])
  } catch (error) {
    console.error(error)
  }
  setTimeout(() => { lock = false; sendMsg() }, 200)
  return (last = false)
}

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
    callback(null, { entries: [entry], dirUUID, driveUUID, taskStatus })
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
  transform: (x, callback) => {
    const { entry, dirUUID, driveUUID, stat, taskStatus } = x
    taskStatus.state = 'hashing'
    if (!stat.isDirectory()) {
      readXattr(entry, (error, attr) => {
        if (!error && attr && attr.parts) {
          callback(null, { entry, dirUUID, driveUUID, parts: attr.parts, type: 'file', taskStatus })
          return
        }
        const options = {
          env: { absPath: entry, size: stat.size, partSize: 1024 * 1024 * 1204 },
          encoding: 'utf8',
          cwd: process.cwd()
        }
        const child = childProcess.fork(path.join(__dirname, '../filehash'), [], options)
        child.on('message', (result) => {
          setXattr(entry, result, (err, xattr) => {
            callback(err, { entry, dirUUID, driveUUID, parts: xattr.parts, type: 'file', taskStatus })
          })
        })
        child.on('error', callback(error))
      })
      return
    }
    callback(null, { entry, dirUUID, driveUUID, type: 'folder', taskStatus })
  }
})

const upload = new Transform({
  name: 'upload',
  concurrency: 4,
  transform: (x, callback) => {
    const uploadFileAsync = async (entry, dirUUID, driveUUID, type, parts, taskStatus) => {
      const name = await getName(entry, dirUUID, driveUUID)
      const readStreams = parts.map(part => fs.createReadStream(entry, { start: part.start, end: part.end, autoClose: true }))
      for (let i = 0; i < parts.length; i++) {
        const rs = readStreams[i]
        rs.on('data', (chunk) => {
          taskStatus.completeSize += chunk.length
        })
        await uploadFileWithStreamAsync(driveUUID, dirUUID, name, parts[i], rs)
      }
      callback(null, { entry, dirUUID, driveUUID, type, parts, taskStatus })
    }
    const { entry, dirUUID, driveUUID, type, parts, taskStatus } = x
    taskStatus.state = 'uploading'
    if (type === 'file') {
      uploadFileAsync(entry, dirUUID, driveUUID, type, parts, taskStatus).catch(e => callback(e))
      return
    }
    callback(null, { entry, dirUUID, driveUUID, type, parts, taskStatus })
  }
})

const done = new Transform({
  name: 'done',
  transform: (x, callback) => {
    x.taskStatus.finishCount += 1
    if (x.taskStatus.finishCount === x.taskStatus.count) {
      x.taskStatus.finishDate = (new Date()).getTime()
      x.taskStatus.state = 'finished'
    }
    debug('done:', x.taskStatus)
    sendMsg()
    callback(null, x)
  },
  isBlocked: () => false
})

task.pipe(readDir).pipe(hash).pipe(upload).pipe(done)

const createTask = (taskUUID, entry, dirUUID, driveUUID, taskType, createTime, newWork) => {
  task.push({ taskUUID, entry, dirUUID, driveUUID, taskType, createTime, newWork })
}

task.on('step', sendMsg)

export { createTask }
