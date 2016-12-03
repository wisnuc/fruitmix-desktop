import path from 'path'
import fs from 'fs'
import request from 'request'
import { ipcMain } from 'electron'
import Debug from 'debug'

import { serverGetAsync, serverPostAsync, serverPatchAsync, serverDeleteAsync, serverDownloadAsync } from './server'
import action from '../serve/action/action'
import store from '../serve/store/store'
import utils from './util'
import { getMainWindow } from './window'

//init
const debug = Debug('lib:media')
const c = debug
var server
var user
var initArgs = () => {
  server = 'http://' + store.getState().config.ip + ':3721'
  user = store.getState().login.obj
}

//path
let mediaPath = path.join(process.cwd(),'media')
let downloadPath = path.join(process.cwd(),'download')

//media
let media = []
let mediaMap = new Map()

let mediaShare = []
let mediaShareMap = new Map()

let thumbReadyQueue = []
let thumbRunningQueue = []
let albumReadyQueue = []
let albumRunningQueue = []

var thumbConcurrency = 1
var taskQueue = []


//getMediaData
ipcMain.on('getMediaData',(err)=>{
	serverGetAsync('media').then((data)=>{
		c('media 列表获取成功')
		media = data
		media.forEach(item=>{
			if (item == null) {return}
			let obj = Object.assign({},item,{failed:0})
			item.failed = 0
			mediaMap.set(item.digest,item)
		})
		dispatch(action.setMedia(media))
	}).catch(err=>{
		c('media 列表获取失败')
		console.log(err)
	})
})
//getMediaShare
ipcMain.on('getMediaShare' , err => {
	serverGetAsync('mediaShare').then(data => {
		c('获取mediaShare成功')
		mediaShare = utils.quickSort(data)
		mediaShare.forEach(item => {
			mediaShareMap.set(item.digest,item)
		})
		dispatch(action.setMediaShare(mediaShare))
	}).catch(err => {
		c('获取mediaShare失败')
		c(err)
	})
})

// medias   array   photo.digest
// users    array   user.uuid  ['xxx','xxx,'xxx']
// album    object  {title:'xxx',text:'xxx'}

ipcMain.on('createMediaShare',(err, medias, users, album) => {
	let body = {
		viewers : users,
		contents : medias,
		album : album
	}
	serverPostAsync('mediaShare',body).then(data => {
		c('创建相册成功')
		mediaShare.push(data)
		mediaShareMap.set(data.digest,mediaShare[mediaShare.length-1])
		dispatch(action.setMediaShare(mediaShare))
		if (album) {
			getMainWindow().webContents.send('message','创建相册成功')
		}else {
			getMainWindow().webContents.send('message','创建分享成功')
		}
	}).catch(err => {
		c('创建相册失败')
		c(err)
		if (album) {
			getMainWindow().webContents.send('message','创建相册失败')
		}else {
			getMainWindow().webContents.send('message','创建相册失败')
		}
		
	})
})
//--------------------------------------------------------------------
ipcMain.on('getAlbumThumb', (err, item, digest) => {
	item.parent = digest
	shareThumbQueue.push(item)
	dealShareThumbQueue()
})

const createTask = (tasks, parent) => {
	let task = new createUserTask(tasks, parent)
	taskQueue.push(task)
}

class createUserTask {
	constructor(tasks, parent) {
		this.children = []
		tasks.forEach(item => {
			this.children.push(createThumbTask(item, parent, this))
		})
	}

	taskFinish() {
		let send = true
		for (let i = 0; i < this.children.length; i++) {
			if (this.children[i].state != 'finish') {
				c('还有正在传输任务 等待')
				send = false
				break
			}
		}
		if (send) {
			c('一个用户任务结束 发送')
			store.dispatch(action.setMedia(media))
		}
	}
}

function dealShareThumbQueue() {
	if (shareThumbQueue.length == 0) {
		return
	}else {
			c('shareThumbQueue.length ' + shareThumbQueue.length)
			if (shareThumbIng.length == 0) {
				for (var i=0;i<1;i++) {
					if (shareThumbQueue.length == 0) {
						break
					}
					let item = shareThumbQueue.shift()
					shareThumbIng.push(item)
					isShareThumbExist(item)
				}
			}
	}
}

function isShareThumbExist(item) {
	c(item.digest)
	fs.readFile(path.join(mediaPath,item.digest+'thumb210'),(err,data)=>{
		if (err) {
			c('not exist')
			downloadMedia(item,true,item).then((data)=>{
				c('download success')
				sendThumb(item)
				console.log(shareThumbQueue.length+' length')
			}).catch(err=>{
				c(item.digest+' failed')
				item.failed++
				let index = shareThumbIng.findIndex(i=>i.digest == item.digest)
				let t = shareThumbIng[index]
				shareThumbIng.splice(index,1)
				shareThumbQueue.push(t)
				dealShareThumbQueue()
			})
		}else {
			c('exist')
			sendThumb(item)
		}
	})

	function sendThumb(item){
		c(item.digest+' is over')
		let index = shareThumbIng.findIndex(i=>i.digest == item.digest)
		shareThumbIng.splice(index,1)
		//mainWindow.webContents.send('getShareThumbSuccess',item.digest,path.join(mediaPath,item.digest+'thumb210'))
		let photo = mediaShareMap.get(item.parent).doc.contents.find(p => p.digest == item.digest)
		photo.path = path.join(mediaPath,item.digest+'thumb210')
		c('photo path : ' + photo.path)
		dispatch(action.setMediaShare(mediaShare))
		dealShareThumbQueue()
		// setTimeout(dealShareThumbQueue,200)
	}
}

//getMediaThumb
ipcMain.on('getThumb',(err,tasks)=>{
	createTask(tasks, null)
})

function dealThumbQueue() {
	if (thumbQueue.length == 0) {
		return
	}else {

			if (thumbIng.length == 0) {
				for (var i=0;i<1;i++) {
					if (thumbQueue.length == 0) {
						break
					}
					let item = thumbQueue.shift()
					thumbIng.push(item)
					isThumbExist(item)
				}
			}

	}
}

function isThumbExist(item) {
	c(item.digest)
	fs.readFile(path.join(mediaPath,item.digest+'thumb138'),(err,data)=>{
		if (err) {
			downloadMedia(item,false,item).then((data)=>{
				sendThumb(item)
				console.log(thumbQueue.length+' length')
			}).catch(err=>{
				c(item.digest+' failed')
				item.failed++
				let index = thumbIng.findIndex(i=>i.digest == item.digest)
				let t = thumbIng[index]
				thumbIng.splice(index,1)
				if (item.failed <5) {
					fs.readFile(path.join(mediaPath,item.digest+'thumb'),(err,data)=>{
						if (err) {

						}else {
							c('find cache')
						}
					})
					thumbQueue.push(t)
				}else {
					item.status='failed'
					mainWindow.webContents.send('getThumbFailed',item)
				}
				dealThumbQueue()
				console.log(thumbQueue.length+' length')
			})
		}else {
			sendThumb(item)
		}
	})

	function sendThumb(item){
		c(item.digest+' is over')
		let index = thumbIng.findIndex(i=>i.digest == item.digest)
		thumbIng.splice(index,1)
		mediaMap.get(item.digest).path = path.join(mediaPath,item.digest+'thumb138')
		dispatch(action.setMedia(media))
	}
}

function downloadMedia(item,large) {
	initArgs()
	var size = large?'width=210&height=210':'width=138&height=138'
	var download = new Promise((resolve,reject)=>{
		let scale = item.width/item.height
		let height = 100/scale
		var options = {
			method: 'GET',
			url: server+'/media/'+item.digest+'/thumbnail?'+size+'&autoOrient=true&modifier=caret',
			headers: {
				Authorization: user.type+' '+user.token
			}
		}

		function callback (err,res,body) {
			if (!err && res.statusCode == 200) {
				console.log('res')
				resolve(body)
			}else {
				c('err')
				c(res.body)
				c(item.digest)
				fs.unlink(path.join(mediaPath,item.digest+'thumb'), (err,data)=>{
					reject(err)	
				})
				
			}
		}
			if (large) {
				var stream = fs.createWriteStream(path.join(mediaPath,item.digest+'thumb210'))
			}else {
				var stream = fs.createWriteStream(path.join(mediaPath,item.digest+'thumb138'))
			}

			request(options,callback).pipe(stream)
		})
	return download
}





const scheduleThumb = () => {
	while (thumbRunningQueue.length < thumbConcurrency && thumbReadyQueue.length) {
		thumbReadyQueue[0].setState('running')
	}
}	

const addToReadyQueue = (task) => {
	thumbReadyQueue.push(task)
	scheduleThumb()
}

const removeOutOfReadyQueue = (task) => {
	thumbReadyQueue.splice(thumbReadyQueue.indexOf(task), 1)
}

const addToRunningQueue = (task) => {
	thumbRunningQueue.push(task)
}

const removeOutOfRunningQueue = (task) => {
	thumbRunningQueue.splice(thumbRunningQueue.indexOf(task), 1)
	scheduleThumb()
}

const createThumbTask = (item, parent, root) => {
	let task = new thumbGetTask(item, parent, root)
	task.setState('ready')
	return task
}

class thumbGetTask {
	constructor(item, parent, root) {
		this.parent = parent
		this.item = item
		this.root = root
		this.state = null
		this.handle = null
		this.result = null
	}

	setState(newState,...args) {
		c(this.item.digest + 'state change : from ' + this.state + 'to ' + newState)
		switch(this.state) {
			case 'ready':
				this.exitReadyState()
				break
			case 'running':
				this.exitRunningState()
				break
			default:
				break
		}

		switch(newState) {
			case 'ready':
				this.enterReadyState()
				break
			case 'running':
				this.enterRunningState()
				break
			case 'finish':
				this.enterFinishState()
				break
			default :
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
		let _this = this
		this.state = 'running'
		addToRunningQueue(this)
		fs.readFile(path.join(mediaPath,this.item.digest+'thumb138'),(err,data)=>{
			if (err) {
				c('not find cache')
				let qs = {
					width :_this.parent?'138':'210',
					height : _this.parent?'138':'210',
					autoOrient : true,
					modifier : 'caret'
				}
				let digest = _this.item.digest
				serverDownloadAsync('media/' + digest + '/thumbnail', qs, mediaPath, digest + 'thumb138').then( data => {
					c('get Thumb 138 success')
					_this.result = 'success'
					_this.setState('finish')
				}).catch(err => {
					c('get Thumb 138 error : ')
					c(err)
					_this.result = 'failed'
					_this.setState('finish')
					
				})
			}else {
				c('find cache')
				_this.result = 'success'
				_this.setState('finish')
			}
		})
	}

	exitRunningState() {
		removeOutOfRunningQueue(this)
	}

	enterFinishState() {
		this.state = 'finish'
		c(this.item.digest+' is over')
		mediaMap.get(this.item.digest).path = path.join(mediaPath,this.item.digest+'thumb138')
		this.root.taskFinish()
	}
}


//getMediaImage
ipcMain.on('getMediaImage',(err,hash)=>{
	serverDownloadAsync('media/'+hash+'/download',null,mediaPath,hash).then((data) => {
		c('download media image' + hash + ' success')
		var imageObj = {}
		imageObj.path = path.join(mediaPath,hash)
		let item = mediaMap.get(hash)
		if (item != undefined) {
			imageObj.exifOrientation = item.exifOrientation
		}else {
			imageObj.exifOrientation = null
		}
		mainWindow.webContents.send('donwloadMediaSuccess',imageObj)
	}).catch(e => {
		c('download media image' + failed + ' success')
		c(e)
	})
})


