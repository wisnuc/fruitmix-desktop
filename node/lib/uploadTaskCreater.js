import path from 'path'
import fs from 'fs'
import childProcess from 'child_process'
import request from 'request'
import Debug from 'debug'
import { serverGetAsync, uploadFileWithStream, createFold } from './server'
import { getMainWindow } from './window'
import utils from './util'
import { userTasks, finishTasks } from './newUpload'
import sendInfor from './transmissionUpdate'
import { readXattr, setXattr } from './xattr'
import store from '../serve/store/store'

const debug = Debug('node:lib:uploadTaskCreater: ')
const partSize = 1073741824

const httpRequestConcurrency = 4
const fileHashConcurrency = 6
const visitConcurrency = 2

const runningQueue = []
const readyQueue = []
const hashingQueue = []
const hashlessQueue = []
const visitlessQueue = []
const visitingQueue = []

const scheduleHttpRequest = () => {
  while (runningQueue.length < httpRequestConcurrency && readyQueue.length && !readyQueue[0].paused) { readyQueue[0].beginUpload() }
}

const scheduleFileHash = () => {
  while (hashingQueue.length < fileHashConcurrency && hashlessQueue.length) { hashlessQueue[0].hashing() }
}

const scheduleVisit = () => {
  while (visitlessQueue.length < visitConcurrency && visitlessQueue.length) { visitlessQueue[0].visit() }
}

/* visitless */
const addToVisitlessQueue = (task) => {
  visitlessQueue.push(task)
  scheduleVisit()
}

const removeOutOfVisitlessQueue = (task) => {
  const index = visitlessQueue.indexOf(task)
  if (index > -1) visitlessQueue.splice(index, 1)
}

/* visiting */
const addToVisitingQueue = (task) => {
  visitingQueue.push(this)
}

const removeOutOfVisitingQueue = (task) => {
  const index = visitingQueue.indexOf(task)
  if (index > -1) visitingQueue.splice(index, 1)
  scheduleVisit()
}

/* hashless */
const addToHashlessQueue = (task) => {
  hashlessQueue.push(task)
  scheduleFileHash()
}

const removeOutOfHashlessQueue = (task) => {
  const index = hashlessQueue.indexOf(task)
  if (index > -1) hashlessQueue.splice(index, 1)
}

/* hashing */
const addToHashingQueue = (task) => {
  hashingQueue.push(task)
}

const removeOutOfHashingQueue = (task) => {
  const index = hashingQueue.indexOf(task)
  if (index > -1) hashingQueue.splice(index, 1)
  scheduleFileHash()
}

/* ready */
const addToReadyQueue = (task) => {
  readyQueue.push(task)
  scheduleHttpRequest()
}

const removeOutOfReadyQueue = (task) => {
  const index = readyQueue.indexOf(task)
  if (index > -1) readyQueue.splice(index, 1)
}


/* running */
const addToRunningQueue = (task) => {
  runningQueue.push(task)
}

const removeOutOfRunningQueue = (task) => {
  const index = runningQueue.indexOf(task)
  if (index > -1) runningQueue.splice(index, 1)
  scheduleHttpRequest()
}

/* sendMessage */
const sendMsg = () => {
  sendInfor()
}

let sendHandler = null
const sendMessage = () => {
  let shouldSend = false
  userTasks.forEach((t) => {
    if (!t.pause) {
      shouldSend = true
    }
  })

  if (shouldSend && !sendHandler) {
    debug('开始发送传输信息')
    sendHandler = setInterval(sendMsg, 200)
    sendMsg()
  } else if (!shouldSend && sendHandler) {
    debug('停止发送传输信息')
    clearInterval(sendHandler)
    sendHandler = null
    sendMsg()
  }
}

/* visit Folder recursively, count file number and sum size, create worklist */
const visitFolderAsync = async (abspath, position, worklist, manager) => {
  const stat = await fs.lstatAsync(abspath)
  const type = stat.isDirectory() ? 'folder' : stat.isFile() ? 'file' : 'others'
  if (type === 'others') return debug(abspath, 'not folder or file, maybe symbolic link, ignore !!!!')
  const task = stat.isDirectory()
    ? new FolderUploadTask(type, abspath, manager)
    : new FileUploadTask(type, abspath, stat.size, manager)

  const index = manager.uploadingList.findIndex(item => item.abspath === abspath)
  const item = manager.uploadingList[index]
  if (index !== -1) {
    task.seek = item.seek
    task.taskid = item.taskid
    manager.completeSize += item.seek * item.segmentsize
  }

  manager.count += 1
  manager.size += stat.size
  worklist.push(task)
  position.push(task)

  if (stat.isDirectory()) {
    const entries = await fs.readdirAsync(path.resolve(abspath))
    for (let i = 0; i < entries.length; i++) {
      await visitFolderAsync(path.join(abspath, entries[i]), task.children, worklist, manager)
    }
  }
}

const visitServerFiles = async (uuid, driveUUID, name, type, position) => {
  const fileNode = { uuid, name, children: [] }
  position.push(fileNode)
  if (type !== 'folder' && type !== 'directory') return
  const listNav = await serverGetAsync(`drives/${driveUUID}/dirs/${uuid}`)
  const entries = listNav.entries
  if (!entries.length) return
  for (let i = 0; i < entries.length; i++) {
    await visitServerFiles(entries[i].uuid, driveUUID, entries[i].name, entries[i].type, fileNode.children)
  }
}

const diffTree = async (taskPosition, serverPosition, manager) => {
  if (taskPosition.name !== serverPosition.name) return
  taskPosition.stateName = 'finish'
  taskPosition.uuid = serverPosition.uuid
  manager.finishCount += 1
  manager.completeSize += taskPosition.size ? taskPosition.size : 0
  if (taskPosition.type === 'file') return
  const children = taskPosition.children
  if (!children.length) return
  children.forEach(item => (item.target = taskPosition.uuid))
  for (let index = 0; index < children.length; index++) {
    const newTaskPosition = taskPosition.children[index]
    const newServerPosition = serverPosition.children.find(item => item.name === newTaskPosition.name)
    if (newServerPosition) {
      await diffTree(newTaskPosition, newServerPosition, manager)
    }
  }
}

class UploadTask {
  constructor(type, abspath, manager) {
    this.type = type
    this.name = path.basename(abspath)
    this.abspath = abspath
    this.manager = manager
    this.target = ''
    this.state = null
    this.stateName = ''
  }

  setState(NextState) {
    this.state = new NextState(this)
  }

  requestProbe() {
    this.state.requestProbe()
  }

  uploadFinish() {
    const manager = this.manager
    this.recordInfor(`${this.name} 上传完毕`)
    this.stateName = 'finish'
    if (this === this.manager.tree[0]) {
      // debug('根节点上传完成', this.uuid)
      this.manager.rootNodeUUID = this.uuid
    }
    manager.uploading.splice(manager.uploading.indexOf(this), 1)
    manager.finishCount += 1
    return manager.workFinishCall()
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

class FileUploadTask extends UploadTask {
  constructor(type, abspath, size, manager) {
    super(type, abspath, manager)
    this.size = size
    this.seek = 0
    this.sha = ''
    this.parts = []
    this.taskid = ''
    this.segmentsize = size > 1073741824 ? partSize : this.size
    this.failedTimes = 0
  }

  getSummary() {
    return {
      name: this.name,
      target: this.target,
      abspath: this.abspath,
      taskid: this.taskid,
      seek: this.seek,
      segmentsize: this.segmentsize
    }
  }

  hashFinish() {
    // this.recordInfor(this.name + ' HASH计算完毕')
    this.manager.hashing.splice(this.manager.hashing.indexOf(this), 1)
    this.manager.schedule()
  }
}

class FolderUploadTask extends UploadTask {
  constructor(type, abspath, manager) {
    super(type, abspath, manager)
    this.children = []
  }
}

class STM {
  constructor(wrapper) {
    this.wrapper = wrapper
  }

  destructor() {
  }
}

/* create Foloder */
class HashSTM extends STM {
  constructor(wrapper) {
    super(wrapper)

    this.child = null

    this.retryTime = 0

    this.finish = (error, attr) => {
      debug('HashSTM finish:', error, attr)
      if (!error && attr && attr.parts) {
        this.wrapper.sha = attr.parts[attr.parts.length - 1].fingerprint
        this.wrapper.parts = attr.parts
        removeOutOfHashingQueue(this)
        this.wrapper.hashFinish()
      } else {
        this.retryTime += 1
        debug('retry hash', this.retryTime, 'times')
        if (this.retryTime < 3) this.hash()
      }
    }

    this.hash = () => {
      const options = {
        env: { absPath: this.wrapper.abspath, size: this.wrapper.size, partSize: this.wrapper.segmentsize },
        encoding: 'utf8',
        cwd: process.cwd()
      }
      this.child = childProcess.fork(path.join(__dirname, 'filehash'), [], options)
      this.child.on('message', (result) => { setXattr(this.wrapper.abspath, result, this.finish) })
      this.child.on('error', this.finish)
    }
  }

  requestProbe() {
    this.wrapper.stateName = 'hassless'
    addToHashlessQueue(this)
  }

  hashing() {
    const wrapper = this.wrapper
    wrapper.stateName = 'hashing'
    removeOutOfHashlessQueue(this)
    addToHashingQueue(this)

    readXattr(wrapper.abspath, (error, attr) => {
      if (!error && attr) return this.finish(null, attr)
      debug('calc hash', wrapper.abspath)
      return this.hash()
    })
  }

  abort() {
    if (this.child) this.child.kill()
  }
}

/* create Foloder */
class createFolderSTM extends STM {
  constructor(wrapper) {
    super(wrapper)
    this.handle = null
  }

  requestProbe() {
    this.wrapper.stateName = 'uploadless'
    addToReadyQueue(this)
  }

  beginUpload() {
    this.wrapper.stateName = 'uploading'
    removeOutOfReadyQueue(this)
    addToRunningQueue(this)

    debug(`创建文件夹的目标文件夹是：${this.wrapper.target}`)
    this.wrapper.recordInfor(`${this.wrapper.name} 开始创建...`)

    const data = this.wrapper.manager
    createFold(data.driveUUID, this.wrapper.target, this.wrapper.name, (error, entries) => {
      if (error) {
        this.wrapper.recordInfor(`${this.wrapper.name} 创建失败`)
        debug('error:', error)
      } else {
        debug(`${this.wrapper.name} 创建成功`)
        removeOutOfRunningQueue(this)
        // debug(entries)
        this.wrapper.uuid = entries.find(entry => entry.name === this.wrapper.name).uuid
        // debug(this.wrapper.uuid)
        this.wrapper.children.forEach(item => (item.target = this.wrapper.uuid))
        getMainWindow().webContents.send('driveListUpdate',
          Object.assign({}, { uuid: this.wrapper.target, message: '创建文件夹成功' })
        )
        return this.wrapper.uploadFinish()
      }
    })
  }
}

/* init request */
let server
let tokenObj
let Authorization
const initArgs = () => {
  server = `http://${store.getState().login.device.mdev.address}:3000`
  tokenObj = store.getState().login.device.token.data
  Authorization = `${tokenObj.type} ${tokenObj.token}`
}

/* upload file */
class UploadFileSTM extends STM {
  constructor(wrapper) {
    super(wrapper)

    this.paused = false
    this.handle = null
    this.partFinishSize = 0

    this.uploadFileWithStream = (driveUUID, dirUUID, name, part, readStream, callback) => {
      initArgs()
      let formDataOptions = {
        size: part.end ? part.end - part.start + 1 : 0,
        sha256: part.sha
      }
      if (part.start) formDataOptions = Object.assign(formDataOptions, { append: part.fingerprint })

      const op = {
        url: `${server}/drives/${driveUUID}/dirs/${dirUUID}/entries`,
        headers: { Authorization },
        formData: {
          [name]: {
            value: readStream,
            options: JSON.stringify(formDataOptions)
          }
        }
      }
      this.handle = request.post(op, (error, response, body) => {
        debug('request.post error', error, response && response.statusCode, body)
        if (error || (response && response.statusCode !== 200 && response.statusCode !== 206)) {
          this.wrapper.manager.state = 'failed'
        } else if (callback) callback()
      })
    }
  }

  destructor() {
    this.handle = null
  }

  requestProbe() {
    this.wrapper.stateName = 'uploadless'
    addToReadyQueue(this)
  }

  beginUpload() {
    // debug('beginUpload state', this.wrapper.stateName, this.paused)
    if (this.paused) return
    this.wrapper.stateName = 'running'
    removeOutOfReadyQueue(this)
    debug('removeOutOfReadyQueue in beginUpload', this.wrapper.stateName, this.wrapper.name)
    addToRunningQueue(this)
    this.wrapper.manager.updateStore()
    this.wrapper.recordInfor(`${this.wrapper.name} 开始上传.....`)
    if (this.wrapper.taskid) return this.uploadSegment()
    return this.createUploadTask()
  }

  createUploadTask() {
    return this.uploadSegment()
    return this.uploadWholeFile()
    this.wrapper.taskid = taskid // FIXME when part of file already upload
    this.uploadSegment()
  }

  /* update file by segment */
  uploadSegment() {
    if (this.wrapper.stateName !== 'running') return
    const wrapper = this.wrapper
    const data = wrapper.manager
    const target = wrapper.target
    let seek = wrapper.seek
    const name = wrapper.name
    const part = wrapper.parts[seek]
    if (!part) {
      this.wrapper.manager.state = 'failed'
      return
    }

    const readStream = fs.createReadStream(wrapper.abspath, { start: part.start, end: part.end, autoClose: true })
    readStream.on('data', (chunk) => {
      // debug( `Received ${chunk.length} bytes of data.`)
      if (this.wrapper.stateName !== 'running') return
      this.partFinishSize += chunk.length
      this.wrapper.manager.completeSize += chunk.length
    })

    this.uploadFileWithStream(data.driveUUID, target, name, part, readStream, (error) => {
      if (error) { // FIXME
        this.wrapper.manager.completeSize -= this.partFinishSize
        this.partFinishSize = 0
        debug(`第${seek}块 ` + 'req : error', error)

        /* retry ? */
        wrapper.failedTimes += 1
        wrapper.manager.completeSize -= (this.partFinishSize + wrapper.segmentsize * wrapper.seek)
        this.partFinishSize = 0
        seek = 0
        if (wrapper.failedTimes < 5) return this.uploadSegment()
        else if (wrapper.failedTimes < 6) return this.createUploadTask()
        return debug('failed!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
      }
      return this.partUploadFinish()
    })
  }

  partUploadFinish() {
    this.wrapper.seek += 1
    this.partFinishSize = 0
    this.wrapper.manager.updateStore()
    if (this.wrapper.seek === this.wrapper.parts.length) {
      removeOutOfRunningQueue(this)
      return this.wrapper.uploadFinish()
    } this.uploadSegment()
  }

  pause() {
    this.wrapper.recordInfor(`${this.wrapper.name} pause, stateName: ${this.wrapper.stateName} readyQueue: ${readyQueue.length}`)
    this.paused = true
    if (this.wrapper.stateName !== 'running') return
    this.wrapper.stateName = 'pause'
    sendMsg()
    if (this.handle) this.handle.abort()
    this.wrapper.manager.completeSize -= this.partFinishSize
    this.partFinishSize = 0
    this.wrapper.recordInfor(`${this.wrapper.name}暂停了`)
    this.timehandle = setTimeout(() => removeOutOfRunningQueue(this), 10) // it's necessary when pausing lots of tasks at the same time
  }

  resume() {
    this.wrapper.recordInfor(`${this.wrapper.name} reusme, stateName: ${this.wrapper.stateName}`)
    if (this.timehandle) clearTimeout(this.timehandle)
    this.paused = false
    if (this.wrapper.stateName !== 'pause') return
    this.wrapper.stateName = 'running'
    if (runningQueue.length < httpRequestConcurrency) {
      this.beginUpload()
      this.wrapper.recordInfor(`${this.wrapper.name}继续上传`)
      sendMsg()
    }
  }
}

/*
  TaskManager inclue a tree (if task is a file ,the tree has onle on node)
  TaskManager schedule worker list
  abspath : abspath of file or root folder
  target : the target of the root node
  size: the while size of file/folder
  pause : could stop upload task
  state : stop/visit/diff/schedule/finish
  visit(): consist tree && work list
  schedule(): schedule work list
*/

class TaskManager {
  constructor(uuid, abspath, target, driveUUID, type, createTime, newWork, uploadingList, rootNodeUUID) {
    this.uuid = uuid
    this.abspath = abspath
    this.target = target
    this.driveUUID = driveUUID
    this.type = type
    this.createTime = createTime
    this.newWork = newWork
    this.uploadingList = uploadingList
    this.rootNodeUUID = rootNodeUUID

    this.name = path.basename(abspath)
    this.trsType = 'upload'

    this.size = 0// not need rootsize for visit
    this.completeSize = 0
    this.lastTimeSize = 0
    this.speed = ''
    this.restTime = ''
    this.state = ''
    this.pause = false
    this.count = 0
    this.finishCount = 0
    this.finishDate = null

    this.fileIndex = 0
    this.hashIndex = 0
    this.lastFolderIndex = -1
    this.lastFileIndex = -1
    this.tree = []
    this.worklist = []
    this.hashing = []
    this.uploading = []
    this.record = []


    this.countSpeed = setInterval(() => {
      if (this.pause) {
        this.speed = ''
        this.restTime = '--'
        return
      }
      const s = (this.completeSize - this.lastTimeSize) / 1
      this.speed = `${utils.formatSize(s)}/s`
      this.restTime = utils.formatSeconds((this.size - this.completeSize) / s)
      this.lastTimeSize = this.completeSize
    }, 1000)
  }

  getSummary() {
    return {
      uuid: this.uuid,
      abspath: this.abspath,
      type: this.type,
      name: this.name,
      size: this.size,
      completeSize: this.completeSize,
      count: this.count,
      finishCount: this.finishCount,
      restTime: this.restTime,
      finishDate: this.finishDate,
      trsType: this.trsType,
      state: this.type === 'file' && !!this.worklist[0] ? this.worklist[0].stateName === 'hashing' ? 'visiting' : this.state : this.state,
      pause: this.pause,
      record: this.record,
      speed: this.speed
    }
  }

  recordInfor(msg) {
    if (this.record.length > 50) this.record.splice(0, 20)
    debug(msg)
    this.record.push(msg)
  }

  readyToVisit() {
    this.state = 'visitless'
    addToVisitlessQueue(this)
  }

  /* visit folder, create tree */
  visit() {
    this.state = 'visiting'
    this.recordInfor('开始遍历文件树...')

    removeOutOfVisitlessQueue(this)
    addToVisitingQueue(this)

    visitFolderAsync(this.abspath, this.tree, this.worklist, this)
      .then(() => {
        this.tree[0].target = this.target
        removeOutOfVisitingQueue(this)
        this.recordInfor('遍历文件树结束...')
        this.diff()
      })
      .catch(error => this.error('遍历本地文件出错', error))
  }

  async diff() {
    this.state = 'diffing'

    for (let i = this.worklist.length - 1; i >= 0; i--) {
      if (this.lastFileIndex !== -1) break
      if (this.worklist[i].type === 'file') this.lastFileIndex = i
    }

    for (let i = this.worklist.length - 1; i >= 0; i--) {
      if (this.lastFolderIndex !== -1) break
      if (this.worklist[i].type === 'folder') this.lastFolderIndex = i
    }

    if (!this.newWork) {
      this.pause = true
      if (this.type === 'file') {
        this.recordInfor('文件上传任务，继续上传文件')
        this.schedule()
      } else if (this.rootNodeUUID) {
        this.recordInfor('文件夹上传任务，查找已上传文件信息')
        const serverFileTree = []
        try {
          const listNav = await serverGetAsync(`drives/${this.driveUUID}/dirs/${this.target}`)
          const list = listNav.entries
          const index = list.findIndex(item => item.uuid === this.rootNodeUUID)
          if (index === -1) {
            this.recordInfor('已上传根目录被移除 重新上传')
            this.schedule()
          } else {
            this.recordInfor('已上传根目录存在')
            try {
              await visitServerFiles(this.rootNodeUUID, this.driveUUID, this.name, this.type, serverFileTree)
            } catch (e) { this.recordInfor('校验已上传文件出错') }
            this.recordInfor('校验已上传文件完成')
            // debug(serverFileTree[0])
            // debug(this.tree[0])
            await diffTree(this.tree[0], serverFileTree[0], this)
            debug('比较文件树完成，已完成：', this.finishCount, )
            this.schedule()
          }
        } catch (e) {
          this.error(e, '上传目标目录不存在')
        }
      } else {
        this.recordInfor('文件夹上传，根目录没有创建，几率很低')
        this.schedule()
      }
      // ....
    } else {
      this.recordInfor('新任务 不需要与服务器进行比较')
      this.checkNameExist()
    }
  }

  async checkNameExist() {
    const _this = this
    try {
      const listNav = await serverGetAsync(`drives/${this.driveUUID}/dirs/${this.target}`)
      const list = listNav.entries
      let name = _this.tree[0].name
      let times = 0

      while (list.findIndex(item => item.name === name) !== -1) {
        times += 1
        const arr = _this.tree[0].name.split('.')
        if (arr.length == 1) name = `${arr[0]}[${times}]`
        else {
          arr[arr.length - 2] += `[${times}]`
          name = arr.join('.')
        }
      }
      this.tree[0].name = name
      this.name = name
      this.updateStore()
      this.schedule()
    } catch (e) {
      return debug('上传目标没找到....', e)
    }
  }

  pauseTask() {
    this.pause = true
    this.uploading.forEach((work) => {
      if (work.type === 'file') work.pause()
    })
  }

  resumeTask() {
    this.pause = false
    this.uploading.forEach((work) => {
      if (work.type === 'file') work.resume()
    })
    this.schedule()
  }

  schedule() {
    this.state = 'schedule'
    sendMessage()
    if (this.pause || !this.count) return
    debug('task schedule in schedule')
    this.hashSchedule()
    this.uploadSchedule()
  }

  hashSchedule() {
    if (this.pause) return // pause
    if (this.lastFileIndex === -1) return // this.recordInfor('任务列表中不包含文件')
    if (this.hashing.length >= fileHashConcurrency) return // this.recordInfor('任务的HASH队列已满')
    if (this.hashIndex === this.lastFileIndex + 1) return // this.recordInfor(`${this.name} 所有文件hash调度完成`)
    this.recordInfor(`正在HASH第 ${this.hashIndex} 个文件 : ${this.worklist[this.hashIndex].name}`)
    const obj = this.worklist[this.hashIndex]
    if (obj.type === 'folder' || obj.stateName === 'finish') this.hashIndex += 1
    else {
      obj.setState(HashSTM)
      this.hashing.push(obj)
      this.hashIndex += 1
      obj.requestProbe()
    }
    this.hashSchedule()
  }

  uploadSchedule() {
    if (this.pause) return // pause
    if (this.finishCount === this.worklist.length) return // this.recordInfor('文件全部上传结束')
    if (this.uploading.length >= httpRequestConcurrency) return // this.recordInfor('任务上传队列已满')
    if (this.fileIndex === this.worklist.length) return // this.recordInfor('所有文件上传调度完成')
    // this.recordInfor(`调度第 ${this.fileIndex + 1} 个文件中,共 ${this.worklist.length} 个 : ${this.worklist[this.fileIndex].name}`)

    const _this = this
    const obj = this.worklist[this.fileIndex]
    if (obj.stateName === 'finish') {
      this.recordInfor('文件已被上传过，跳过...')
      this.fileIndex += 1
      this.uploadSchedule()
      return
    }
    if (obj.target === '') {
      this.recordInfor('当前文件父文件夹正在创建，缺少目标，等待...')
      return
    } else if (obj.type === 'file' && obj.sha === '') {
      this.recordInfor('当前文件HASH尚未计算，等待...')
      return
    }

    const stateMachine = obj.type === 'folder' ? createFolderSTM : UploadFileSTM
    obj.setState(stateMachine)
    this.uploading.push(obj)
    this.fileIndex += 1
    obj.requestProbe()

    this.uploadSchedule()
  }

  workFinishCall() {
    if (this.finishCount === this.worklist.length) {
      clearInterval(this.countSpeed)
      this.state = 'finish'
      this.finishDate = (new Date()).getTime()
      userTasks.splice(userTasks.indexOf(this), 1)
      finishTasks.unshift(this)
      getMainWindow().webContents.send('driveListUpdate', Object.assign({}, { uuid: this.target, message: '上传成功' }))
      sendMessage()
      return this.finishStore()
    } return this.uploadSchedule()
  }

  getStoreObj() {
    const uploadArr = []
    this.uploading.forEach((item) => {
      if (item.type === 'file') uploadArr.push(item.getSummary())
    })
    return {
      _id: this.uuid,
      abspath: this.abspath,
      name: this.name,
      target: this.target,
      driveUUID: this.driveUUID,
      type: this.type,
      uploading: uploadArr,
      finishDate: this.finishDate,
      rootNodeUUID: this.rootNodeUUID,
      createTime: this.createTime,
      trsType: this.trsType
    }
  }

  createStore() {
    if (!this.newWork) return
    db.uploading.insert(this.getStoreObj(), (err, data) => {
      if (err) return debug(err)
    })
  }

  updateStore() {
    const uploadArr = []
    this.uploading.forEach((item) => {
      if (item.type == 'file') uploadArr.push(item.getSummary())
    })

    db.uploading.update({ _id: this.uuid },
      { $set: {
        name: this.name,
        uploading: uploadArr,
        rootNodeUUID: this.rootNodeUUID
      } }, (err, data) => {})
  }

  finishStore() {
    db.uploading.remove({ _id: this.uuid }, {}, (err, data) => {
      if (err) return debug(err)
    })

    db.uploaded.insert(this.getStoreObj(), (err, data) => {
      if (err) return debug(err)
    })
  }

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
    callback()
  }

  error(e, message) {
    this.state = 'failed'
    this.Error = e
    debug(e)
    this.recordInfor(message)
  }
}

const createTask = (taskUUID, abspath, target, driveUUID, type, createTime, newWork, uploadingList, rootNodeUUID) => {
  const task = new TaskManager(taskUUID, abspath, target, driveUUID, type, createTime, newWork, uploadingList, rootNodeUUID)
  task.createStore()
  userTasks.push(task)
  task.readyToVisit()
  sendMessage()
  return task
}

export default createTask

export { sendMsg }
