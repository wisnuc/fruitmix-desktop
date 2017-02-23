import path from 'path'
import fs from 'fs'
import stream from 'stream'
import { dialog, ipcMain } from 'electron'

import request from 'request'
import uuid from 'node-uuid'

import store from '../serve/store/store'
import { getMainWindow } from './window'
import utils from './util'

let server
let user
let httpRequestConcurrency = 4
let fileHashConcurrency = 6
let visitConcurrency = 2
const userTasks = new Map()
const runningQueue = []
const readyQueue = []
const hashingQueue = []
const hashlessQueue = []
const visitlessQueue = []
const visitingQueue = []

//create task factory
const createUserTask = (files, target) => {
	initArgs()
	let task = new UserTask(files, target)
  userTasks.set(task.operationUUID, task)
}
/*
	UserTask is created by operation
	UserTask has one or more task
*/
class UserTask {
  constructor(files, target) {
  	this.operationUUID = uuid.v4()
    this.tasks = []
    files.forEach(abspath => this.tasks.push(createTask(abspath, target, true)))
  }
}

const createTask = (abspath, target) => {
	let task = new TaskManager(abspath, target, true)
	task.readyToVisit()
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
	constructor(abspath, target, newWork) {
		this.abspath = abspath
		this.target = target
		this.newWork = newWork
		this.name = path.basename(abspath)
		this.size = 0
		this.state = ''
		this.pause = false
		this.count = 0
		this.finishCount = 0
		this.tree = []
		this.worklist = []
		this.folderIndex = 0
		this.fileIndex = 0
		this.hashIndex = 0
		this.lastFolderIndex = -1
		this.lastFileIndex = -1
		this.hashing = []
		this.Uploading = []
	}

	readyToVisit() {
		this.state = 'visitless'
		addToVisitlessQueue(this)
	}

	visit() {
		console.log('开始遍历文件树...')
		removeOutOfVisitlessQueue(this)
		addToVisitingQueue(this)
		visitFolder(this.abspath, this.tree, this.worklist, this, () => {
			removeOutOfVisitingQueue(this)
			console.log('遍历文件树结束...')
			this.state = 'visited'
			this.diff()
		})
	}

	diff() {
		if (!this.newWork) {

		}else {
			console.log('新任务 不需要与服务器进行比较') 
			
		}

		for(let i = this.worklist.length-1 ;i>=0; i--) {
			if (this.lastFileIndex != -1) break
			if (this.worklist[i].type === 'file') this.lastFileIndex = i
		}

		for(let i = this.worklist.length-1 ;i>=0; i--) {
			if (this.lastFolderIndex != -1) break
			if (this.worklist[i].type === 'folder') this.lastFolderIndex = i
		}

		console.log(this.lastFileIndex)
		console.log(this.lastFolderIndex)

		this.schedule()
	}

	schedule() {
		this.state = 'schedule'
		if (this.pause || !this.count) return
		this.hashSchedule()
		this.uploadSchedule()
	}

	hashSchedule() {
		if (this.lastFileIndex === -1) return console.log('任务列表中不包含文件')
		if (this.hashing.length >= 2) return console.log('任务的HASH队列已满')
		if (this.hashIndex === this.lastFileIndex) return console.log(this.name + ' 所有文件hash计算完毕')
		console.log('HASH 序列号为 ：' + this.hashIndex )
		let _this = this	
		let obj = this.worklist[this.hashIndex]
		if (obj.type === 'folder' || obj.stateName === 'finish') this.hashIndex++
		else{
			obj.setState(HashSTM)
			this.hashing.push(obj)
			this.hashIndex++
			obj.requestProbe()
		}
		this.hashSchedule()
	}

	uploadSchedule() {
		if (this.UploadingCount >=2 || this.lastFolderIndex === -1) return
	}
}

const visitFolder = (abspath, position, worklist, manager, callback) => {
	fs.stat(abspath, (err, stat) => {
		if (err || ( !stat.isDirectory() && !stat.isFile())) return callback(err)
		let type = stat.isDirectory()?'folder':'file'
		let obj = stat.isDirectory()?
			new folderUploadTask(type, abspath, manager):
			new fileUploadTask(type, abspath, manager)
		manager.count++
		manager.size += stat.size
		worklist.push(obj)
		position.push(obj)
		if (stat.isFile()) return callback(null)
		fs.readdir(abspath, (err, entries) => {
			if (err) return callback(err)
			else if (!entries.length) return callback(null)
			let count = entries.length
			let index = 0
			let next = () => {visitFolder(path.join(abspath, entries[index]), obj.children, worklist, manager, call)}
			let call = err => {
				if (err) return callback(err)
				if (++index == count) return callback()
				else next()
			}
			next()
		})
	})
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
}

class fileUploadTask extends UploadTask{
	constructor(type, abspath, manager) {
		super(type, abspath, manager)
		this.progress = 0
		this.seek = 0
		this.sha = ''
	}

	hashFinish() {
		console.log(this.name + ' HASH计算完毕')
		this.stateName = 'hashed'
		this.manager.hashing.splice(this.manager.hashing.indexOf(this),1)
		this.manager.schedule()
	}
}

class folderUploadTask extends UploadTask{
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
		addToHashlessQueue(this)
		console.log(this.wrapper.name + ' 进入HASH队列')
	}

	async hashing() {
		console.log(this.wrapper.name + ' 开始计算HASH')
		try {
			this.wrapper.stateName = 'hashing'
			removeOutOfHashlessQueue(this)
			addToHashingQueue(this)
			this.wrapper.sha = await utils.hashFile(this.wrapper.abspath)
			removeOutOfHashingQueue(this)
			this.wrapper.hashFinish()
			// this.setState(UploadFileSTM) 
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
    		removeOutOfRunningQueue(_this)
    		this.wrapper.uuid = JSON.parse(body).uuid
    		this.wrapper.schedule()
    	}else {
    		console.log('upload failed')
    		console.log('err is : ')
    		console.log(err)
    		console.log(res.statusCode)
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
		this.wrapper.stateName = 'finishing'
		console.log('')
		if (this.wrapper.isRoot) {
			if (this.wrapper.type === 'file') {
				//nothing todo
			}else {
				//running next
				this.wrapper.lastFinishPath = this.wrapper.abspath
				this.wrapper.children.forEach( item => item.target = this.wrapper.uuid)
				// console.log(this.wrapper.list[this.wrapper.index])
				this.wrapper.list[this.wrapper.index].state = new createFolderSTM(this.wrapper.list[this.wrapper.index])
				this.wrapper.list[this.wrapper.index].requestProbe()
			}
		}else {

			this.wrapper.root.index++
			this.wrapper.root.lastFinishPath = this.wrapper.abspath
			this.wrapper.children.forEach( item => item.target = this.wrapper.uuid)

			let rootNode = this.wrapper.root
			let list = rootNode.list
			let index = rootNode.index
			let count = rootNode.count

			if (index == (count - 1)) return
			if (list[index].type === 'file') list[index].state = new HashSTM(list[index])
			else list[index].state = new createFolderSTM(list[index])
			list[index].requestProbe()
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
				// _this.setState(createFolderSTM)
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
		this.wrapper.stateName = 'uploadless'
		addToReadyQueue(this)
	}

	uploading() {
		this.wrapper.stateName = 'uploading'
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
    		console.log('create failed')
    		console.log(err)
    		console.log(res.statusCode)
    		console.log(res.statusMessage)
    	}else {
    		console.log(body)
    		removeOutOfRunningQueue(this)
    		this.wrapper.uuid = JSON.parse(body).uuid
    		this.setState(FinishSTM)
    	}
    })
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

const scheduleVisit = () => {
	while (visitlessQueue.length < visitConcurrency && visitlessQueue.length) {
		visitlessQueue[0].visit()
	}
}

//visitless
const addToVisitlessQueue = (task) => {
	visitlessQueue.push(task)
	scheduleVisit()
}

const removeOutOfVisitlessQueue = (task) => {
	visitlessQueue.splice(visitlessQueue.indexOf(task),1)
}

//visiting
const addToVisitingQueue = (task) => {
	visitingQueue.push(this)
}

const removeOutOfVisitingQueue = (task) => {
	visitingQueue.splice(visitingQueue.indexOf(task),1)
	scheduleVisit()
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

export default createUserTask