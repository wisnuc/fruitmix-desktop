import path from 'path'
import fs from 'fs'
import os from 'os'
import child_process from 'child_process'

import request from 'request'
import uuid from 'node-uuid'
import { ipcMain } from 'electron'

import store from '../serve/store/store'
import { userTasks, finishTasks} from './newDownload'
import utils from './util'
import { getMainWindow } from './window'

let server
let user
let httpRequestConcurrency = 4
let visitConcurrency = 2
let sendHandler = null

const runningQueue = []
const readyQueue = []
const visitlessQueue = []
const visitingQueue = []

const initArgs = () => {
  server = 'http://' + store.getState().config.ip + ':3721'
  user = store.getState().login.obj
}

//determine whether need to start/close sending msg
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

//send summary information to browser
const sendMsg = () => {
	let mainWindow = getMainWindow()
  mainWindow.webContents.send('UPDATE_DOWNLOAD', userTasks.map(item => item.getSummary()), finishTasks.map(i => i.getSummary?i.getSummary():i))
}

//TaskManager creater
//new job :init manager with default parameter
//old job :init manager with defined parameter(uuid, downloadpath, downloading information)
const createTask = (target, name, size, type, newWork, p, u, d) => {
	initArgs()
	let taskUUID = u?u:uuid.v4()
	let abspath = p?p:store.getState().config.download
	let downloadingList = d?d:[]
	let task = new TaskManager(taskUUID, abspath, target, name, size, type, newWork, downloadingList)
	task.createStore()
	userTasks.push(task)
	task.readyToVisit()
	sendMessage()
}


//a download task manager for init/record/visit/schedule
class TaskManager {
	constructor(taskUUID, downloadPath, target, name, rootSize, type, newWork, downloadingList) {
		this.uuid = taskUUID
		this.downloadPath = downloadPath
		this.target = target
		this.name = name
		this.rootSize = rootSize //for visit
		this.type = type
		this.newWork = newWork

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

		this.downloadIndex = 0
		this.tree = []
		this.worklist = []
		this.downloading = []
		this.downloadingList = downloadingList //for continue downloading
		this.record = []

		this.countSpe0ed = setInterval(() => {
			let s = (this.completeSize - this.lastTimeSize) / 2
			this.speed = utils.formatSize(s) + ' / 秒'
			this.restTime = utils.formatSeconds((this.size - this.completeSize) / s)
			this.lastTimeSize = this.completeSize
		}, 2000)
	}

	// summary send to browser
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
			speed: this.speed
		}
	}

	//record log information
	recordInfor(msg) {
		if (this.record.length > 50) this.record.splice(0,20)
		console.log(msg)
		this.record.push(msg)
	}

	//add to visit queue && wait schedule
	readyToVisit() {
		this.state = 'visitless'
		addToVisitlessQueue(this)
	}

	//consist tree from server
	visit() {
		this.state = 'visiting'
		let _this = this
		this.recordInfor('开始遍历文件树...')
		removeOutOfVisitlessQueue(this)
		addToVisitingQueue(this)
		visitTask(this.target, this.name, this.type, this.rootSize, this.tree, this, (err, data) => {
			if (err) return _this.recordInfor('遍历服务器数据出错')
			_this.tree[0].downloadPath = _this.downloadPath
			removeOutOfVisitingQueue(this)
			_this.recordInfor('遍历文件树结束...')
			this.diff()
		})
	}

	//if task is new , check rootName isRepeat
	//if task is old , visit local file tree && diff the trees
	diff() {
		this.state = 'diffing'
		if (!this.newWork) {
			fs.stat(path.join(this.downloadPath, this.name), (err, stat) => {
				if (err) {
					this.recordInfor('已下载的文件查找错误')
					this.checkNameExist()
				}else {
					if (stat.isFile()) {
						this.recordInfor('文件下载任务 继续下载文件')
						this.pause = true
						this.schedule()
					}else {
						this.recordInfor('文件夹下载任务 查找本地已下载文件信息')
						let localObj = []
						visitLocalFiles(path.join(this.downloadPath, this.name), localObj, (err) => {
							if (err) {
								this.recordInfor('校验本地文件出错')
								this.schedule()
							}else {
								this.recordInfor('校验本地文件结束')
								diffTree(this.tree[0], localObj[0], this, err => {
									if (err) console.log(err)
									this.pause = true
									this.schedule()
								})
							}
						})
					}
				}
			})
		}else {
			this.recordInfor('新任务 不需要与服务器进行比较, 检查文件名是否重复')
			this.checkNameExist()	
		}
	}

	//check whether the root is same to someone in download path
	checkNameExist() {
		fs.readdir(this.downloadPath, (err, files) => {
			if (err) return this.recordInfor('下载目录未找到')
			let name = isFileNameExist(this.tree[0], 0, files)
			this.tree[0].name = name
			this.name = name
			this.updateStore()
			this.schedule()
		})
	}

	//pause all the task in downloading queue
	pauseTask() {
		if (this.pause) return
		this.pause = true
		this.downloading.forEach(work => {
			if (work.type === 'file') work.pause()
		})
	}

	//resume all the task in downloading queue
	resumeTask() {
		if (!this.pause) return
		this.pause = false
		this.downloading.forEach(work => {
			if (work.type === 'file') work.resume() 
		})
		this.schedule()
	}

	//download schedule only need to schedule download queue(upload include hash task)
	schedule() {
		this.state = 'schedule'
		if (this.pause || !this.count) return
		this.downloadSchedule()
	}

	//the file for condition begin downloading
	downloadSchedule() {
		console.log('进行下载调度...')
		if (this.pause) return this.recordInfor('下载任务已暂停')
		if (this.finishCount === this.worklist.length) return this.recordInfor('文件全部下载结束')
		if (this.downloading.length >=2 ) return this.recordInfor('任务下载队列已满')
		if (this.downloadIndex === this.worklist.length) return this.recordInfor('所有文件下载调度完成')
		this.recordInfor('正在调度第 ' + (this.downloadIndex + 1) + ' 个文件,总共 ' + this.worklist.length + ' 个')
		let _this = this
		let obj = this.worklist[this.downloadIndex]
		if (obj.stateName === 'finish') {
			this.recordInfor('文件已被下载，跳过...')
			this.downloadIndex++
			return this.downloadSchedule()
		}
		if (obj.downloadPath === '') return this.recordInfor('文件的父文件夹尚未创建，缺少目标，等待..')
		let stateMachine = obj.type == 'folder'? createFolderSTM : DownloadFileSTM
		obj.setState(stateMachine)
		this.downloading.push(obj)
		this.downloadIndex++
		obj.requestProbe()
		this.downloadSchedule()
	}

	//will be call when a node was downloaded
	workFinishCall() {
		//all nodes have been downloaded
		if (this.finishCount === this.worklist.length) {
			this.state = 'finish'
			this.finishDate = utils.formatDate()
			userTasks.splice(userTasks.indexOf(this),1)
			finishTasks.unshift(this)
			clearInterval(this.countSpeed)
			sendMessage()
			this.recordInfor(this.name + ' 下载完成')
			this.finishStore()
		}else {
			//running next
			this.updateStore()
			this.downloadSchedule()
		}
	}

	getStoreObj() {
		let downloadingArr = []
		this.downloading.forEach(item => {
			if (item.type === 'file') {
				downloadingArr.push(item.getSummary())
			}
		})
		return {
			_id: this.uuid,
			downloadPath: this.downloadPath,
			target: this.target,
			name: this.name,
			rootSize: this.rootSize,
			type: this.type,
			downloading: downloadingArr,
			finishDate: this.finishDate
		}
	}

	//will be call when a task is new
	createStore() {
		if (!this.newWork) return
		db.downloading.insert(this.getStoreObj(), (err, data) => {})
	}

	//will be call when a task node drain trigger
	updateStore() {
		let downloadingArr = []
		this.downloading.forEach(item => {
			if (item.type === 'file') {
				downloadingArr.push(item.getSummary())
			}
		})
		db.downloading.update({_id: this.uuid}, {$set: {name:this.name, downloading:downloadingArr}}, (err, data) => {
			// console.log(data)
		})
	}

	//move task from downloading store to downloaded store
	finishStore() {
		db.downloading.remove({_id: this.uuid}, {}, (err,data) => {
			if (err) return console.log(err)
		})

		db.downloaded.insert(this.getStoreObj(), (err, data) => {
			if (err) return console.log(err) 
			console.log(data)
		})
	}

	//remove task from taskList && nedb 
	delete(callback) {
		if (this.state === 'finish') {
			this.recordInfor('开始删除已完成传输任务...')
			callback('running', this.uuid)
		}else {
			this.recordInfor('开始删除正在下载任务...')
			this.pauseTask()
			this.recordInfor('暂停了下载任务')
			this.removeCache(callback.bind(this, 'running', this.uuid))
		}
	}

	async removeCache(callback) {
		let del = (p) => {
			return new Promise((resolve, reject) => {
					fs.unlink(p, (err, data) => {
						if (err) {
							reject(err)
						}
						else {
							resolve(data)
						}
					})
			})
		}

		while(this.downloading.length) {
			console.log('开始删除缓存...')
			if (this.downloading[0].type === 'folder') {
				this.downloading.shift()
			}else {
				let tmpPath = path.join(tmpTransPath, this.uuid + 
					this.downloading[0].timeStamp + 
					this.downloading[0].name)
				try{await del(tmpPath)}
				catch(e) {console.log('删除缓存' + tmpPath + '失败')}
				finally{this.downloading.shift()}
			}
		}
		let osType = os.platform()

		switch (osType) {
			case 'win32':
				var order = 'rd/s/q '+ path.join(this.downloadPath, this.name)
				child_process.exec(order)
				break
			default:
				var order = 'rm -rf '+ path.join(this.downloadPath, this.name)
				child_process.exec(order)
				break
		}

		callback()
	}

}

//visit tree from serve && check the seek of downloading files
const visitTask = (target, name, type, size, position, manager, callback) => {
	manager.count++
	manager.size += size
	let obj = type === 'file'?
  	new FileDownloadTask(target, name, type, size, manager):
  	new FolderDownloadTask(target, name, type, size, manager)

  let index = manager.downloadingList.findIndex(item => item.target === target)
  if (index !== -1) {
  	// may be local file has been removed
  	obj.seek = manager.downloadingList[index].seek
  	obj.timeStamp = manager.downloadingList[index].timeStamp
  	manager.completeSize += manager.downloadingList[index].seek
  }
  manager.worklist.push(obj)
	position.push(obj)

	if (type === 'file') return callback(null)

	let options = {
		method: 'GET',
		url: server + '/files/' + target,
		headers: {
			Authorization: user.type + ' ' + user.token
		}
	}

	request(options, (err, data) => {
		let tasks = JSON.parse(data.body)
		if (err) return callback(err)
		if (!tasks.length) return callback(null)
		let count = tasks.length
		let index = 0
		let task = tasks[index]
		let next = () => {visitTask(task.uuid, task.name, task.type, task.size?task.size:0, obj.children, manager, call)}
		let call = (err) => {
			if (err) return callback(err)
			if (++index === count) return callback(null)
			task = tasks[index]
			next()
		}
		next()
	})
}

//visit local files 
const visitLocalFiles = (abspath, position, callback) => {
	fs.stat(abspath, (err, stat) => {
		if (err || ( !stat.isDirectory() && !stat.isFile())) return callback(err)
		let type = stat.isDirectory()?'folder':'file'
		let obj = {name: path.basename(abspath), type, children: []}
		position.push(obj)
		if (stat.isFile()) return callback(null)
		fs.readdir(abspath, (err, entries) => {
			if (err) return callback(err)
			if (!entries.length) return callback(null)
			let count = entries.length
			let index = 0
			let next = () => {visitLocalFiles(path.join(abspath, entries[index]), obj.children, call)}
			let call = err => {
				if (err) return callback(err)
				if (++index == count) return callback()
				else next()
			}
			next()
		})
	})
}

//diff server file tree && local file tree
//mark the node has been finished
const diffTree = (taskPosition, localPosition, manager ,callback) => {
	if (taskPosition.name !== localPosition.name) return callback()
	taskPosition.stateName = 'finish'
	manager.finishCount++
	manager.completeSize += taskPosition.size?taskPosition.size:0
	if(taskPosition.type === 'file') return callback()
	let children = taskPosition.children
	if(!children.length) return callback()
	children.forEach(item => item.downloadPath = path.join(taskPosition.downloadPath, taskPosition.name))
	let count = children.length
	let index = 0
	let next = () => {
		let currentObj = taskPosition.children[index]
		let i = localPosition.children.findIndex(item => item.name == currentObj.name)
		if (i !== -1) {
			diffTree(currentObj, localPosition.children[i], manager, call)
		}else {
			call()
		}
	}
	let call = (err) => {
		if (++index == count) return callback()
		else next()
	}
	next()
}

//check the name isExist in download folder
//if name exist, rename the root file
const isFileNameExist = (position, times, list) => {
	let name = ''
	if(times === 0) {
		name = position.name
	}else {
		let arr = position.name.split('.')
		if(arr.length === 1) name = arr[0] + '(' + times + ')'
		else {
			arr[arr.length-2] += '(' + times + ')'
			name = arr.join('.')
		}
	}
	let index = list.findIndex(item => item === name)
	if (index === -1) {
		console.log('文件名是 : ' + name)
		return name
	}else {
		return isFileNameExist(position, ++times, list)	
	}
}

//Each instance is a fileNode of tree
class DownloadTask {
	constructor(target, name, type, size, manager) {
		this.target = target
		this.name = name
		this.type = type
		this.size = size
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
		let manager = this.manager
		this.recordInfor(this.name + ' 下载完毕')
		this.state = null
		this.stateName = 'finish'
		manager.downloading.splice(manager.downloading.indexOf(this), 1)
		manager.finishCount++
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

class FileDownloadTask extends DownloadTask{
	constructor(target, name, type, size, manager) {
		super(target, name, type, size, manager)
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

class FolderDownloadTask extends DownloadTask{
	constructor(target, name, type, size, manager) {
		super(target, name, type, size, manager)
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
	}

	beginDownload() {
		let _this = this
		let wrapper = this.wrapper
		wrapper.stateName = 'running'
		removeOutOfReadyQueue(this)
		addToRunningQueue(this)
    wrapper.recordInfor(wrapper.name + ' 开始创建...')
    fs.mkdir(path.join(wrapper.downloadPath, wrapper.name), err => {
    	if (!err) {
    		removeOutOfRunningQueue(_this)
    		wrapper.children.forEach(item => item.downloadPath = path.join(wrapper.downloadPath, wrapper.name))
    		wrapper.downloadFinish()
    	}else {

    	}
    })
	}
}

class DownloadFileSTM extends STM {
	constructor(wrapper) {
		super(wrapper)
		this.handle = null
		this.tmpDownloadPath = path.join(tmpTransPath, wrapper.manager.uuid + wrapper.timeStamp + wrapper.name)
	}

	beginDownload() {
		removeOutOfReadyQueue(this)
		addToRunningQueue(this)
		this.wrapper.manager.updateStore()
    this.wrapper.recordInfor(this.wrapper.name + ' 开始创建...')
    //check fileCache have been removed
    fs.exists(this.tmpDownloadPath,(exist) => {
    	if (exist) {console.log('找到文件缓存')}
    	else {
    		console.log('没有找到文件缓存 重新下载该文件')
    		this.wrapper.manager.completeSize -= this.wrapper.seek
    		this.wrapper.seek = 0
    	}
    	this.downloading()
    })
    
	}

	downloading() {
		let _this = this
		let wrapper = this.wrapper
		if (wrapper.size === wrapper.seek) return wrapper.manager.downloadSchedule()
		wrapper.stateName = 'running'
		
    let options = {
			method: 'GET',
			url: server + '/files/' + wrapper.target,
			headers: {
				Authorization: user.type + ' ' + user.token,
				Range: 'bytes=' + this.wrapper.seek + '-'
			}
		}
		let streamOptions = {
			flags: this.wrapper.seek==0?'w':'r+', 
			start: this.wrapper.seek,
			defaultEncoding: 'utf8',
		  fd: null,
		  mode: 0o666,
		  autoClose: true
		}
		let stream = fs.createWriteStream(this.tmpDownloadPath, streamOptions)
		stream.on('error', (err) => {
			console.log('stream error trigger')
			console.log(err)
		})

		stream.on('drain', () => {
			let gap = stream.bytesWritten - this.wrapper.lastTimeSize
			_this.wrapper.seek += gap
			this.wrapper.manager.completeSize += gap
			this.wrapper.lastTimeSize = stream.bytesWritten
			// console.log('一段文件写入完成 当前seek位置为 ：' + _this.wrapper.seek/_this.wrapper.size + '% 增加了 ：' + gap/this.wrapper.size )
			wrapper.manager.updateStore()
		})

		stream.on('finish', () => {
			// console.log('stream finish trigger')
			let gap = stream.bytesWritten - this.wrapper.lastTimeSize
			_this.wrapper.seek += gap
			this.wrapper.manager.completeSize += gap
			this.wrapper.lastTimeSize = stream.bytesWritten
			// console.log('一段文件写入结束 当前seek位置为 ：' + _this.wrapper.seek/_this.wrapper.size + '% 增加了 ：' + gap/this.wrapper.size )
			this.wrapper.lastTimeSize = 0
			if(this.wrapper.seek == this.wrapper.size) this.rename(this.tmpDownloadPath)
		})

		this.handle = request(options)
			.on('error',(err)=>{
				console.log('readstream error...')
				console.log(err)
			})
		
		_this.handle.pipe(stream)
	}

	rename(oldPath) {
		let _this = this
		let wrapper = this.wrapper
		fs.rename(oldPath, path.join(wrapper.downloadPath, wrapper.name), (err,data) => {
			removeOutOfRunningQueue(_this)
			_this.wrapper.downloadFinish()
		})
	}

	pause() {		
		if (this.wrapper.stateName !== 'running') return
		this.wrapper.stateName = 'pause'
		sendMsg()
		if (this.handle) this.handle.abort()
		this.wrapper.recordInfor(this.wrapper.name + '暂停了')
		removeOutOfRunningQueue(this)
	}

	resume() {
		if (this.wrapper.stateName !== 'pause') return
		this.wrapper.stateName = 'running'
		sendMsg()
		this.beginDownload()
		this.wrapper.recordInfor(this.wrapper.name + '继续下载')
	}
}

const scheduleVisit = () => {
	while (visitlessQueue.length < visitConcurrency && visitlessQueue.length)
		visitlessQueue[0].visit()
}

const scheduleHttpRequest = () => {
  while (runningQueue.length < httpRequestConcurrency && readyQueue.length)
    readyQueue[0].beginDownload()
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

ipcMain.on('PAUSE_DOWNLOADING', (e, uuid) => {
	if (!uuid) return
	let task = userTasks.find(item => item.uuid === uuid)
	if (task) {task.pauseTask()}
})

ipcMain.on('RESUME_DOWNLOADING', (e, uuid) => {
	if (!uuid) return
	let task = userTasks.find(item => item.uuid === uuid)
	if (task) task.resumeTask()
})

export default createTask

export { sendMsg }