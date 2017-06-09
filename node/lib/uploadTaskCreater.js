import path from 'path'
import fs from 'fs'
import stream from 'stream'
import http from 'http'
import { dialog, ipcMain } from 'electron'
import child_process from 'child_process'
import request from 'request'
import uuid from 'node-uuid'

import { serverGetAsync } from './server'
import store from '../serve/store/store'
import { getMainWindow } from './window'
import utils from './util'
import { userTasks, finishTasks } from './newUpload'
import sendInfor from './transmissionUpdate'

let ip
let server
let tokenObj
const httpRequestConcurrency = 4
const fileHashConcurrency = 6
const visitConcurrency = 2
const partSize = 20000000
let sendHandler = null

const runningQueue = []
const readyQueue = []
const hashingQueue = []
const hashlessQueue = []
const visitlessQueue = []
const visitingQueue = []

// sendMessage
const sendMsg = () => {
  sendInfor()
}

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

const createTask = (abspath, target, type, newWork, u, r, rootNodeUUID, ct) => {
  initArgs()
  const taskUUID = u || uuid.v4()
  const uploadingList = r || []
  const createTime = ct || (new Date()).getTime()
  const task = new TaskManager(taskUUID, abspath, target, type, createTime, newWork, uploadingList, rootNodeUUID)
  task.createStore()
  userTasks.push(task)
  task.readyToVisit()
  sendMessage()
  return task
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
  constructor(uuid, abspath, target, type, createTime, newWork, uploadingList, rootNodeUUID) {
    this.uuid = uuid
    this.abspath = abspath
    this.target = target
    this.type = type
    this.createTime = createTime
    this.name = path.basename(abspath)
    this.newWork = newWork
    this.rootNodeUUID = rootNodeUUID || null
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
    this.uploadingList = uploadingList
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
      state: this.type == 'file' && !!this.worklist[0] ? this.worklist[0].stateName === 'hashing' ? 'visiting' : this.state : this.state,
      pause: this.pause,
      record: this.record,
      speed: this.speed
    }
  }

  recordInfor(msg) {
    if (this.record.length > 50) this.record.splice(0, 20)
    console.log(msg)
    this.record.push(msg)
  }

  readyToVisit() {
    this.state = 'visitless'
    addToVisitlessQueue(this)
  }

  visit() {
    this.state = 'visiting'
    const _this = this
    this.recordInfor('开始遍历文件树...')
    removeOutOfVisitlessQueue(this)
    addToVisitingQueue(this)
    visitFolder(this.abspath, this.tree, this.worklist, this, (err, data) => {
      if (err) return _this.error(err, '遍历本地文件出错')
      _this.tree[0].target = _this.target
      removeOutOfVisitingQueue(this)
      _this.recordInfor('遍历文件树结束...')
      _this.diff()
    })
  }

  async diff() {
    this.state = 'diffing'

    for (let i = this.worklist.length - 1; i >= 0; i--) {
      if (this.lastFileIndex != -1) break
      if (this.worklist[i].type === 'file') this.lastFileIndex = i
    }

    for (let i = this.worklist.length - 1; i >= 0; i--) {
      if (this.lastFolderIndex != -1) break
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
          const list = await serverGetAsync(`files/fruitmix/list/${this.target}/${this.target}`)
          const index = list.findIndex(item => item.uuid === this.rootNodeUUID)
          if (index === -1) {
            this.recordInfor('已上传根目录被移除 重新上传')
            this.schedule()
          } else {
            this.recordInfor('已上传根目录存在')
            visitServerFiles(this.rootNodeUUID, this.name, this.type, serverFileTree, (err, data) => {
              if (err) return this.recordInfor('校验已上传文件出错')

              this.recordInfor('校验已上传文件完成')
              diffTree(this.tree[0], serverFileTree[0], this, (err) => {
                if (err) console.log(err)
                console.log('比较文件树完成')
                this.schedule()
              })
            })
          }
        } catch (e) {
          _this.error(e, '上传目标目录不存在')
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
      const list = await serverGetAsync(`files/fruitmix/list/${this.target}/${this.target}`)
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
      _this.tree[0].name = name
      _this.name = name
      _this.updateStore()
      _this.schedule()
    } catch (e) {
      return console.log('上传目标没找到....', e)
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
    if (this.pause || !this.count) return
    this.hashSchedule()
    this.uploadSchedule()
  }

  hashSchedule() {
    // console.log('')
    // console.log('HASH调度...')
    if (this.lastFileIndex === -1) return this.recordInfor('任务列表中不包含文件')
    if (this.hashing.length >= 2) return this.recordInfor('任务的HASH队列已满')
    if (this.hashIndex === this.lastFileIndex + 1) return this.recordInfor(`${this.name} 所有文件hash调度完成`)
    // this.recordInfor('正在HASH第 ' + this.hashIndex + ' 个文件 : ' + this.worklist[this.hashIndex].name)
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
    console.log('')
    console.log('上传调度...')
    if (this.finishCount === this.worklist.length) return this.recordInfor('文件全部上传结束')
    if (this.uploading.length >= 2) return this.recordInfor('任务上传队列已满')
    if (this.fileIndex === this.worklist.length) return this.recordInfor('所有文件上传调度完成')
    this.recordInfor(`正在调度第 ${this.fileIndex + 1} 个文件,总共 ${this.worklist.length} 个 : ${this.worklist[this.fileIndex].name}`)

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
    }        else if (obj.type === 'file' && obj.sha === '') {
      this.recordInfor('当前文件HASH尚未计算，等待...')
      return
    }

    const stateMachine = obj.type == 'folder' ? createFolderSTM : UploadFileSTM
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
      this.finishDate = utils.formatDate()
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
      if (err) return console.log(err)
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
      if (err) return console.log(err)
    })

    db.uploaded.insert(this.getStoreObj(), (err, data) => {
      if (err) return console.log(err)
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
    console.log(e)
    this.recordInfor(message)
  }
}

const visitFolder = (abspath, position, worklist, manager, callback) => {
  fs.stat(abspath, (err, stat) => {
    if (err || (!stat.isDirectory() && !stat.isFile())) return callback(err)
    const type = stat.isDirectory() ? 'folder' : 'file'
    const obj = stat.isDirectory() ?
      new FolderUploadTask(type, abspath, manager) :
      new FileUploadTask(type, abspath, stat.size, manager)

    const index = manager.uploadingList.findIndex(item => item.abspath === abspath)
    const item = manager.uploadingList[index]
    if (index !== -1) {
      obj.seek = item.seek
      obj.taskid = item.taskid
      manager.completeSize += item.seek * item.segmentsize
    }

    manager.count += 1
    manager.size += stat.size
    worklist.push(obj)
    position.push(obj)
    if (stat.isFile()) return callback(null)
    fs.readdir(abspath, (err, entries) => {
      if (err) return callback(err)
      if (!entries.length) return callback(null)
      const count = entries.length
      let index = 0
      const next = () => { visitFolder(path.join(abspath, entries[index]), obj.children, worklist, manager, call) }
      let call = (err) => {
        if (err) return callback(err)
        index += 1
        if (index >= count) return callback()
        next()
      }
      next()
    })
  })
}

const visitServerFiles = async (uuid, name, type, position, callback) => {
  // console.log(name + '...' + type)
  const obj = { name, type, children: [], uuid }
  position.push(obj)
  if (type === 'file') return callback(null)

  try {
    const entries = await serverGetAsync(`files/fruitmix/list/${uuid}/${uuid}`)
    if (!entries.length) return callback(null)
    const count = entries.length
    let index = 0
    const next = () => {
      visitServerFiles(entries[index].uuid, entries[index].name, entries[index].type, obj.children, call)
    }
    let call = (err) => {
      if (err) return callback(err)
      index += 1
      if (index >= count) return callback()
      next()
    }

    return next()
  } catch (e) {
    return callback(e)
  }
}

const diffTree = (taskPosition, serverPosition, manager, callback) => {
  if (taskPosition.name !== serverPosition.name) return callback()
  taskPosition.stateName = 'finish'
  taskPosition.uuid = serverPosition.uuid
  manager.finishCount += 1
  manager.completeSize += taskPosition.size ? taskPosition.size : 0
  if (taskPosition.type === 'file') return callback()
  const children = taskPosition.children
  if (!children.length) return callback()
  children.forEach(item => item.target = taskPosition.uuid)
  const count = children.length
  let index = 0
  const next = () => {
    const currentObj = taskPosition.children[index]
    const i = serverPosition.children.findIndex(item => item.name === currentObj.name)
    if (i !== -1) {
      diffTree(currentObj, serverPosition.children[i], manager, call)
    } else {
      call()
    }
  }
  let call = (err) => {
    index += 1
    if (index >= count) return callback()
    next()
  }
  next()
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
      console.log('根节点上传完成', this.uuid)
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
    this.segmentsize = size > 1024000000 ? Math.ceil(size / 50) : this.size < partSize ? this.size : partSize
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

class HashSTM extends STM {
  constructor(wrapper) {
    super(wrapper)
  }

  requestProbe() {
    this.wrapper.stateName = 'hassless'
    // this.wrapper.recordInfor(this.wrapper.name + ' 进入HASH队列')
    addToHashlessQueue(this)
  }

  hashing() {
    const wrapper = this.wrapper
    // wrapper.recordInfor(this.wrapper.name + ' 开始计算HASH')
    wrapper.stateName = 'hashing'
    removeOutOfHashlessQueue(this)
    addToHashingQueue(this)
    try {
      const options = {
        env: { absPath: wrapper.abspath, size: wrapper.size, partSize: wrapper.segmentsize },
        encoding: 'utf8',
        cwd: process.cwd()
      }
      const child = child_process.fork(path.join(__dirname, 'filehash'), [], options)
      child.on('message', (obj) => {
        // console.log('hash message' , obj)
        wrapper.sha = obj.hash
        wrapper.parts = obj.parts
        removeOutOfHashingQueue(this)
        wrapper.hashFinish()
      })

      child.on('error', (err) => {
        console.log('hash error!')
        console.log(err)
      })
    } catch (e) {
      // todo
      console.log('hash error')
      console.log(e)
    }
  }
}

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
    console.log(`创建文件夹的目标文件夹是：${this.wrapper.target}`)
    const options = {
      url: `${server}/files/fruitmix/mkdir/${this.wrapper.target}`,
      method: 'post',
      headers: {
        Authorization: `${tokenObj.type} ${tokenObj.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ dirname: this.wrapper.name })
    }

    this.wrapper.recordInfor(`${this.wrapper.name} 开始创建...`)
    this.handle = request(options, (err, res, body) => {
      if (err || res.statusCode !== 200) {
        // todo
        this.wrapper.recordInfor(`${this.wrapper.name} 创建失败`)
        console.log(err, res.statusCode)
      } else {
        removeOutOfRunningQueue(this)
        this.wrapper.uuid = JSON.parse(body)
        this.wrapper.children.forEach(item => item.target = this.wrapper.uuid)
        return this.wrapper.uploadFinish()
      }
    })
  }
}

class UploadFileSTM extends STM {
  constructor(wrapper) {
    super(wrapper)
    this.handle = null
    this.partFinishSize = 0
  }

  destructor() {
    this.handle = null
  }

  requestProbe() {
    this.wrapper.stateName = 'uploadless'
    addToReadyQueue(this)
  }

  beginUpload() {
    this.wrapper.stateName = 'running'
    removeOutOfReadyQueue(this)
    addToRunningQueue(this)
    this.wrapper.manager.updateStore()
    // this.wrapper.recordInfor(this.wrapper.name + ' 开始上传...')
    if (this.wrapper.taskid) return this.uploadSegment()
    return this.createUploadTask()
  }

  uploadWholeFile() {
    const _this = this
    const transform = new stream.Transform({
      transform(chunk, encoding, next) {
        _this.partFinishSize += chunk.length
        _this.wrapper.manager.completeSize += chunk.length
        this.push(chunk)
        next()
      }
    })

    const tempStream = fs.createReadStream(this.wrapper.abspath).pipe(transform)
    const options = {
      host: ip,
      port: 3721,
      headers: {
        Authorization: `${tokenObj.type} ${tokenObj.token}`
      },
      method: 'PUT',
      path: encodeURI(`/files/fruitmix/upload/${
        this.wrapper.target}/${
        this.wrapper.sha
        }?filename=${this.wrapper.name}`
      )
    }

    this.handle = http.request(options).on('error', (err) => {
      console.log(err)
    }).on('response', (res) => {
      if (res.statusCode == 200) {
        removeOutOfRunningQueue(this)
        return this.wrapper.uploadFinish()
      }
    })

    tempStream.pipe(this.handle)
  }

  createUploadTask() {
    const _this = this
    const options = {
      url: `${server}/filemap/${this.wrapper.target}`,
      method: 'post',
      headers: {
         Authorization: `${tokenObj.type} ${tokenObj.token}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         filename: this.wrapper.name,
         size: this.wrapper.size,
         segmentsize: this.wrapper.segmentsize,
         sha256: this.wrapper.sha
     })
    }

    request(options, (err, res, body) => {
      if (err || res.statusCode !== 200) {
        this.wrapper.recordInfor('创建上传任务失败，缺少对应API，上传整个文件')
        console.log(err)
        console.log(`任务创建的目标是：${this.wrapper.target}`)
        return this.uploadWholeFile()
      }
        const b = JSON.parse(body)
        console.log('上传任务创建成功')
        _this.wrapper.taskid = b.taskid
        this.uploadSegment()
    })
  }

  uploadSegment() {
    const _this = this
    const wrapper = this.wrapper
    let seek = wrapper.seek

    const transform = new stream.Transform({
      transform(chunk, encoding, next) {
        _this.partFinishSize += chunk.length
        _this.wrapper.manager.completeSize += chunk.length
        this.push(chunk)
        next()
      }
    })

    // console.log('开始上传第' + wrapper.seek + '块')
    // console.log('----------------------------------------------')

    const tempStream = fs.createReadStream(wrapper.abspath, { start: wrapper.parts[seek].start, end: wrapper.parts[seek].end, autoClose: true }).pipe(transform)

    tempStream.on('error', (err) => {
      console.log(`第${seek}块 ` + `stream: ${err}`)
    })

    const options = {
      host: ip,
      port: 3721,
      headers: {
        Authorization: `${tokenObj.type} ${tokenObj.token}`
      },
      method: 'PUT',
      path: encodeURI(`/filemap/${wrapper.target}?filename=${wrapper.name
        }&segmenthash=${wrapper.parts[seek].sha
        }&start=${seek
        }&taskid=${wrapper.taskid}`
      )
    }

    this.handle = http.request(options).on('error', (err) => {
      this.wrapper.manager.completeSize -= this.partFinishSize
      this.partFinishSize = 0
      console.log(`第${seek}块 ` + 'req : err', err)
    }).on('response', (res) => {
      // console.log('第' + seek +'块 ' + 'req : response')
      if (res.statusCode == 200) return this.partUploadFinish()

      console.log(`${res.statusCode} !!!!!!!!!!!!!!!!!!!`)
      wrapper.failedTimes += 1
      wrapper.manager.completeSize -= (this.partFinishSize + wrapper.segmentsize * wrapper.seek)
      this.partFinishSize = 0
      seek = 0
      if (wrapper.failedTimes < 5) return this.uploadSegment()
      else if (wrapper.failedTimes < 6) return this.createUploadTask()
      return console.log('failed!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    }).on('abort', () => {
      console.log(`第${seek}块 ` + 'req : abort')
    })

    tempStream.pipe(this.handle)
  }

  partUploadFinish() {
    this.wrapper.seek += 1
    this.partFinishSize = 0
    this.wrapper.manager.updateStore()
    if (this.wrapper.seek == this.wrapper.parts.length) {
      removeOutOfRunningQueue(this)
      return this.wrapper.uploadFinish()
    } this.uploadSegment()
  }

  pause() {
    if (this.wrapper.stateName !== 'running') return
    this.wrapper.stateName = 'pause'
    sendMsg()
    if (this.handle) this.handle.abort()
    this.wrapper.manager.completeSize -= this.partFinishSize
    this.partFinishSize = 0
    this.wrapper.recordInfor(`${this.wrapper.name}暂停了`)
    removeOutOfRunningQueue(this)
  }

  resume() {
    if (this.wrapper.stateName !== 'pause') return
    this.wrapper.stateName = 'running'
    sendMsg()
    this.beginUpload()
    this.wrapper.recordInfor(`${this.wrapper.name}继续上传`)
  }
}

const initArgs = () => {
  ip = store.getState().login.device.mdev.address
  server = `http://${store.getState().login.device.mdev.address}:3721`
  tokenObj = store.getState().login.device.token.data
}

const scheduleHttpRequest = () => {
  while (runningQueue.length < httpRequestConcurrency && readyQueue.length) { readyQueue[0].beginUpload() }
}

const scheduleFileHash = () => {
  while (hashingQueue.length < fileHashConcurrency && hashlessQueue.length) { hashlessQueue[0].hashing() }
}

const scheduleVisit = () => {
  while (visitlessQueue.length < visitConcurrency && visitlessQueue.length) { visitlessQueue[0].visit() }
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
  visitingQueue.splice(visitingQueue.indexOf(task), 1)
  scheduleVisit()
}

// hashless
const addToHashlessQueue = (task) => {
  hashlessQueue.push(task)
  scheduleFileHash()
}

const removeOutOfHashlessQueue = (task) => {
  hashlessQueue.splice(hashlessQueue.indexOf(task), 1)
}

// hashing
const addToHashingQueue = (task) => {
  hashingQueue.push(task)
}

const removeOutOfHashingQueue = (task) => {
  hashingQueue.splice(hashingQueue.indexOf(task), 1)
  scheduleFileHash()
}

// ready
const addToReadyQueue = (task) => {
  readyQueue.push(task)
  scheduleHttpRequest()
}

const removeOutOfReadyQueue = task => readyQueue.splice(readyQueue.indexOf(task), 1)


// running
const addToRunningQueue = (task) => {
  runningQueue.push(task)
}

const removeOutOfRunningQueue = (task) => {
  runningQueue.splice(runningQueue.indexOf(task), 1)
  scheduleHttpRequest()
}

export default createTask

export { sendMsg }
