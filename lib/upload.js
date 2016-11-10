// import EventEmitter from 'events'
var EventEmitter = require('events')
var crypto = require('crypto')
var sendMessage = null
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


let httpRequestConcurrency = 4
let fileHashConcurrency = 4

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

const userTasks = []

class UserTask extends EventEmitter {

  constructor(type, files, target) {
    super()
    // case 1: multiple folders
    // case 2: multiple files
    this.roots = []
		if (type === 'file') {
      files.forEach(file => {
        this.roots.push(createFileUploadTask(null, file.abspath, target, null))
      })
    }
    else {
      files.forEach(folder => {
        this.roots.push(createFolderUploadTask(null, folder.abspath, target, null))
      })
    }
	}
}

const createUserTask = (type, files, target) => {
  let userTask = new UserTask(type, files, target)
  userTasks.push(userTask)
}

const sendUploadMessage = () => {
  let isSend = false
    for (var i = 0; i < userTasks.length; i++) {
      if (isSend == true) {
        break
      }
      for (var j = 0;j < userTasks[i].roots.length;j++) {
        if (userTasks[i].roots[j].finishCount != userTasks[i].roots[j].children.length ) {
          c(i + ' .. ' + j)
          isSend = true
          break
        }
      }
    }

  if (isSend && sendMessage==null) {
    sendMessage = setInterval(()=> {
        c('send message ...')
        mainWindow.webContents.send('refreshStatusOfUpload',userTasks)
        // dispatch(action.setUpload(userTasks))

      },1000)
  }else {
    clearInterval(sendMessage)
    sendMessage = null
  }
}

setInterval(() => {
  sendUploadMessage()
},5000)

const folderStats = (abspath, callback) => {
	fs.readdir(abspath, (err, entries) => {
		if (err) return callback(err)
		if (entries.length === 0) 
			return callback(null, [])
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

const hashFile = (abspath, callback) => {
  c(' ')
  c('hash : ' + path.basename(abspath))
  let hash = crypto.createHash('sha256')
  hash.setEncoding('hex')
  let fileStream = fs.createReadStream(abspath)
  fileStream.on('end',(err) => {
      if (err) {
        callback(err)
      }
      hash.end()
      let sha = hash.read()
      c(path.basename(abspath) + ' hash value : ' + sha)
      callback(null,sha)
    }
  )
  fileStream.pipe(hash) 
}

const createFileUploadTask = (parent, abspath, target, root) => {
  c(' ')
  c('create file : ' + path.basename(abspath))
  let task = new fileUploadTask(parent, abspath, target, root)
  // task.enterHashlessState()
  task.setState('hashless')
  return task
}

class fileUploadTask extends EventEmitter {

	constructor(parent, abspath, target, root) {
		super()
		this.abspath = abspath
		this.target = target
    this.parent = parent
    this.type = 'file'
    this.name = path.basename(abspath)
		if (this.parent) {
			this.parent.children.push(this)
      this.root = root
    }else {
      this.children = {length:1}
      this.root = this
    }
    this.finishCount = 0
    this.state = null
	}

  setState(newState,...args) {
    c(' ')
    c('setState : ' + newState + '(' + this.state +')' + ' ' + path.basename(this.abspath))
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
        this.enterHashingState(...args)
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

  enterHashingState() {
    this.state = 'hashing'
    addToHashingQueue(this)
    hashFile(this.abspath, (err,sha) => {
      if (err) {
        this.setState('finish',err)
        return
      }
      this.sha = sha
      this.setState('ready')
    })
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
        this.push(chunk)
        next();
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
        c('upload file ' + path.basename(this.abspath) + 'success!!!')
        if (_this.root) {
          _this.root.success++
        }
        _this.setState('finished', null, JSON.parse(body).uuid)
      }else {
        c('upload file ' + path.basename(this.abspath) + 'fail!!!')
        if (_this.root) {
          _this.root.failed++
        }
        _this.setState('finished', err, null)
      }
    })
  }

  exitRunningState() {
    this.handle = null
    removeOutOfRunningQueue(this)
  }

  enterFinishedState(err,uuid) {
    if (this.parent) {
      this.parent.childrenFinish()
    }
    this.finishCount++
    this.state = 'finished'
    this.message = err ? err.message : null
  }
}

// factory 
const createFolderUploadTask = (parent, abspath, target, root) => {
  c(' ')
  c('create folder : ' + path.basename(abspath))
  let task = new folderUploadTask(parent, abspath, target, root)
  // task.enterReadyState()
  task.setState('ready')
  return task
}

// state machine pattern
// ready -> running -> end
class folderUploadTask extends EventEmitter {

	constructor(parent, abspath, target, root) {

		super()
		this.abspath = abspath
    this.name = path.basename(abspath)
		this.target = target // uuid
    this.type = 'folder'
		// structural
		this.parent = parent
		this.children = []
		if (this.parent) {
			this.parent.children.push(this)
      this.root = root
    }else {
      this.root = this
      this.success = 0
      this.failed = 0
    }

    this.state = null
    this.finishCount = 0
	}

  setState(newState, ...args) {
    c(' ')
    c('setState : ' + newState + '(' + this.state +')' + ' ' + path.basename(this.abspath))
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
        c('create folder ' + path.basename(_this.abspath) + ' success')
        _this.root.success++
        _this.uuid = JSON.parse(body).uuid
        c('uuid is : ' + _this.uuid)
        _this.setState('probing')
      }else {
        _this.root.failed++
        c('create folder ' + path.basename(_this.abspath) + ' failed')
        c(err)
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
      if (err) {
        this.setState('finished', err)
        return
      }
  
      xstats.forEach(xstat => {
        if (xstat.isDirectory()) {
          // createFolderTaskFromStats()
          createFolderUploadTask(this, xstat.abspath, _this.uuid, this.root)
        }
        else if (xstat.isFile()) {
          // createFileTaskFromStats()
          createFileUploadTask(this, xstat.abspath, _this.uuid, this.root)
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
    this.message = err ? err.message : null
  }

  childrenFinish() {
    c(path.basename(this.abspath) + ' run children finish : ' + ' ___________________________________')
    this.finishCount++
    c('finish count is ' + this.finishCount)
    c('children length is ' + this.children.length)
    if (this.finishCount == this.children.length && this.parent) {
      c(path.basename(this.abspath) + ' is over------------------------------------------------')
      this.parent.childrenFinish()
    }else if (this.finishCount == this.children.length && !this.parent) {
      c(path.basename(this.abspath) + ' is absolute over------------------------------------------------')
    }
  }
}





const scan = () => {

}


// transimission api
var transmission = {
	//create folder
	createFolder: function(name,dir) {
		var _this = this
		var options = {
			url:server+'/files/'+dir.uuid,
			method:'post',
			headers: {
				Authorization: user.type+' '+user.token,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name:name
			})
		}
		request(options,function (err,res,body) {
			if (!err && res.statusCode == 200) {
				c('create folder ' + name + ' success')
				var folder = JSON.parse(body)
				_this.modifyFolder(name,dir,folder,true);
			}else {
				c('create folder ' + name + ' failed')
				mainWindow.webContents.send('message','新建文件夹'+name+'失败');
			}
		})
	},

	modifyFolder: function(name,dir,folder,send) {
		//insert folder obj into map
		
		let parentNode = map.get(dir.uuid);
		parentNode.children.push(Object.assign({},folder,{children:[]}))
		map.set(folder.uuid,parentNode.children[parentNode.children.length-1]);
		if (dir.uuid == currentDirectory.uuid) {
			//get children
			children = parentNode.children.map(item => Object.assign({},item,{checked:false,children:null}))
			//ipc
			if (send) {
				dispatch(action.setDir(currentDirectory,children,dirPath))
			}
			mainWindow.webContents.send('message','新建文件夹成功')
		}
	},
	//upload file
	dealUploadQueue: function() {
		if (uploadQueue.length == 0) {
			return
		}else {
			if (uploadQueue[0].index == uploadQueue[0].length && uploadNow.length == 0) {
				mainWindow.webContents.send('message',uploadQueue[0].success+' 个文件上传成功 '+uploadQueue[0].failed+' 个文件上传失败');
				this.modifyData(uploadQueue.shift())
				c('one upload task over');
				this.dealUploadQueue();
			}else {
				if (uploadNow.length == 0) {
					let gap = 1 - uploadNow.length;
					for (let i = 0; i < gap; i++) {
						let index = uploadQueue[0].index;
						if (index > uploadQueue[0].length-1) {
							return
						}
						uploadNow.push(uploadQueue[0].data[index]);
						this.uploadFile(uploadQueue[0].data[index]);
						uploadQueue[0].index++;
					}
				}
			}
		}
	},

	uploadFile: function(file) {
		var _this = this;
		let body = 0;
		let countStatus;
		let hashing = true
		if (file.size > 10000000) {
			countStatus = setInterval(()=>{
				if (hashing) {
					return
				}
				let status = body/file.size;
				mainWindow.webContents.send('refreshStatusOfUpload',file.path+file.uploadTime,status);
				c(file.path+ ' ======== ' + status);
			},1000);
		}
		
		let transform = new stream.Transform({
			transform: function(chunk, encoding, next) {
				body+=chunk.length;
				this.push(chunk)
				next();
			}
		})
		
		let hash = crypto.createHash('sha256')
		hash.setEncoding('hex')
		mainWindow.webContents.send('refreshStatusOfUpload',file.path+file.uploadTime,'正在校验文件');
		let fileStream = fs.createReadStream(file.path)

		fileStream.on('end',() => {
			hash.end()
			let sha = hash.read()
			hashing = false

			var tempStream = fs.createReadStream(file.path).pipe(transform);
			tempStream.path = file.path

			var options = {
				url:server+'/files/'+file.parent,
				method:'post',
				headers: {
					Authorization: user.type+' '+user.token
				},
				formData : {
					'sha256' : sha,
					'file' : tempStream
				}

			}
			request(options,function (err,res,body) {
				clearInterval(countStatus)
				if (!err && res.statusCode == 200) {
					c('create file success')
						uploadQueue[0].success += 1;
						file.status = 1;
						mainWindow.webContents.send('refreshStatusOfUpload',file.path+file.uploadTime,1);
						file.uuid = JSON.parse(body).uuid
				}else {
					c('create folder failed')
						uploadQueue[0].failed += 1;
						file.status = 1.01;
						mainWindow.webContents.send('refreshStatusOfUpload',file.path+file.uploadTime,1.01);
						mainWindow.webContents.send('message','upload failed');
				}
				let index = uploadNow.findIndex(item=>item.path == file.path);
				uploadNow.splice(index,1);
				if (uploadNow.length == 0) {
					_this.dealUploadQueue();
				}
			})
			
		})

		fileStream.pipe(hash)	
	},

	modifyData: function(files,uuid) {
		if (files.parent == currentDirectory.uuid) {
			ipcMain.emit('enterChildren',null,{uuid:files.parent})
		}
	},

  createUserTask:createUserTask

};

// export {
//   fileUploadTask,
//   folderUploadTask
// }

module.exports = transmission


