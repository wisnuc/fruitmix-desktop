import path from 'path'
import fs from 'fs'
import os from 'os'
import child_process from 'child_process'
import request from 'request'
import uuid from 'node-uuid'
import { ipcMain } from 'electron'

import { userTasks, finishTasks } from './newDownload'
import sendInfor from './transmissionUpdate'
import utils from './util'
import { serverGetAsync } from './server'
import store from '../serve/store/store'

Promise.promisifyAll(fs) // babel would transform Promise to bluebird

let server
let tokenObj
const httpRequestConcurrency = 4
const visitConcurrency = 2
let sendHandler = null

const runningQueue = []
const readyQueue = []
const visitlessQueue = []
const visitingQueue = []

const initArgs = () => {
  server = `http://${store.getState().login.device.mdev.address}:3000`
  tokenObj = store.getState().login.device.token.data
}

const getDownloadPath = () => store.getState().config.downloadPath

const getTransTmpPath = () => store.getState().config.tmpTransPath

// determine whether need to start/close sending msg
const sendMessage = () => {
  let shouldSend = false
  for (let i = 0; i < userTasks.length; i++) {
    if (userTasks[i].state !== 'pause') {
      shouldSend = true
      break
    }
  }
  if (shouldSend && !sendHandler) {
    console.log('开始发送传输信息')
    sendHandler = setInterval(sendMsg, 200)
    sendMsg()
  } else if (!shouldSend && sendHandler) {
    console.log('停止发送传输信息')
    clearInterval(sendHandler)
    sendHandler = null
    sendMsg()
  }
}

// send summary information to browser
const sendMsg = () => {
  sendInfor()
}

// TaskManager creater
// new job :init manager with default parameter
// old job :init manager with defined parameter(uuid, downloadpath, downloading information)
const createTask = (target, name, size, type, dirUUID, newWork, p, u, d, ct, driveUUID, rawName) => {
  initArgs()
  const taskUUID = u || uuid.v4()
  const abspath = p || getDownloadPath()
  const downloadingList = d || []
  const createTime = ct || (new Date()).getTime()
  const task = new TaskManager(taskUUID, abspath, target, name, size, type, dirUUID, newWork, downloadingList, createTime, driveUUID, rawName)
  task.createStore()
  userTasks.push(task)
  task.readyToVisit()
  sendMessage()
}


// a download task manager for init/record/visit/schedule
class TaskManager {
  constructor(taskUUID, downloadPath, target, name, rootSize, type, dirUUID, newWork, downloadingList, createTime, driveUUID, rawName) {
    this.uuid = taskUUID
    this.downloadPath = downloadPath
    this.target = target
    this.name = name
    this.rawName = rawName || name
    this.rootSize = rootSize // for visit
    this.type = type
    this.createTime = createTime
    this.dirUUID = dirUUID
    this.driveUUID = driveUUID
    this.newWork = newWork
    this.trsType = 'download'

    this.size = 0
    this.completeSize = 0
    this.lastTimeSize = 0 // for count speed
    this.speed = ''
    this.restTime = ''
    this.state = ''
    this.pause = false
    this.count = 0
    this.finishCount = 0
    this.finishDate = null
    this.finishTime = 0

    this.downloadIndex = 0
    this.tree = []
    this.worklist = []
    this.downloading = []
    this.downloadingList = downloadingList // for continue downloading
    this.record = []

    this.countSpe0ed = setInterval(() => {
      const s = (this.completeSize - this.lastTimeSize) / 2
      this.speed = `${utils.formatSize(s)}/s`
      this.restTime = utils.formatSeconds((this.size - this.completeSize) / s)
      this.lastTimeSize = this.completeSize
    }, 2000)
  }

  // summary send to browser
  getSummary() {
    return {
      uuid: this.uuid,
      downloadPath: this.downloadPath,
      type: this.type,
      name: this.name,
      size: this.size,
      completeSize: this.completeSize,
      count: this.count,
      finishCount: this.finishCount,
      restTime: this.restTime,
      finishDate: this.finishDate,
      trsType: this.trsType,
      state: this.state,
      pause: this.pause,
      speed: this.speed
    }
  }

  // record log information
  recordInfor(msg) {
    if (this.record.length > 50) this.record.splice(0, 20)
    console.log(msg)
    this.record.push(msg)
  }

  // add to visit queue && wait schedule
  readyToVisit() {
    this.state = 'visitless'
    addToVisitlessQueue(this)
  }

  // consist tree from server
  visit() {
    this.state = 'visiting'
    this.recordInfor('开始遍历文件树...')
    removeOutOfVisitlessQueue(this)
    addToVisitingQueue(this)
    visitTask(this.target, this.name, this.type, this.rootSize, this.dirUUID, this.tree, this, this.driveUUID, this.rawName)
      .then(() => {
        this.tree[0].downloadPath = this.downloadPath
        removeOutOfVisitingQueue(this)
        this.recordInfor('遍历文件树结束...')
        this.diff().catch(e => this.recordInfor('diff 出错！'))
      })
      .catch(err => {
        this.error(err, '遍历服务器数据出错')   
      })
  }

  // if task is new , check rootName isRepeat
  // if task is old , visit local file tree && diff the trees
  async diff() {
    this.state = 'diffing'
    if (!this.newWork) {
      let stat
      try {
        stat = await fs.lstatAsync(path.join(this.downloadPath, this.name))
      } catch (err) {
        this.recordInfor('没有找到已下载的文件, 从头开始下载')
        this.checkNameExist()
        this.pause = true
        return
      }
      if (stat.isFile()) {
        this.recordInfor('文件下载任务 继续下载文件')
        this.pause = true
        this.schedule()
      } else {
        this.recordInfor('文件夹下载任务 查找本地已下载文件信息')
        const localObj = []
        try {
          await visitLocalFiles(path.join(this.downloadPath, this.name), localObj)
        } catch(err) {
          this.recordInfor('校验本地文件出错')
          this.schedule()
          return
        }
        this.recordInfor('校验本地文件结束')
        try {
          await diffTree(this.tree[0], localObj[0], this)
        } catch(e) { this.recordInfor('diffTree error', e) }
        this.pause = true
        this.schedule()
      }
    } else {
      this.recordInfor('新任务 不需要与服务器进行比较, 检查文件名是否重复')
      this.checkNameExist()
    }
  }

  // check whether the root is same to someone in download path
  checkNameExist() {
    fs.readdir(this.downloadPath, (err, files) => {
      if (err) return this.recordInfor('下载目录未找到')
      const name = isFileNameExist(this.tree[0], 0, files)
      this.tree[0].name = name
      this.name = name
      this.updateStore()
      this.schedule()
    })
  }

  // pause all the task in downloading queue
  pauseTask() {
    if (this.pause) return
    this.pause = true
    this.downloading.forEach((work) => {
      if (work.type === 'file') work.pause()
    })
  }

  // resume all the task in downloading queue
  resumeTask() {
    if (!this.pause) return
    this.pause = false
    this.downloading.forEach((work) => {
      if (work.type === 'file') work.resume()
    })
    this.schedule()
  }

  // download schedule only need to schedule download queue(upload include hash task)
  schedule() {
    this.state = 'schedule'
    if (this.pause || !this.count) return
    this.downloadSchedule()
  }

  // the file for condition begin downloading
  downloadSchedule() {
    console.log('')
    console.log('进行下载调度...')
    if (this.pause) return this.recordInfor('下载任务已暂停')
    if (this.finishCount === this.worklist.length) return this.recordInfor('文件全部下载结束')
    if (this.downloading.length >= 2) return this.recordInfor('任务下载队列已满')
    if (this.downloadIndex === this.worklist.length) return this.recordInfor('所有文件下载调度完成')
    this.recordInfor(`正在调度第 ${this.downloadIndex + 1} 个文件,总共 ${this.worklist.length} 个`)
    const _this = this
    const obj = this.worklist[this.downloadIndex]
    if (obj.stateName === 'finish') {
      this.recordInfor('文件已被下载，跳过...')
      this.downloadIndex += 1
      return this.downloadSchedule()
    }
    if (obj.downloadPath === '') return this.recordInfor('文件的父文件夹尚未创建，缺少目标，等待..')
    obj.setState(obj.type === 'directory' ? createFolderSTM : DownloadFileSTM)
    this.downloading.push(obj)
    this.downloadIndex += 1
    obj.requestProbe()
    this.downloadSchedule()
  }

  // will be call when a node was downloaded
  workFinishCall() {
    // all nodes have been downloaded
    if (this.finishCount === this.worklist.length) {
      this.state = 'finish'
      this.finishDate = (new Date()).getTime()
      userTasks.splice(userTasks.indexOf(this), 1)
      finishTasks.unshift(this)
      clearInterval(this.countSpeed)
      sendMessage()
      this.recordInfor(`${this.name} 下载完成`)
      this.finishStore()
    } else {
      // running next
      this.updateStore()
      this.downloadSchedule()
    }
  }

  getStoreObj() {
    const downloadingArr = []
    this.downloading.forEach((item) => {
      if (item.type === 'file') {
        downloadingArr.push(item.getSummary())
      }
    })
    return {
      _id: this.uuid,
      downloadPath: this.downloadPath,
      target: this.target,
      driveUUID: this.driveUUID,
      name: this.name,
      rawName: this.rawName,
      rootSize: this.rootSize,
      type: this.type,
      dirUUID: this.dirUUID,
      downloading: downloadingArr,
      finishDate: this.finishDate,
      createTime: this.createTime,
      trsType: this.trsType
    }
  }

  // will be call when a task is new
  createStore() {
    if (!this.newWork) return
    db.downloading.insert(this.getStoreObj(), (err, data) => {})
  }

  // will be call when a task node drain trigger
  updateStore() {
    const downloadingArr = []
    this.downloading.forEach((item) => {
      if (item.type === 'file') {
        downloadingArr.push(item.getSummary())
      }
    })
    db.downloading.update({ _id: this.uuid }, { $set: { name: this.name, downloading: downloadingArr } }, (err, data) => {
      // console.log(data)
    })
  }

  // move task from downloading store to downloaded store
  finishStore() {
    db.downloading.remove({ _id: this.uuid }, {}, (err, data) => {
      if (err) return console.log(err)
    })

    db.downloaded.insert(this.getStoreObj(), (err, data) => {
      if (err) return console.log(err)
      // console.log(data)
    })
  }

  // remove task from taskList && nedb
  delete(callback) {
    if (this.state === 'finish') {
      this.recordInfor('开始删除已完成传输任务...')
      callback('finish', this.uuid)
    } else {
      this.recordInfor('开始删除正在下载任务...')
      this.pauseTask()
      this.recordInfor('暂停了下载任务')
      this.removeCache(callback.bind(this, 'running', this.uuid))
    }
  }

  async removeCache(callback) {
    const del = p => new Promise((resolve, reject) => {
      fs.unlink(p, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })

    while (this.downloading.length) {
      console.log('开始删除缓存...')
      if (this.downloading[0].type === 'folder') {
        this.downloading.shift()
      } else {
        const tmpPath = path.join(getTransTmpPath(), this.uuid +
          this.downloading[0].timeStamp +
          this.downloading[0].name)
        try { await del(tmpPath) } catch (e) { console.log(`删除缓存${tmpPath}失败`) } finally { this.downloading.shift() }
      }
    }
    const osType = os.platform()

    switch (osType) {
      case 'win32':
        var order = `rd/s/q ${path.join(this.downloadPath, this.name)}`
        child_process.exec(order)
        break
      default:
        var order = `rm -rf ${path.join(this.downloadPath, this.name)}`
        child_process.exec(order)
        break
    }

    callback()
  }

  error(e, message) {
    this.state = 'failed'
    this.Error = e
    console.log(e)
    this.recordInfor(message)
  }
}

// visit tree from serve && check the seek of downloading files
const visitTask = async (target, name, type, size, dirUUID, position, manager, driveUUID, rawName) => {
  manager.count += 1
  manager.size += size
  /*
  console.log('============')
  console.log(target, name, type, size, dirUUID, driveUUID, rawName)
  console.log('============')
  */
  const obj = type === 'file' ?
    new FileDownloadTask(target, name, type, size, dirUUID, manager, driveUUID, rawName) :
    new FolderDownloadTask(target, name, type, size, dirUUID, manager, driveUUID, rawName)

  const index = manager.downloadingList.findIndex(item => item.target === target)
  if (index !== -1) {
    obj.seek = manager.downloadingList[index].seek
    obj.timeStamp = manager.downloadingList[index].timeStamp
    manager.completeSize += manager.downloadingList[index].seek
  }
  manager.worklist.push(obj)
  position.push(obj)
  if (type === 'file') return
  const data = await serverGetAsync(`drives/${driveUUID}/dirs/${target}`)
  const tasks = data.entries
  tasks.forEach(t => (t.rawName = t.name))
  if (!tasks.length) return
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    await visitTask(task.uuid, task.name, task.type, task.size ? task.size : 0, target, obj.children, manager, driveUUID, task.rawName)
  }
}

// visit local files
const visitLocalFiles = async (abspath, position) => {
  const stat = await fs.statAsync(abspath)
  if (!stat.isDirectory() && !stat.isFile()) throw Error('not Directory or File')
  const type = stat.isDirectory() ? 'folder' : 'file'
  const obj = { name: path.basename(abspath), type, children: [] }
  position.push(obj)
  if (stat.isFile()) return
  const entries = await fs.readdirAsync(abspath)
  for (let i = 0; i < entries.length; i++) {
    await visitLocalFiles(path.join(abspath, entries[i]), obj.children)
  }
}

// diff server file tree && local file tree
// mark the node has been finished
const diffTree = async (taskPosition, localPosition, manager) => {
  console.log(taskPosition)
  console.log('========')
  console.log('========')
  console.log(localPosition)
  if (taskPosition.name !== localPosition.name) return
  taskPosition.stateName = 'finish'
  manager.finishCount += 1
  manager.completeSize += taskPosition.size ? taskPosition.size : 0
  if (taskPosition.type === 'file') return
  const children = taskPosition.children
  if (!children.length) return
  children.forEach(item => item.downloadPath = path.join(taskPosition.downloadPath, taskPosition.name))
  for (let i = 0; i< children.length; i++){
    const currentObj = taskPosition.children[i]
    const index = localPosition.children.findIndex(item => item.name === currentObj.name)
    if (index !== -1) {
      await diffTree(currentObj, localPosition.children[index], manager)
    }
  }
}

// check the name isExist in download folder
// if name exist, rename the root file
const isFileNameExist = (position, times, list) => {
  let name = ''
  if (times === 0) {
    name = position.name
  } else {
    const arr = position.name.split('.')
    if (arr.length === 1) name = `${arr[0]}(${times})`
    else {
      arr[arr.length - 2] += `(${times})`
      name = arr.join('.')
    }
  }
  const index = list.findIndex(item => item === name)
  if (index === -1) {
    console.log(`文件名是 : ${name}`)
    return name
  }
  times += 1
  return isFileNameExist(position, times, list)
}

// Each instance is a fileNode of tree
class DownloadTask {
  constructor(target, name, type, size, dirUUID, manager, driveUUID, rawName) {
    this.target = target
    this.name = name
    this.type = type
    this.size = size
    this.dirUUID = dirUUID
    this.driveUUID = driveUUID
    this.rawName = rawName
    this.manager = manager

    this.downloadPath = ''
    this.state = null
    this.stateName = ''
  }

  setState(NextState) {
    this.state = new NextState(this)
  }

  requestProbe() {
    this.state.requestProbe()
  }

  downloadFinish() {
    const manager = this.manager
    this.recordInfor(`${this.name} 下载完毕`)
    this.state = null
    this.stateName = 'finish'
    manager.downloading.splice(manager.downloading.indexOf(this), 1)
    manager.finishCount += 1
    manager.workFinishCall()
  }

  recordInfor(msg) {
    this.manager.recordInfor(msg)
  }

  pause() {
    this.state.pause()
  }

  resume() {
    this.state.resume()
  }
}

class FileDownloadTask extends DownloadTask {
  constructor(target, name, type, size, dirUUID, manager, driveUUID, rawName) {
    super(target, name, type, size, dirUUID, manager, driveUUID, rawName)
    this.progress = 0
    this.seek = 0
    this.lastTimeSize = 0
    this.timeStamp = (new Date()).getTime()
  }

  getSummary() {
    return {
      name: this.name,
      target: this.target,
      downloadPath: this.downloadPath,
      seek: this.seek,
      timeStamp: this.timeStamp
    }
  }
}

class FolderDownloadTask extends DownloadTask {
  constructor(target, name, type, size, dirUUID, manager, driveUUID, rawName) {
    super(target, name, type, size, dirUUID, manager, driveUUID, rawName)
    this.children = []
  }
}

class STM {
  constructor(wrapper) {
    this.wrapper = wrapper
  }

  requestProbe() {
    this.wrapper.stateName = 'ready'
    addToReadyQueue(this)
  }

  destructor() {
  }
}

class createFolderSTM extends STM {
  constructor(wrapper) {
    super(wrapper)
    this.handle = null
    this.paused = false
  }

  beginDownload() {
    const wrapper = this.wrapper
    wrapper.stateName = 'running'
    removeOutOfReadyQueue(this)
    addToRunningQueue(this)
    wrapper.recordInfor(`${wrapper.name} 开始创建...`)
    fs.mkdir(path.join(wrapper.downloadPath, wrapper.name), (err) => {
      if (!err) {
        removeOutOfRunningQueue(this)
        wrapper.children.forEach(item => item.downloadPath = path.join(wrapper.downloadPath, wrapper.name))
        wrapper.downloadFinish()
      }
    })
  }
}

class DownloadFileSTM extends STM {
  constructor(wrapper) {
    super(wrapper)
    this.handle = null
    this.tmpDownloadPath = path.join(getTransTmpPath(), wrapper.manager.uuid + wrapper.timeStamp + wrapper.name)
  }

  beginDownload() {
    if (this.paused) return
    this.wrapper.stateName = 'running'
    removeOutOfReadyQueue(this)
    addToRunningQueue(this)
    this.wrapper.manager.updateStore()
    this.wrapper.recordInfor(`${this.wrapper.name} 开始创建...`)
    // check is fileCache have been removed
    fs.exists(this.tmpDownloadPath, (exist) => {
      if (exist) console.log('找到文件缓存')
      else {
        console.log('没有找到文件缓存 重新下载该文件')
        this.wrapper.manager.completeSize -= this.wrapper.seek
        this.wrapper.seek = 0
      }
      this.downloading()
    })
  }

  downloading() {
    const wrapper = this.wrapper
    console.log('in downloading...')
    // console.log(wrapper)
    console.log(wrapper.name)

    if (wrapper.size === wrapper.seek && wrapper.size !== 0) return wrapper.manager.downloadSchedule()

    const options = {
      method: 'GET',
      url: wrapper.dirUUID === 'media'
      ? `${server}/media/${wrapper.target}`
      : `${server}/drives/${wrapper.driveUUID}/dirs/${wrapper.dirUUID}/entries/${wrapper.target}`,

      headers: {
        Authorization: `${tokenObj.type} ${tokenObj.token}`,
        Range: wrapper.size ? `bytes=${this.wrapper.seek}-` : undefined
      },
      qs: wrapper.dirUUID === 'media' ? { alt: 'data' } : { name: wrapper.rawName }
    }

    const streamOptions = {
      flags: this.wrapper.seek === 0 ? 'w' : 'r+',
      start: this.wrapper.seek,
      defaultEncoding: 'utf8',
      fd: null,
      mode: 0o666,
      autoClose: true
    }
    const stream = fs.createWriteStream(this.tmpDownloadPath, streamOptions)

    stream.on('error', err => console.log('stream error trigger', err))

    stream.on('drain', () => {
      const gap = stream.bytesWritten - this.wrapper.lastTimeSize
      this.wrapper.seek += gap
      this.wrapper.manager.completeSize += gap
      this.wrapper.lastTimeSize = stream.bytesWritten
      wrapper.manager.updateStore()
    })

    stream.on('finish', () => {
      const gap = stream.bytesWritten - this.wrapper.lastTimeSize
      this.wrapper.seek += gap
      this.wrapper.manager.completeSize += gap
      this.wrapper.lastTimeSize = stream.bytesWritten

      console.log(`一段文件写入结束 当前seek位置为 ：${this.wrapper.seek}, 共${this.wrapper.size}`)

      this.wrapper.lastTimeSize = 0
      if (this.wrapper.seek >= this.wrapper.size) this.rename(this.tmpDownloadPath)
    })

    this.handle = request(options)
    this.handle.on('end', (error, response, body) => {
      // console.log(error, response, body)
      if (error || (response && response.statusCode && (response.statusCode !== 200 && response.statusCode !== 206))) {
        console.log('req:', error, response && response.statusCode, this.wrapper.manager.type)
        if (this.wrapper.manager.type === 'file') {
          this.wrapper.manager.error(error, body)
        }
      }
    })

    this.handle.pipe(stream)
  }

  rename(oldPath) {
    const _this = this
    const wrapper = this.wrapper
    fs.rename(oldPath, path.join(wrapper.downloadPath, wrapper.name), (err, data) => {
      removeOutOfRunningQueue(_this)
      _this.wrapper.downloadFinish()
    })
  }

  pause() {
    this.wrapper.recordInfor(`${this.wrapper.name} pause, stateName: ${this.wrapper.stateName} readyQueue: ${readyQueue.length}`)
    this.paused = true
    if (this.wrapper.stateName !== 'running') return
    this.wrapper.stateName = 'pause'
    sendMsg()
    if (this.handle) this.handle.abort()
    this.wrapper.recordInfor(`${this.wrapper.name}暂停了`)
    this.timehandle = setTimeout(() => removeOutOfRunningQueue(this), 10) // it's necessary when pausing lots of tasks at the same time
  }

  resume() {
    //  this.wrapper.recordInfor(`${this.wrapper.name} reusme, stateName: ${this.wrapper.stateName}`)
    if (this.timehandle) clearTimeout(this.timehandle)
    this.paused = false
    if (this.wrapper.stateName !== 'pause') return
    this.wrapper.stateName = 'running'
    if (runningQueue.length < httpRequestConcurrency) {
      sendMsg()
      this.beginDownload()
      this.wrapper.recordInfor(`${this.wrapper.name}继续下载`)
    }
  }
}

const scheduleVisit = () => {
  while (visitlessQueue.length < visitConcurrency && visitlessQueue.length) { visitlessQueue[0].visit() }
}

const scheduleHttpRequest = () => {
  while (runningQueue.length < httpRequestConcurrency && readyQueue.length && !readyQueue[0].paused) { readyQueue[0].beginDownload() }
}

// visitless
const addToVisitlessQueue = (task) => {
  visitlessQueue.push(task)
  scheduleVisit()
}

const removeOutOfVisitlessQueue = (task) => {
  visitlessQueue.splice(visitlessQueue.indexOf(task), 1)
}

// visiting
const addToVisitingQueue = (task) => {
  visitingQueue.push(this)
}

const removeOutOfVisitingQueue = (task) => {
  const index = visitingQueue.indexOf(task)
  if (index > -1) visitingQueue.splice(index, 1)
  scheduleVisit()
}

// ready
const addToReadyQueue = (task) => {
  readyQueue.push(task)
  scheduleHttpRequest()
}

const removeOutOfReadyQueue = (task) => {
  const index = readyQueue.indexOf(task)
  if (index > -1) readyQueue.splice(index, 1)
}

// running
const addToRunningQueue = (task) => {
  runningQueue.push(task)
}

const removeOutOfRunningQueue = (task) => {
  const index = runningQueue.indexOf(task)
  if (index > -1) runningQueue.splice(index, 1)
  scheduleHttpRequest()
}

ipcMain.on('PAUSE_DOWNLOADING', (e, uuid) => {
  if (!uuid) return
  const task = userTasks.find(item => item.uuid === uuid)
  if (task) { task.pauseTask() }
})

ipcMain.on('RESUME_DOWNLOADING', (e, uuid) => {
  if (!uuid) return
  const task = userTasks.find(item => item.uuid === uuid)
  if (task) task.resumeTask()
})

export default createTask

export { sendMsg }
