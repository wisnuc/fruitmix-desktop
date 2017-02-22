import path from 'path'
import fs from 'fs'
import stream from 'stream'
import { EventEmitter } from 'events'
import crypto from 'crypto'

import { dialog } from 'electron' 
import request from 'request'
import Debug from 'debug'

import registerCommandHandlers from './command'
import { getMainWindow } from './window'
import store from '../serve/store/store'
import { ipcMain } from 'electron'

var sendMessage = null
var server
var user
const initArgs = () => {
  server = 'http://' + store.getState().config.ip + ':3721'
  user = store.getState().login.obj
}
// describe

// 1 upload operation  
// one upload operation has multiple files (file 0..N or directory 0..N)
// one upload operation has one and only one target

// progress size
// time: start time, estimated time (size to upload / current speed -> last 5 second, upload size)
// concurrency (1)
// cancel -> apply (1) upload operation
// 

// folder task : ready -> running -> end (success or fail) (update children state, reschedule)
// file task: hashless -> hashing -> ready -> running -> end (success or fail (update itself state, reschedule)

//schedule
let httpRequestConcurrency = 4
let fileHashConcurrency = 6

const scheduleHttpRequest = () => {
  while (runningQueue.length < httpRequestConcurrency && readyQueue.length)
    readyQueue[0].setState('running')
}

const scheduleFileHash = () => {
  while (hashingQueue.length < fileHashConcurrency && hashlessQueue.length) 
    hashlessQueue[0].setState('hashing')
}
 
/*
 * running queue and ready queue contains both file and folder task
 * runningQueue enter: when scheduling request
 * runningQueue exit: when request finish/callback, may setImmediate / nextTick ???
 * readyQueue enter: folder task create, file hashed
 * readyQueue exit: when scheduling request
 */
const runningQueue = []
const readyQueue = []

const addToRunningQueue = (task) => {
  runningQueue.push(task)
}

const removeOutOfRunningQueue = (task) => {
  runningQueue.splice(runningQueue.indexOf(task), 1)
  scheduleHttpRequest()
}

const addToReadyQueue = (task) => {
  readyQueue.push(task)
  scheduleHttpRequest()
}

const removeOutOfReadyQueue = (task) => {
  readyQueue.splice(readyQueue.indexOf(task), 1)
}

/*
 * hashing queue and hashing ready queue contains only file task
 *
 * hashingQueue enter: when scheduling hashing
 * hashingQueue exit: when hash finish/callback
 * hashlessQueue enter: when file task create
 * hashlessQueue exit: when scheduling hash
 */
const hashingQueue = []
const hashlessQueue = []

const addToHashingQueue = (task) => {
  hashingQueue.push(task)
}

const removeOutOfHashingQueue = (task) => {
  hashingQueue.splice(hashingQueue.indexOf(task),1)
  scheduleFileHash()
}

const addHashlessQueue = (task) => {
  hashlessQueue.push(task)
  scheduleFileHash()
}

const removeOutOfHashlessQueue = (task) => {
  hashlessQueue.splice(hashlessQueue.indexOf(task),1)
}

//read directory
const folderStats = (abspath, callback) => {
  fs.readdir(abspath, (err, entries) => {
    if (err) return callback(err)
    if (entries.length === 0) return callback(null, [])
    let count = entries.length
    let xstats = []
    entries.forEach(entry => {
      fs.lstat(path.join(abspath, entry), (err, stats) => {
        if (!err) {
          if (stats.isFile() || stats.isDirectory())
            xstats.push(Object.assign(stats, { abspath: path.join(abspath, entry) }))
        }
        if (!--count) callback(null, xstats)
      })
    })
  })
}

//hash
const hashFile = (abspath) => {
  let promise = new Promise((resolve,reject) => {
    let hash = crypto.createHash('sha256')
    hash.setEncoding('hex')
    let fileStream = fs.createReadStream(abspath)
    fileStream.on('end',(err) => {
      if (err) reject(err)
      hash.end()
      resolve(hash.read())
    })
    fileStream.pipe(hash)
  })
  return promise
}

var sendMessage = null
var updateStatusOfupload = (finish) => {
  let mainWindow = getMainWindow()
  mainWindow.webContents.send('refreshStatusOfUpload',userTasks,finish)
}
const sendUploadMessage = () => {
  let isSend = false
    for (var i = 0; i < userTasks.length; i++) {
      for (var j = 0;j < userTasks[i].roots.length;j++) {
        if (userTasks[i].type == 'folder' && userTasks[i].roots[j].finishCount !== userTasks[i].roots[j].children.length ) {
          isSend = true
          break
        }
        if (userTasks[i].type == 'file' && userTasks[i].roots[j].state !== 'finished') {
          isSend = true
          break
        }
      }
    }

  if (isSend && sendMessage == null) {
    console.log('begin send message')
    sendMessage = setInterval(()=> {updateStatusOfupload(!isSend)},1000)
  }else if(!isSend && sendMessage != null) {
    updateStatusOfupload(!isSend)
    clearInterval(sendMessage)
    console.log('stop send message')
    sendMessage = null
  }
}

setInterval(() => {
  sendUploadMessage()
},5000)

const userTasks = []

//create task
class UserTask extends EventEmitter {

  constructor(type, files, target) {
    super()
    this.roots = []
    if (type === 'file') {
      this.type = 'file'
      files.forEach(file => {
        this.roots.push(createFileUploadTask(null, file, target, null))
      })
    }
    else {
      this.type = 'folder'
      files.forEach(folder => {
        this.roots.push(createFolderUploadTask(null, folder, target, null))
      })
    }
  }
}
//create task factory
const createUserTask = (type, files, target) => {
  let userTask = new UserTask(type, files, target)
  userTasks.push(userTask)
  sendUploadMessage()
}
// file factory
const createFileUploadTask = (parent, file, target, root) => {
  let task = new fileUploadTask(parent, file, target, root)
  task.setState('hashless')
  return task
}
// state machine pattern
class fileUploadTask extends EventEmitter {

  constructor(parent, file, target, root) {
    super()
    this.abspath = file.abspath
    this.size = file.size
    this.progress = 0
    this.target = target
    this.parent = parent
    this.type = 'file'
    this.name = path.basename(file.abspath)
    this.isRoot = true
    if (this.parent) {
      this.parent.children.push(this)
      this.root = root
      this.isRoot = false
    }
    this.state = null
  }

  setState(newState,...args) {
    switch (this.state) {
      case 'hashless':
        this.exitHashlessState()
        break;
      case 'hashing':
        this.exitHashingState()
        break;
      case 'ready':
        this.exitReadyState()
        break;
      case 'running':
        this.exitRunningState()
        break;
      default:
        break
    }

    switch (newState) {
      case 'hashless':
        this.enterHashlessState(...args)
        break
      case 'hashing':
        this.enterHashingState(...args).then().catch(e=>{
          this.setState('finished',e)
        })
        break
      case 'ready':
        this.enterReadyState(...args)
        break
      case 'running':
        this.enterRunningState(...args)
        break
      case 'finished':
        this.enterFinishedState(...args)
        break
      default:
        break
    }
  }

  enterHashlessState() {
    this.state = 'hashless'
    addHashlessQueue(this)
  }

  exitHashlessState() {
    removeOutOfHashlessQueue(this)
  }

  async enterHashingState() {
    this.state = 'hashing'
    addToHashingQueue(this)
    this.sha = await hashFile(this.abspath)
    this.setState('ready')
  }

  exitHashingState() {
    removeOutOfHashingQueue(this)
  }

  enterReadyState() {
    this.state = 'ready'
    addToReadyQueue(this)
  }

  exitReadyState() {
    removeOutOfReadyQueue(this)
  }

  enterRunningState() {
    var _this = this
    this.state = 'running'
    addToRunningQueue(this)
    let body = 0
    let transform = new stream.Transform({
      transform: function(chunk, encoding, next) {
        body+=chunk.length;
        _this.progress = body / _this.size
        this.push(chunk)
        next()
      }
    })
    var tempStream = fs.createReadStream(this.abspath).pipe(transform);
    tempStream.path = this.abspath
    var options = {
      url:server+'/files/' + this.target,
      method:'post',
      headers: {
        Authorization: user.type+' '+user.token
      },
      formData : {
        'sha256' : this.sha,
        'file' : tempStream
      }
    }
    this.handle = request(options, (err, res, body) => {
      if (!err && res.statusCode == 200) {
        if (_this.root) {
          _this.root.success++
        }
        _this.progress = 1
        _this.setState('finished', null, JSON.parse(body).uuid)
      }else {
        console.log('upload file ' + path.basename(_this.abspath) + 'failed')
        if (_this.root) {
          _this.root.failed++
        }
        _this.progress = 1.01
        _this.setState('finished', err, null)
      }
    })
  }

  exitRunningState() {
    console.log('exitRunningState')
    this.handle = null
    removeOutOfRunningQueue(this)
  }

  enterFinishedState(err,uuid) {
    this.state = 'finished'
    if (this.parent) {
      this.parent.childrenFinish()
    }
    this.message = err ? err.message : null
  }
}

// folder factory 
const createFolderUploadTask = (parent, folder, target, root) => {
  let task = new folderUploadTask(parent, folder, target, root)
  task.setState('ready')
  return task
}

// state machine pattern
class folderUploadTask extends EventEmitter {

  constructor(parent, folder, target, root) {

    super()
    this.abspath = folder.abspath
    this.name = path.basename(folder.abspath)
    this.progress = 0
    this.target = target // uuid
    this.type = 'folder'
    // structural
    this.parent = parent
    this.children = []
    this.isRoot = true
    if (this.parent) {
      this.parent.children.push(this)
      this.root = root
      this.isRoot = false
    }else {
      this.root = this
      this.success = 0
      this.failed = 0
    }
    this.state = null
    this.finishCount = 0
  }

  setState(newState, ...args) {
    switch (this.state) {
      case 'ready':
        this.exitReadyState()
        break
      case 'running':
        this.exitRunningState()
        break
      case 'probing':
        this.exitProbingState()
        break
      default:
        break
    }

    switch (newState) {
      case 'ready':
        this.enterReadyState(...args)
        break
      case 'running':
        this.enterRunningState(...args)
        break
      case 'probing':
        this.enterProbingState(...args)
        break
      case 'finished':
        this.enterFinishedState(...args)
        break
      default:
        break
    }
  }

  enterReadyState() {
    this.state = 'ready'
    addToReadyQueue(this)
  }

  exitReadyState() {
    removeOutOfReadyQueue(this)
  }

  enterRunningState() {
    var _this = this
    this.state = 'running'
    addToRunningQueue(this)

    var options = {
      url:server+'/files/'+this.target,
      method:'post',
      headers: {
        Authorization: user.type+' '+user.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name:path.basename(this.abspath)
      })
    }
    this.handle = request(options,function (err,res,body) {
      if (!err && res.statusCode == 200) {
        if (_this.root) {
          _this.root.success++
        }
        _this.uuid = JSON.parse(body).uuid
        _this.setState('probing')
      }else {
        if (_this.root) {
          _this.root.failed++
        }
        console.log('create folder ' + path.basename(_this.abspath) + ' failed')
        console.log(err)
        _this.setState('finished', err)
      }
    })
  }

  exitRunningState() {
    this.handle = null
    removeOutOfRunningQueue(this)
  }

  enterProbingState() {
    this.state = 'probing'
    let _this = this
    folderStats(this.abspath, (err, xstats) => {
      // event handler
      if (err) return this.setState('finished', err)
      xstats.forEach(xstat => {
        let r = _this.root?_this.root:_this
        if (xstat.isDirectory()) {
          createFolderUploadTask(_this, xstat, _this.uuid, r)
        }
        else if (xstat.isFile()) {
          createFileUploadTask(_this, xstat, _this.uuid, r)
        }
      })

      this.setState('finished')
    })    
  }

  exitProbingState() {
    if (!this.children.length && this.parent) {
      this.parent.childrenFinish()
    }
  }

  enterFinishedState(err) {
    this.state = 'finished'
    if (!this.children.length && !this.parent) {
      updateStatusOfupload()
    }
    this.message = err ? err.message : null
  }

  childrenFinish() {
    this.finishCount++
    if (this.finishCount == this.children.length && this.parent) {
      this.parent.childrenFinish()
    }else if (this.finishCount == this.children.length && !this.parent) {
      updateStatusOfupload()
    }
  }
}

//handler
const uploadHandle = (args, callback) => {
  initArgs()
  let folderUUID = args.folderUUID
  let dialogType = args.type=='folder'?'openDirectory':'openFile'
  dialog.showOpenDialog({properties: [ dialogType,'multiSelections','createDirectory']},function(data){
    if (!data) return callback('get list err',null)
    let index = 0
    let count = data.length
    let uploadArr = []
    let readUploadInfor = (abspath) => {
      fs.stat(abspath,(err, infor) => {
        if (err) return console.log('读取目录 ' + abspath + ' 错误')
        uploadArr.push({size:infor.size,abspath:abspath}) 
        index++
        if(index < count) {
          readUploadInfor(data[index])
        }else {
          createUserTask(args.type,uploadArr,folderUUID)
          getMainWindow().webContents.send('message',uploadArr.length + '个任务添加至上传队列')
        }
      })
    }
    readUploadInfor(data[index])
  })
}

const dragFileHandle = (args) => {
  let files = []
  let folders = []
  let index = 0
  let loop = () => {
    let filePath = path.normalize(args.files[index])
    fs.stat(filePath, (err,stat) => {
      if (err) {
        index++
        return loop()
      }
      if (stat.isDirectory()) {
        folders.push({size:stat.size,abspath:filePath})
      }else {
        files.push({size:stat.size,abspath:filePath})
      }
      index++
      if (index == args.files.length) {
        console.log(folders)
        console.log(files)
        console.log(args.dirUUID)
        initArgs()
        if (files.length != 0) createUserTask('file', files, args.dirUUID) 
        if (folders.length != 0) createUserTask('folders', folders, args.dirUUID) 
        getMainWindow().webContents.send('message', files.length + folders.length + '个任务添加至上传队列')
        return
      }
      loop()
    })
  }
  loop()
}
//bind handler
const uploadCommandMap = new Map([
  ['UPLOAD_FOLDER', uploadHandle],
  ['UPLOAD_FILE', uploadHandle],
  ['DRAG_FILE', dragFileHandle]
])

registerCommandHandlers(uploadCommandMap)

ipcMain.on('loginOff', evt => {
  readyQueue.length = 0 
  hashlessQueue.length = 0 
  hashingQueue.length = 0 
  runningQueue.length = 0 
  userTasks.length = 0 
})
