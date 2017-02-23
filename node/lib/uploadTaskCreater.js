import path from 'path'
import fs from 'fs'
import stream from 'stream'
import { dialog, ipcMain } from 'electron'

import request from 'request'
import uuid from 'node-uuid'

import store from '../serve/store/store'
import registerCommandHandlers from './command'
import { getMainWindow } from './window'
import utils from './util'

let server
let user
let httpRequestConcurrency = 4
let fileHashConcurrency = 6
let folderVisitConcurrency = 2
const userTasks = new Map()
const runningQueue = []
const readyQueue = []
const hashingQueue = []
const hashlessQueue = []
const visitlessQueue = []
const visitingQueue = []

//create task factory
const createUserTask = (type, files, target) => {
	initArgs()
	let task = new UserTask(type, files, target)
  userTasks.set(task.operationUUID, task)
}
//create task
class UserTask {
  constructor(type, files, target) {
  	this.operationUUID = uuid.v4()
    this.roots = []
    this.type = (type==='file'?'file':'folder')
    if (type === 'file') files.forEach(file => this.roots.push(createUploadTask(type ,null, file, target, true, this.operationUUID)))
    else files.forEach(folder => this.roots.push(createUploadTask(type, null, folder, target, true)))
  }
}

const createUploadTask = (type, parent, file , target, isRoot, taskUUID) => {
	let task
	if (type === 'file')  task = new fileUploadTask(type, parent, file, target, isRoot)
	else task = new folderUploadTask(type, parent, file, target, isRoot)
	task.requestProbe()
	return task
}

class STM {
	constructor(wrapper) {
		this.wrapper = wrapper
	}

	setState(NextState, ...args) {
		this.destructor()
		let next = new NextState(this.wrapper, ...args)
		this.wrapper.state = next
		this.wrapper.requestProbe()
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
		addToHashlessQueue(this)
	}

	async hashing() {
		try {
			this.wrapper.stateName = 'hashing'
			removeOutOfHashlessQueue(this)
			addToHashingQueue(this)
			console.log(this.wrapper.name + ' hashing running')
			this.wrapper.sha = await utils.hashFile(this.wrapper.abspath)
			removeOutOfHashingQueue(this)
			this.setState(UploadFileSTM)
		}
		catch(e) {
			//todo
			console.log(e)
		}
	}
}

class UploadFileSTM extends STM {
	constructor(wrapper) {
		super(wrapper)
		this.handle = null
	}

	destructor() {
		this.handle = null
	}

	requestProbe() {
		this.wrapper.stateName = 'uploadless'
		addToReadyQueue(this)
	}

	uploading() {
		this.wrapper.stateName = 'uploading'
		removeOutOfReadyQueue(this)
		addToRunningQueue(this)
		console.log(this.wrapper.name + ' upload running')
		let _this = this
		let body = 0

    let transform = new stream.Transform({
      transform: function(chunk, encoding, next) {
        body+=chunk.length;
        _this.wrapper.progress = body / _this.wrapper.size
        this.push(chunk)
        next()
      }
    })

    let tempStream = fs.createReadStream(this.wrapper.abspath).pipe(transform)
    tempStream.path = this.wrapper.abspath

    let options = {
      url: server + '/files/' + this.wrapper.target,
      method: 'post',
      headers: { Authorization: user.type + ' ' + user.token },
      formData: { 'sha256' : this.wrapper.sha,'file' : tempStream }
    }
    this.handle = request(options, (err, res, body) => {
    	if (!err && res.statusCode == 200) {
    		console.log('upload success')
    		removeOutOfRunningQueue(_this)
    		this.setState(FinishSTM)
    	}else {
    		console.log('upload failed')
    		console.log('err is : ')
    		console.log(err)
    		console.log('statusCode is : ')
    		console.log(res.statusCode)
    		console.log('statusMessage is : ')
    		console.log(res.statusMessage)
    	}
    })
	}
}

class FinishSTM extends STM {
	constructor(wrapper) {
		super(wrapper)
	}

	requestProbe() {
		this.wrapper.stateName = 'finish'
		if (this.wrapper.isRoot) {
			console.log(this.wrapper.name + 'upload finish')
		}else {
			console.log('a children task finish')
		}
	}
}

class VisitorSTM extends STM {
	constructor(wrapper) {
		super(wrapper)
	}

	requestProbe() {
		this.wrapper.stateName = 'visitless'
		addToVisitlessQueue(this)
	}

	visiting() {
		try {
			let _this = this
			this.wrapper.stateName = 'visiting'
			removeOutOfVisitlessQueue(this)
			addToVisitingQueue(this)
			console.log(this.wrapper.name + ' visiting running')
			utils.visitFolder(this.wrapper.abspath, this.wrapper.children, this.wrapper, this.wrapper, (err) => {
				_this.setState(createFolderSTM)
			})
		}catch(e) {
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
		this.wrapper.state = 'uploadless'
		addToReadyQueue(this)
	}

	uploading() {
		this.wrapper.state = 'uploading'
		removeOutOfReadyQueue(this)
		addToRunningQueue(this)
		console.log(this.wrapper.name + ' create running')
    let options = {
      url:server+'/files/'+this.wrapper.target,
      method:'post',
      headers: {
        Authorization: user.type+' '+user.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name:path.basename(this.wrapper.abspath)
      })
    }
    this.handle = request(options, (err, res, body) => {
    	if (err || res.statusCode != 200) {
    		//todo
    		console.log(err)
    		console.log(res.statusCode)
    		console.log(res.statusMessage)
    	}else {
    		console.log(body)
    		removeOutOfRunningQueue(this)
    	}

    })
	}
}

class UploadTask {
	constructor(type, parent, file, target, isRoot) {
		this.type = type
		this.taskUUID = uuid.v4()
		this.name = path.basename(file.abspath)
		this.abspath = file.abspath
		this.size = file.size
		this.target = target
		this.parent = parent
    this.isRoot = isRoot
    this.stateName = ''
	}

	requestProbe() {
		this.state.requestProbe()
	}
}

class fileUploadTask extends UploadTask{
	constructor(type, parent, file, target, isRoot) {
		super(type, parent, file, target, isRoot)
		this.progress = 0
		this.seek = 0
		this.sha = ''
		this.state = new HashSTM(this)
	}
}

class folderUploadTask extends UploadTask{
	constructor(type, parent, folder, target, isRoot) {
		super(type, parent, folder, target, isRoot)
		this.children = []
		if (isRoot) {
			this.state = new VisitorSTM(this)
			this.list = []
			this.count = 0
			this.lastFinishPath = ''
		}else {
			this.state = null
		}
	}
}

const initArgs = () => {
  server = 'http://' + store.getState().config.ip + ':3721'
  user = store.getState().login.obj
}

const scheduleHttpRequest = () => {
  while (runningQueue.length < httpRequestConcurrency && readyQueue.length)
    readyQueue[0].uploading()
}

const scheduleFileHash = () => {
  while (hashingQueue.length < fileHashConcurrency && hashlessQueue.length) {
    hashlessQueue[0].hashing()
   }
}

const scheduleFolderVisit = () => {
	while (visitlessQueue.length < folderVisitConcurrency && visitlessQueue.length) {
		visitlessQueue[0].visiting()
	}
}

// hashless
const addToHashlessQueue = (task) => {
  hashlessQueue.push(task)
  scheduleFileHash()
}

const removeOutOfHashlessQueue = (task) => {
  hashlessQueue.splice(hashlessQueue.indexOf(task),1)
}

// hashing
const addToHashingQueue = (task) => {
  hashingQueue.push(task)
}

const removeOutOfHashingQueue = (task) => {
  hashingQueue.splice(hashingQueue.indexOf(task),1)
  scheduleFileHash()
}

// ready
const addToReadyQueue = (task) => {
  readyQueue.push(task)
  scheduleHttpRequest()
}

const removeOutOfReadyQueue = (task) => {
  readyQueue.splice(readyQueue.indexOf(task), 1)
}

// running
const addToRunningQueue = (task) => {
  runningQueue.push(task)
}

const removeOutOfRunningQueue = (task) => {
  runningQueue.splice(runningQueue.indexOf(task), 1)
  scheduleHttpRequest()
}

//visitless
const addToVisitlessQueue = (task) => {
	visitlessQueue.push(task)
	scheduleFolderVisit()
}

const removeOutOfVisitlessQueue = (task) => {
	visitlessQueue.splice(visitlessQueue.indexOf(task),1)
}

//visiting
const addToVisitingQueue = (task) => {
	visitingQueue.push(this)
}

export default createUserTask