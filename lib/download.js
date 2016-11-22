var EventEmitter = require('events')
let httpRequestConcurrency = 4
var sendMessage = null

const scheduleHttpRequest = () => {
	// c('running queue : ' + runningQueue.length)
	// c('ready queue : ' + readyQueue.length)
	while (runningQueue.length < httpRequestConcurrency && readyQueue.length)
		readyQueue[0].setState('running')
}

const updateStatusOfDownload = () => {
	mainWindow.webContents.send('refreshStatusOfDownload',userTasks)
}

const sendUploadMessage = () => {
  let isSend = false
    for (var i = 0; i < userTasks.length; i++) {
      for (var j = 0;j < userTasks[i].roots.length;j++) {
        if (userTasks[i].type == 'folder' && userTasks[i].roots[j].finishCount !== userTasks[i].roots[j].children.length ) {
          c(i + ' .. ' + j)
          isSend = true
          break
        }
        if (userTasks[i].type == 'file' && userTasks[i].roots[j].state !== 'finished') {
        	isSend = true
          	break
        }
      }
    }

  if (isSend && sendMessage==null) {
    sendMessage = setInterval(()=> {
        // c('begin send message ...')
        updateStatusOfDownload()
      },10000)
  }else if (!isSend && sendMessage != null) {
    clearInterval(sendMessage)
    updateStatusOfDownload()
    sendMessage = null
  }
}

setInterval(() => {
  sendUploadMessage()
},5000)

const folderStats = () => {

}


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
}

class UserTask extends EventEmitter {

	constructor(type, files) {
		super()
	    // case 1: multiple folders
	    // case 2: multiple files
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
		// c(' ')
		// c('setState : ' + newState + '(' + this.state +')' + ' ' + this.name)
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
		    // c('request complete : ')
		    if (finish) {
		    	// c(_this.name + ' 文件下载成功')
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
				c('get ' + _this.name + ' children : ')
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
		this.handle = request(options,callback)
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


// transimission api
var transmission = {

	dealDownloadQueue: function() {
		if (downloadQueue.length == 0) {
			return
		}else {
			if (downloadQueue[0].index == downloadQueue[0].length && downloadNow.length == 0) {
				mainWindow.webContents.send('message',downloadQueue[0].success+' 个文件下载成功 '+downloadQueue[0].failed+' 个文件下载失败')
				console.log('a upload task over')
				downloadQueue.shift()
				this.dealDownloadQueue()
			}else {
				if (downloadNow.length < 3) {
					let gap = 3 - downloadNow.length
					for (let i = 0; i < gap; i++) {
						let index = downloadQueue[0].index
						if (index > downloadQueue[0].length-1) {
							return
						}
						downloadNow.push(downloadQueue[0].data[index])
						this.download(downloadQueue[0].data[index])
						downloadQueue[0].index++
					}
				}
			}
		}
	},

	download: function(item) {
		var _this = this
		var body = 0
		let countStatus
		if (item.size > 10000000) {
			countStatus = setInterval(()=>{
				let status = body/item.size
				mainWindow.webContents.send('refreshStatusOfDownload',item.uuid+item.downloadTime,status)
				c(item.name+ ' ======== ' + status)
			},1000)
		}
		var options = {
			method: 'GET',
			url: server+'/files/'+item.uuid,
			headers: {
				Authorization: user.type+' '+user.token
			}
		}

		function callback (err,res,body) {
			clearInterval(countStatus)
			if (!err && res.statusCode == 200) {
				console.log('res')
				mainWindow.webContents.send('refreshStatusOfDownload',item.uuid+item.downloadTime,1)
				downloadQueue[0].success += 1
				let index = downloadNow.findIndex(i=>i.uuid == item.uuid)
				downloadNow.splice(index,1)
				if (downloadNow.length == 0) {
					_this.dealDownloadQueue()
				}
			}else {
				console.log('err')
				console.log(err)
				downloadQueue[0].failed += 1
				mainWindow.webContents.send('refreshStatusOfDownload',item.uuid+item.downloadTime,1.01)
				let index = downloadNow.findIndex(item3=>item3.uuid == item.uuid)
				downloadNow.splice(index,1)
				fs.unlink(path.join(downloadPath,item.name),err=>{
					c('删除下载失败文件成功')
				})
				if (downloadNow.length == 0) {
					_this.dealDownloadQueue()
				}
			}
		}
		var stream = fs.createWriteStream(path.join(downloadPath,item.name))

		// fs.readfile()

		request(options,callback).on('data',function(d){
			body += d.length
		}).pipe(stream)
	},

	getTreeCount: function(tree) {
		let count = 0
		loopTree(tree,downloadPath)
		function loopTree(tree) {
			count++
			tree.times = 0
			if (tree.children.length == 0) {
				return
			}else {
				tree.children.forEach(item=>{
					loopTree(item)
				})
			}
		}
		return count
	},

	downloadFolder: function(folder) {
		var _this = this
		try{
			looptree(folder.data,()=>{
				console.log('finish')
				let obj = downloadFolderNow.shift()
				dealwithQueue()
				mainWindow.webContents.send('message','文件夹 '+folder.data.name+'下载完成')
				mainWindow.webContents.send('refreshDownloadStatusOfFolder',folder.key,'已完成')
			},()=>{
				c('not finish')
				let obj = downloadFolderNow.shift()
				dealwithQueue()
				mainWindow.webContents.send('message','文件夹 '+folder.data.name+'下载失败')
				mainWindow.webContents.send('refreshDownloadStatusOfFolder',folder.key,'下载失败')
			})
			let s = setInterval(()=>{
				mainWindow.webContents.send('refreshDownloadStatusOfFolder',folder.key,folder.success+' / '+folder.count)
			},1000)
			
			ipcMain.on('loginOff',function() {
				clearInterval(s)
			})
			function dealwithQueue() {
				downloadFolderQueue.shift()
				if (downloadFolderQueue.length > 0) {
					downloadFolderNow.push(downloadFolderQueue[0])
					_this.downloadFolder(downloadFolderNow[0])		
				}
				clearInterval(s)
			}
			function looptree(tree,callback,failedCallback) {
				try{
					if (tree.type == 'file') {
						c(tree.name+' is file')
						_this.downloadFolderFile(tree.uuid,tree.path).then(()=>{
							folder.success++

							callback()
						}).catch(err=>{
							failedCallback()
						})
					}else {
						c(tree.name+' is folder')
						fs.mkdir(tree.path,err=>{
							if (err) {
								c(tree.path)
								c(err)
								console.log('folder failed')
								failedCallback()
							}else {
								console.log('folder success')
								folder.success++
								let count = tree.children.length
								let index = 0
								let success = function () {
									index++
									if (index == count) {
										callback()
									}else {
										looptree(tree.children[index],success,failed)		
									}
								}
								let failed = function () {
									// if (!tree.children[index].times) {
									// 	c(tree.children[index])
									// 	c('1')
									// 	return		
									// }
									// c('2')
									// tree.children[index].times++
									// if (tree.children[index].times>5) {
									// 	c('3')
									// 	index++
									// 	folder.children[index].times++
									// 	callback()
									// }else {
									// 	c('4')
									// 	looptree(tree.children[index],success,failed)
									// }
									failedCallback()
								}
								if (count == 0) {
									callback()
								}
								looptree(tree.children[index],success,failed)
							}
						})
					}
				}catch(e){}
			}
		}catch(e){
			c(e)
		}
	},

	downloadFolderFile: function(uuid,path) {
		var promise = new Promise((resolve,reject)=>{
			var options = {
				method: 'GET',
				url: server+'/files/'+uuid,
				headers: {
					Authorization: user.type+' '+user.token
				}
			}
			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					console.log('file success')
					resolve()
				}else {
					console.log('file failed')
					reject()
				}
			}
			var stream = fs.createWriteStream(path)

			request(options,callback).pipe(stream)
		})
		return promise
	},

	createUserTask: createUserTask

}

module.exports = transmission