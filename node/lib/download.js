var path = require('path')
var fs = require('fs')
var EventEmitter = require('events')
var request = require('request')

import registerCommandHandlers from './command'
import { getMainWindow } from './window'
import store from '../serve/store/store'
import { ipcMain } from 'electron'

var c = console.log
var server
var user
var initArgs = () => {
  server = 'http://' + store.getState().config.ip + ':3721'
  user = store.getState().login.obj
}

let httpRequestConcurrency = 4
var sendMessage = null

const scheduleHttpRequest = () => {
	while (runningQueue.length < httpRequestConcurrency && readyQueue.length)
		readyQueue[0].setState('running')
}

var updateStatusOfDownload = (finish) => {
	let mainWindow = getMainWindow()
	mainWindow.webContents.send('refreshStatusOfDownload',userTasks, finish)
}

const sendDownloadMessage = () => {
  let isSend = false
    for (var i = 0; i < userTasks.length; i++) {
      for (var j = 0;j < userTasks[i].roots.length;j++) {
        if (userTasks[i].type == 'folder' && userTasks[i].roots[j].finishCount !== userTasks[i].roots[j].children.length ) {
          c(i + ' .. ' + j)
          isSend = true
          break
        }
        if (userTasks[i].type == 'file' && userTasks[i].roots[j].state !== 'finished') {
        	c(i + ' .. ' + j)
        	isSend = true
          	break
        }
      }
    }
    // console.log(isSend?'需要发送':'不要发送' + ' : ')
    // console.log(sendMessage?'已经在发送':'没有发送')
  if (isSend && sendMessage==null) {
    sendMessage = setInterval(()=> {
        updateStatusOfDownload(!isSend)
      },1000)
  }else if (!isSend && sendMessage != null) {
    clearInterval(sendMessage)
    updateStatusOfDownload(!isSend)
    sendMessage = null
  }
}

setInterval(() => {
	sendDownloadMessage()
},5000)

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

const userTasks = []

const createUserTask = (type, files) => {
  let userTask = new UserTask(type, files)
  userTasks.push(userTask)
  sendDownloadMessage()
}

class UserTask extends EventEmitter {

	constructor(type, files) {
		super()
	    // case 1: multiple folders
	    // case 2: multiple files
	    let downloadPath = store.getState().config.download
	    this.roots = []
	    if (type === 'file') {
	    	this.type = 'file'
	    	files.forEach(file => {
	    		this.roots.push(createFileDownloadTask(null, file, downloadPath, null))
	    	})
	    }
	    else {
	    	this.type = 'folder'
	    	files.forEach(folder => {
	    		this.roots.push(createFolderDownloadTask(null, folder, downloadPath, null))
	    	})
	    }
	}
}

const createFileDownloadTask = (parent, file, downloadPath, root) => {
	let task = new fileDownloadTask(parent, file, downloadPath, root)
	task.setState('ready')
	return task
}

class fileDownloadTask extends EventEmitter {
	constructor(parent, file, downloadPath, root) {
		super()
		this.type = 'file'
		this.size = file.size
		this.name = file.name
		this.uuid = file.uuid
		this.downloadPath = downloadPath
		this.state = null
		this.progress = 0
		this.isRoot = true
		if (parent) {
			this.parent = parent
			this.root = root
			this.isRoot = false
			this.parent.children.push(this)
		}
	}

	setState(newState,...args) {
		switch (this.state) {
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

	enterReadyState() {
		this.state = 'ready'
		addToReadyQueue(this)
	}

	exitReadyState() {
		removeOutOfReadyQueue(this)
	}

	enterRunningState() {
		try {
		let _this = this
		let finish = true
		this.state = 'running'
		addToRunningQueue(this)

		var body = 0
		
		var options = {
			method: 'GET',
			url: server+'/files/'+this.uuid,
			headers: {
				Authorization: user.type+' '+user.token
			}
		}

		var stream = fs.createWriteStream(path.join(this.downloadPath,this.name))
		stream.on('error',()=>{
			c(this.name)
			c(this.downloadPath)
		})
		this.handle = request(options)
		.on('error', function(err) {
		    c('request err : ')
		    c(err)
		    finish = false
		    if (_this.root) {
				_this.root.failed++
			}
			c(_this.name + ' 文件下载失败')
			fs.unlink(path.join(downloadPath,_this.name),err=>{
				c('删除下载失败文件成功')
			})
			_this.progress = 1.01
			_this.setState('finished',err)
		})
		.on('complete', function() {
		    if (finish) {
			    if (_this.root) {
			    	_this.root.success++
			    }
			    _this.progress = 1
			    _this.setState('finished',null)
		    }
		})
		.on('data',function(d){
			body += d.length
			_this.progress = body/_this.size
		}).pipe(stream)
	}catch(e){
		c(this.name)
		c(this.downloadPath)
		console.log(e)
	}
	}

	exitRunningState() {
		this.handle = null
		removeOutOfRunningQueue(this)
	}

	enterFinishedState(err) {
		if (this.parent) {
			this.parent.childrenFinish()
		}
		this.state = 'finished'
		this.message = err ? err.message : null
	}
}

const createFolderDownloadTask = (parent, folder, downloadPath, root) => {
	let task = new folderDownloadTask(parent, folder, downloadPath, root)
	task.setState('ready')
	return task
}

class folderDownloadTask {
	constructor(parent, folder, downloadPath, root) {
		this.type = 'folder'
		this.name = folder.name
		this.uuid = folder.uuid
		this.downloadPath = downloadPath
		this.state = null
		this.isRoot = true
		this.children = []
		this.finishCount = 0
		if (parent) {
			this.parent = parent
			this.root = root
			this.isRoot = false
			this.parent.children.push(this)
		}else {
			this.root = this
			this.success = 0
			this.failed = 0
		}
	}

	setState(newState, ...args) {
		// c(' ')
		// c('setState : ' + newState + '(' + this.state +')' + ' ' + this.name)
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
		fs.mkdir(path.join(this.downloadPath,this.name),err => {
			if (err) {
				c(err)
				c(this.name)
		c(this.downloadPath)
				_this.root.failed++
				_this.setState('finished',err)
			}else {
				_this.root.success++
				_this.setState('probing')
			}
		})
	}

	exitRunningState() {
		removeOutOfRunningQueue(this)
	}

	enterProbingState() {
		this.state = 'probing'
		let _this = this
		var options = {
			method: 'GET',
			url: server+'/files/'+this.uuid,
			headers: {
				Authorization: user.type+' '+user.token
			}

		}
		function callback (err,res,body) {
			if (!err && res.statusCode == 200) {
				let children = JSON.parse(res.body)
				children.forEach(item => {
					if (item.type == 'folder') {
						createFolderDownloadTask(_this,item,path.join(_this.downloadPath,_this.name),_this.root)
					}else {
						createFileDownloadTask(_this,item,path.join(_this.downloadPath,_this.name),_this.root)
					}
				})
				_this.setState('finished', null)
			}else {
				c('read this children failed')
				c(res)
				_this.setState('finished', err)
			}
		}
		request(options,callback)
	}

	exitProbingState() {
		this.handle = null
		if (!this.children.length && this.parent) {
	      this.parent.childrenFinish()
	    }
	}

	enterFinishedState(err) {
		this.state = 'finished'
    	this.message = err ? err.message : null
	}

	childrenFinish() {
		this.finishCount++
		if (this.finishCount == this.children.length && this.parent) {
			this.parent.childrenFinish()
		}else if (this.finishCount == this.children.length && !this.parent) {
			c(path.basename(this.downloadPath) + ' is absolute over------------------------------------------------')
			updateStatusOfDownload()
		}
	}
}

const downloadHandle = (args, callback) => {
  initArgs()
  if (args.files) {
  	createUserTask('file',args.files)
  }
  if (args.folders) {
  	createUserTask('folder',args.folders)
  }
  let count = args.files?args.files.length:args.folders.length
  getMainWindow().webContents.send('message', count + '个任务添加至下载队列')
}

const uploadCommandMap = new Map([
  ['DOWNLOAD', downloadHandle]
])

registerCommandHandlers(uploadCommandMap)

ipcMain.on('loginOff', evt => {
  readyQueue.length = 0 
  runningQueue.length = 0 
  userTasks.length = 0 
})
