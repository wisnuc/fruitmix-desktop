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
import { userTasks, finishTasks} from './newUpload'

let server
let user
let httpRequestConcurrency = 4
let fileHashConcurrency = 6
let visitConcurrency = 2
let partSize = 20000000
let sendHandler = null

const runningQueue = []
const readyQueue = []
const hashingQueue = []
const hashlessQueue = []
const visitlessQueue = []
const visitingQueue = []

// ipcMain.on('getTransmission')
//sendMessage
const sendMessage = () => {
	let shouldSend = false
	for(let i = 0; i < userTasks.length; i++) {
		if (userTasks[i].state !== 'pause') {
			shouldSend = true
			break
		}
	}
	if (shouldSend && !sendHandler) {
		console.log('开始发送传输信息')
		sendHandler = setInterval(sendMsg, 2000)
		sendMsg()
	}else if (!shouldSend && sendHandler) {
		console.log('停止发送传输信息')
		clearInterval(sendHandler)
		sendHandler = null
		sendMsg()
	}
}

const sendMsg = () => {
	let mainWindow = getMainWindow()
  mainWindow.webContents.send('UPDATE_UPLOAD', userTasks.map(item => item.getSummary()), finishTasks.map(i => i.getSummary?i.getSummary():i))
}

const createTask = (abspath, target, type, newWork, u, r, rootUUID) => {
	initArgs()
	let taskUUID = u?u:uuid.v4()
	let uploadRecord = r?r:[]
	let task = new TaskManager(taskUUID, abspath, target, type, newWork, uploadRecord, rootUUID)
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
	constructor(uuid, abspath, target, type, newWork, uploadRecord, rootUUID) {
		this.uuid = uuid
		this.abspath = abspath
		this.target = target
		this.type = type
		this.name = path.basename(abspath)
		this.newWork = newWork
		this.rootUUID = rootUUID? rootUUID: ''
		
		this.size = 0//not need rootsize for visit 
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
		this.uploadRecord = uploadRecord

		this.countSpeed = setInterval(() => {
			let s = (this.completeSize - this.lastTimeSize) / 1
			this.speed = utils.formatSize(s) + ' / 秒'
			this.restTime = utils.formatSeconds((this.size - this.completeSize) / s)
			this.lastTimeSize = this.completeSize
		}, 1000)
	}

	getSummary() {
		return {
			uuid: this.uuid,
			type: this.type,
			name: this.name,
			size: this.size,
			completeSize: this.completeSize,
			count: this.count,
			finishCount: this.finishCount,
			restTime: this.restTime,
			finishDate: this.finishDate,
			state: this.state,
			pause: this.pause,
			record: this.record,
			speed: this.speed
		}
	}

	recordInfor(msg) {
		if (this.record.length > 50) this.record.splice(0,20)
		console.log(msg)
		this.record.push(msg)
	}

	readyToVisit() {
		this.state = 'visitless'
		addToVisitlessQueue(this)
	}

	visit() {
		this.state = 'visiting'
		let _this = this
		this.recordInfor('开始遍历文件树...')
		removeOutOfVisitlessQueue(this)
		addToVisitingQueue(this)
		visitFolder(this.abspath, this.tree, this.worklist, this, (err, data) => {
			_this.tree[0].target = _this.target
			removeOutOfVisitingQueue(this)
			_this.recordInfor('遍历文件树结束...')
			_this.state = 'visited'
			_this.diff()
		})
	}

	diff() {
		this.state = 'diffing'

		for(let i = this.worklist.length-1 ;i>=0; i--) {
			if (this.lastFileIndex != -1) break
			if (this.worklist[i].type === 'file') this.lastFileIndex = i
		}

		for(let i = this.worklist.length-1 ;i>=0; i--) {
			if (this.lastFolderIndex != -1) break
			if (this.worklist[i].type === 'folder') this.lastFolderIndex = i
		}

		if (!this.newWork) {
			this.pause = true
			// console.log(this)
			//....



		}else {
			this.recordInfor('新任务 不需要与服务器进行比较') 
			this.checkNameExist()
		}
	}

	async checkNameExist() {
		let _this = this
		try{
			let list = await serverGetAsync('files/' + this.target)
			let name = _this.tree[0].name
			let times = 1
					
			while(list.findIndex(item => item.name === name) !== -1) {
				times++
				let arr = _this.tree[0].name.split('.')
				if (arr.length  == 1 ) name = arr[0] + '(' + times + ')'
				else {
					arr[arr.length-2] += '(' + times + ')'
					name = arr.join('.')
				}
			}
			_this.tree[0].name = name
			_this.name = name
			_this.schedule()
		}catch(e) {
			return console.log('上传目标没找到....',e)
		}

	}

	pauseTask() {
		this.pause = true
		this.uploading.forEach(work => {
			if (work.type === 'file') work.pause()
		})
	}

	resumeTask() {
		this.pause = false
		this.uploading.forEach(work => {
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
		console.log('HASH调度...')
		if (this.lastFileIndex === -1) return this.recordInfor('任务列表中不包含文件')
		if (this.hashing.length >= 2) return this.recordInfor('任务的HASH队列已满')
		if (this.hashIndex === this.lastFileIndex + 1) return this.recordInfor(this.name + ' 所有文件hash调度完成')
		this.recordInfor('正在HASH第 ' + this.hashIndex + ' 个文件')
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
		console.log('上传调度...')
		if (this.finishCount === this.worklist.length) return this.recordInfor('文件全部上传结束')
		if (this.uploading.length >=2 ) return this.recordInfor('任务上传队列已满')
		if (this.fileIndex === this.worklist.length) return this.recordInfor('所有文件上传调度完成')
		this.recordInfor('正在调度第 ' + (this.fileIndex + 1) + ' 个文件,总共 ' + this.worklist.length + ' 个')

		let _this = this
		let obj = this.worklist[this.fileIndex]
		if (obj.stateName === 'finish') {
			this.recordInfor('文件已被上传过，跳过...')
			this.fileIndex++
			this.uploadSchedule()
			return
		}
		if (obj.target === '') {
			this.recordInfor('当前文件父文件夹正在创建，缺少目标，等待...')
			return
		}
		
		else if (obj.type === 'file' && obj.sha === '') {
			this.recordInfor('当前文件HASH尚未计算，等待...')
			return
		}
		else {
			let stateMachine = obj.type == 'folder'? createFolderSTM : UploadFileSTM
			obj.setState(stateMachine)
			this.uploading.push(obj)
			this.fileIndex++
			obj.requestProbe()
		}
		this.uploadSchedule()
	}

	workFinishCall() {
		if (this.finishCount === this.worklist.length) {
			this.state = 'finish'
			this.finishDate = utils.formatDate()
			userTasks.splice(userTasks.indexOf(this),1)
			finishTasks.unshift(this)
			clearInterval(this.countSpeed)
			sendMessage()
			this.finishStore()
		}else {
			this.uploadSchedule()
		}
	}

	getStoreObj() {
		let uploadArr = []
		this.uploading.forEach(item => {
			if (item.type === 'file') {
				uploadArr.push(item.getSummary())
			}
		})
		return {
			_id: this.uuid,
			abspath: this.abspath,
			target: this.target,
			name: this.name,
			rootSize: this.rootSize,
			type: this.type,
			uploading: uploadArr,
			finishDate: this.finishDate,
			rootUUID: this.rootUUID
		}
	}

	createStore() {
		if (!this.newWork) return
		db.uploading.insert(this.getStoreObj(), (err, data) => {
			if(err) return console.log(err)
		})
	}

	updateStore() {
		let uploadArr = []
		this.uploading.forEach(item => {
			if (item.type == 'file') {
				uploadArr.push(item.getSummary())
			}
		})

		db.uploading.update({_id: this.uuid}, {$set: {name:this.name, uploading:uploadArr, rootUUID:this.rootUUID}}, (err, data) => {
			// console.log(data)
		})
	}

	finishStore() {
		db.uploading.remove({_id: this.uuid}, {}, (err,data) => {
			if (err) return console.log(err)
		})

		db.uploaded.insert(this.getStoreObj(), (err, data) => {
			if (err) return console.log(err) 
			console.log(data)
		})
	}
}

const visitFolder = (abspath, position, worklist, manager, callback) => {
	fs.stat(abspath, (err, stat) => {
		if (err || ( !stat.isDirectory() && !stat.isFile())) return callback(err)
		let type = stat.isDirectory()?'folder':'file'
		let obj = stat.isDirectory()?
			new FolderUploadTask(type, abspath, manager):
			new FileUploadTask(type, abspath, stat.size, manager)
		manager.count++
		manager.size += stat.size
		worklist.push(obj)
		position.push(obj)
		if (stat.isFile()) return callback(null)
		fs.readdir(abspath, (err, entries) => {
			if (err) return callback(err)
			if (!entries.length) return callback(null)
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

	uploadFinish() {
		let manager = this.manager
		this.recordInfor(this.name + ' 上传完毕')
		this.stateName = 'finish'
		if (this === this.manager.tree[0]) {
			console.log('根节点上传完成')
			this.manager.rootUUID = this.uuid
		}
		manager.uploading.splice(manager.uploading.indexOf(this), 1)
		manager.finishCount++
		manager.workFinishCall()
	}

	recordInfor(msg) {
		this.manager.recordInfor(msg)
	}
}

class FileUploadTask extends UploadTask{
	constructor(type, abspath, size, manager) {
		super(type, abspath, manager)
		this.size = size
		this.seek = 0
		this.sha = ''
		this.parts = []
		this.taskid = ''
		this.segmentsize = size > 1000000000 ? size/50 : partSize
	}

	getSummary() {
		return {
			name: this.name,
			target: this.target,
			abspath: this.abspath,
			seek: this.seek
		}
	}

	hashFinish() {
		this.recordInfor(this.name + ' HASH计算完毕')
		this.manager.hashing.splice(this.manager.hashing.indexOf(this),1)
		this.manager.schedule()
	}
}

class FolderUploadTask extends UploadTask{
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
		this.wrapper.recordInfor(this.wrapper.name + ' 进入HASH队列')
		addToHashlessQueue(this)
	}

	hashing() {
		let wrapper = this.wrapper
		wrapper.recordInfor(this.wrapper.name + ' 开始计算HASH')
		wrapper.stateName = 'hashing'
		removeOutOfHashlessQueue(this)
		addToHashingQueue(this)
		try {
			let options = {
			    env:{absPath: wrapper.abspath, size: wrapper.size, partSize},
			    encoding:'utf8',
			    cwd: process.cwd()
			}
			let child = child_process.fork('node/lib/filehash.js', [], options)
			child.on('message',(obj) => {
				wrapper.sha = obj.hash
				wrapper.parts = obj.parts
				removeOutOfHashingQueue(this)
				wrapper.hashFinish()
			})

			child.on('error', (err) => {
				console.log('hash error!')
				console.log(err)
			})
			
		}catch(e) {
			//todo
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
		console.log('begin upload')
		this.wrapper.stateName = 'uploading'
		removeOutOfReadyQueue(this)
		addToRunningQueue(this)
    let options = {
      url:server+'/files/'+this.wrapper.target,
      method:'post',
      headers: {
        Authorization: user.type+' '+user.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: this.wrapper.name
      })
    }

    this.wrapper.recordInfor(this.wrapper.name + ' 开始创建...')
    this.handle = request(options, (err, res, body) => {
    	if (err || res.statusCode != 200) {
    		//todo
    		this.wrapper.recordInfor(this.wrapper.name + ' 创建失败')
    		console.log(err)
    		console.log(res.statusCode)
    		console.log(res.statusMessage)
    	}else {
    		removeOutOfRunningQueue(this)
    		this.wrapper.uuid = JSON.parse(body).uuid
    		this.wrapper.children.forEach(item => item.target = this.wrapper.uuid)
    		this.wrapper.uploadFinish()
    	}
    })
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

	beginUpload() {
		this.wrapper.stateName = 'uploading'
		removeOutOfReadyQueue(this)
		addToRunningQueue(this)
		this.wrapper.manager.updateStore()
		this.wrapper.recordInfor(this.wrapper.name + ' 开始上传...')
		this.createUploadTask()
	}

	uploadWholeFile() {
		let _this = this
    let transform = new stream.Transform({
      transform: function(chunk, encoding, next) {
        _this.wrapper.manager.completeSize += chunk.length
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
    		_this.wrapper.uuid = JSON.parse(body).uuid
    		_this.wrapper.uploadFinish()
    	}else {
    		this.wrapper.recordInfor(this.wrapper.name + ' 上传失败')
    		console.log(err)
    		console.log(res.statusCode)
    		console.log(res.statusMessage)
    	}
    })
	}

	createUploadTask() {
		let options = {
      url: server+'/filemap/' + this.wrapper.target,
      method:'post',
      headers: {
       	Authorization: user.type + ' ' + user.token,
       	'Content-Type': 'application/json'
     	},
     	body: JSON.stringify({
       	filename :this.wrapper.name,
       	size: this.wrapper.size,
       	segmentsize: this.segmentsize,
       	sha256: this.wrapper.sha
      })
    }

    request(options, (err,res, body) => {
    	if (err || res.statusCode !== 200) {
    		this.wrapper.recordInfor('创建上传任务失败，缺少对应API，上传整个文件')
    		this.uploadWholeFile()
    		return
    	}
    	let b = JSON.parse(body)
    	obj.taskid = b.taskid
    	this.uploadSegment()
    })
	}

	uploadSegment() {
		let wrapper = this.wrapper
		console.log('开始上传第' + wrapper.seek + '块')
		console.log('----------------------------------------------')
		var url = server + 
				'/filemap/?' + wrapper.target + 
				'/segmenthash=' + wrapper.parts[s].sha + 
				'&start=' + s + 
				'&taskid=' + obj.taskid
				
		var stream = fs.createReadStream(obj.absPath, {start:wrapper.parts[s].start, end: wrapper.parts[s].end,autoClose:true})
		stream.on('error', err => {
			console.log('第' + s +'块 ' + 'stream: '+ err)
		})
		stream.on('open',() => {
			console.log('第' + s +'块 ' + 'stream: open')
		})
		stream.on('close',() => {
			console.log('第' + s +'块 ' + 'stream: close')
		})

		stream.on('end',() => {
			console.log('第' + s +'块 ' + 'stream: end')
		})

		var options = {
			host: server.split(':')[0],
			port: server.split(':')[1],
			headers: {
				Authorization: user.type + ' ' + user.token,
			},
			method: 'PUT',
			path: encodeURI('/filemap/' + wrapper.target +'?filename=' + wrapper.name + 
				'&segmenthash=' + wrapper.parts[s].sha + 
				'&start=' + s + 
				'&taskid=' + wrapper.taskid 
			)
		}

		this.handle = http.request(options).on('error',(err) => {
			console.log('第' + s +'块 ' + 'req : err')
			console.log(err)
		}).on('response',(res) => {
			console.log('第' + s +'块 ' + 'req : response')
			console.log(res.statusCode)
			if(res.statusCode == 200) {
				return this.partUploadFinish()
			}
		}).on('abort', () => {
			console.log('第' + s +'块 ' + 'req : abort')
		}).on('aborted', () => {
			console.log('第' + s +'块 ' + 'req : aborted')
		}).on('connect', () => {
			console.log('第' + s +'块 ' + 'req : connect')
		}).on('socket', () => {
			console.log('第' + s +'块 ' + 'req : socket')
		}).on('upgrade', () => {
			console.log('第' + s +'块 ' + 'req : upgrade')
		}).on('pipe', () => {
			console.log('第' + s +'块 ' + 'req : pipe')
		})

		stream.pipe(req)
	}

	partUploadFinish() {
		wrapper.seek++
		if (wrapper.seek == wrapper.parts.length) {
			console.log('所有块已经上传完成')
		}
	}
}

const initArgs = () => {
  server = 'http://' + store.getState().config.ip + ':3721'
  user = store.getState().login.obj
}

const scheduleHttpRequest = () => {
  while (runningQueue.length < httpRequestConcurrency && readyQueue.length)
   	readyQueue[0].beginUpload()
}

const scheduleFileHash = () => {
  while (hashingQueue.length < fileHashConcurrency && hashlessQueue.length) 
    hashlessQueue[0].hashing()
}

const scheduleVisit = () => {
	while (visitlessQueue.length < visitConcurrency && visitlessQueue.length) 
		visitlessQueue[0].visit()
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
	console.log('removeOutOfReadyQueue')
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

export default createTask

export { sendMsg }