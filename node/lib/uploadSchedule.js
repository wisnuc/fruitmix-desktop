const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const UUID = require('uuid')
const Debug = require('debug')
const { createFoldAsync, uploadFileWithStreamAsync } = require('./server')
const { UploadFileTask, CreateFoldTask, HashFileTask } = require('./taskCreater')

const debug = Debug('node:lib:uploadSchedule: ')

Promise.promisifyAll(fs) // babel would transform Promise to bluebird

/* return a new file name */
const getName = async (currPath, dirUUID, driveUUID) => {
  return currPath.replace(/^.*\//, '') // TODO
}


/* spliceFile -> hashFile -> calcFingerprint -> upload */
const uploadFileAsync = async (filePath, dirUUID, driveUUID, stat) => {
  const parts = spliceFile(stat.size, 1024 * 1024 * 1024)

  const promises = parts.map(part => hashFile(filePath, part))
  const hashs = await Promise.all(promises)
  const fp = calcFingerprint(hashs)
  const newParts = parts.map((part, index) => Object.assign({}, part, { sha: hashs[index], fingerprint: fp[index] }))

  const name = await getName(filePath, dirUUID, driveUUID)
  const readStreams = newParts.map(part => fs.createReadStream(filePath, { start: part.start, end: part.end, autoClose: true }))
  for (let i = 0; i < newParts.length; i++) {
    await uploadFileWithStreamAsync(driveUUID, dirUUID, name, newParts[i], readStreams[i])
  }
}

/* create fold and return the uuid */
const creatFoldAsync = async (foldPath, dirUUID, driveUUID) => {
  const dirname = await getName(foldPath, dirUUID, driveUUID)
  const entries = await createFoldAsync(driveUUID, dirUUID, dirname)
  if (!entries) return null
  const uuid = entries.find(entry => entry.name === dirname).uuid
  return uuid
}

/* readUploadInfo and uploadTaskAsync would visit list of directories or files recursively */
const uploadTaskAsync = async (entry, dirUUID, driveUUID) => {
  const stat = await fs.lstatAsync(path.resolve(entry))
  if (stat.isDirectory()) {
    const children = await fs.readdirAsync(path.resolve(entry))
    const uuid = await creatFoldAsync(entry, dirUUID, driveUUID)
    const newEntries = []
    children.forEach(c => newEntries.push(path.join(entry, c)))
    await readUploadInfo(newEntries, uuid, driveUUID)
  } else {
    await uploadFileAsync(entry, dirUUID, driveUUID, stat)
  }
}

/*
 taskStat { uuid, createTime }
 */

const userTasks = []
const uploadQueue = []
const hashQueue = []

const visitEntries = async (entries, position, dirUUID, driveUUID, workList, Task) => {
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const stat = await fs.lstatAsync(path.resolve(entry))
    if (stat.isDirectory()) {
      const children = await fs.readdirAsync(path.resolve(entry))

      const newWork = new CreateFoldTask(entry, dirUUID, driveUUID, stat, Task)
      workerList.push(newWork)
      position.push(newWork)

      const newEntries = []
      children.forEach(c => newEntries.push(path.join(entry, c)))

      await visitEntries(newEntries, newWork.chilren, null, driveUUID)

    } else {
      const newWorker = new UploadFileTask(entry, dirUUID, driveUUID, stat, Task)
      workerList.push(uploadWorker)
      position.push(newWorker)
    }
  }
}

class Task {
  constructor(entry, dirUUID, driveUUID, entryStat, taskType, taskStat) {
    this.entry = entry
    this.dirUUID = dirUUID
    this.driveUUID = driveUUID
    this.entryStat = entryStat
    this.taskType = taskType
    this.taskStat = taskStat

    this.parts = null
    this.workerList = []

    this.name = this.entry.replace(/^.*\//, '')

    this.uploadFile = () => {
      if (!this.parts) return
      const readStreams = this.parts.map(part => fs.createReadStream(this.entry, { start: part.start, end: part.end }))
      const uploadWork = new UploadFileTask(this.dirUUID, this.driveUUID, this.name, this.parts, readStreams)
      uploadWork.on('error', error => this.error(error))
      uploadWork.on('finish', () => this.schedule())
      this.workerList.push(uploadWork)
    }

    this.hashFile = () => {
      if (this.parts) return
      const hashWork = new HashFileTask(entry, entryStat)
      hashWork.on('error', error => this.error(error))
      hashWork.on('finish', parts => { this.parts = parts; this.schedule() })
      this.workerList.push(hashWork)
    }

  }

  /* spliceFile -> hashFile -> calcFingerprint -> upload */

  schedule () {
    this.hashFile()
    this.uploadFile()
  }

  error(error) {
    debug('error', error)
  }

  run () {
    debug('run...')
    visitEntries([this.entry], this.dirUUID, this.driveUUID, this.workList, this).then(this.schedule).catch(e => debug('error:', e))
  }

  pause() {
  }

  resume() {
  }

  abort() {
  }

  finish(){
    debug('finish success')
  }
}

const createTask = (entry, dirUUID, driveUUID, entryStat, taskType, taskStat) => {
  // debug('createTask', entry, dirUUID, driveUUID, entryStat, taskType, taskStat)
  const task = new Task(entry, dirUUID, driveUUID, entryStat, taskType, taskStat)
  userTasks.push(task)
  task.run()
  return task
}

const readUploadInfo = async (entries, dirUUID, driveUUID) => {
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const entryStat = await fs.lstatAsync(path.resolve(entry))
    const taskStat = { uuid: UUID.v4(), createTime: (new Date()).getTime() }
    const taskType = entryStat.isDirectory() ? 'fold' : 'file'
    createTask(entry, dirUUID, driveUUID, entryStat, taskType, taskStat)
  }
}

export { readUploadInfo }
