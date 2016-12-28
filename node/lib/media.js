//import core module
import path from 'path'
import fs from 'fs'
import request from 'request'
import { ipcMain } from 'electron'
import Debug from 'debug'
//import file module
import { serverGetAsync, serverPostAsync, serverPatchAsync, serverDeleteAsync, serverDownloadAsync } from './server'
import action from '../serve/action/action'
import store from '../serve/store/store'
import utils from './util'
import { getMainWindow } from './window'

//init
const debug = Debug('lib:media')
const c = debug

// var mediaPath = path.join(process.cwd(),'media')
var thumbConcurrency = 1

var media = []
var mediaMap = new Map()
var mediaShare = []
var mediaShareMap = new Map()
var taskQueue = []
var thumbReadyQueue = []
var thumbRunningQueue = []

//listener
ipcMain.on('getMediaData',(event)=>{
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

ipcMain.on('getMediaShare' , event => {
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

ipcMain.on('createMediaShare',(event, medias, users, album) => {
	let body = {
		viewers : users,
		contents : medias,
		album : album
	}
	serverPostAsync('mediaShare',body).then(data => {
		c('创建相册成功')
		data = JSON.parse(data)
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

ipcMain.on('getMediaImage',(event,hash)=>{
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
		getMainWindow().webContents.send('donwloadMediaSuccess',imageObj)
	}).catch(e => {
		//c('download media image' + failed + ' success')
		//console.log(e);
	})
})

ipcMain.on('getThumb',(event,tasks)=>{
	console.log(tasks)
	createTask(tasks, null)
})

ipcMain.on('getAlbumThumb', (event, tasks, mediaShareDigest) => {
	createTask(tasks, mediaShareDigest)
})

//schedule download queue
const scheduleThumb = () => {
	while (thumbRunningQueue.length < thumbConcurrency && thumbReadyQueue.length) {
		thumbReadyQueue[0].setState('running')
	}
}

//create task send by Browser
const createTask = (tasks, mediaShareDigest) => {
	let task = new createUserTask(tasks, mediaShareDigest)
	taskQueue.push(task)
}

class createUserTask {
	constructor(tasks, mediaShareDigest) {
		this.children = []
		tasks.forEach(item => {
			this.children.push(createThumbTask(item, mediaShareDigest, this))
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

//state change function called when state change
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

//create thumb download object when task create
const createThumbTask = (item, mediaShareDigest, root) => {
	let task = new thumbGetTask(item, mediaShareDigest, root)
	task.setState('ready')
	return task
}

class thumbGetTask {
	constructor(item, mediaShareDigest, root) {
		this.mediaShareDigest = mediaShareDigest
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
		let cacheName = this.mediaShareDigest?'thumb210':'thumb138'
		this.state = 'running'
		addToRunningQueue(this)
		fs.stat(path.join(mediaPath,this.item.digest+cacheName),(err,data)=>{
			if (err) {
				c('not find cache')
				let qs = {
					width :_this.mediaShareDigest?'138':'210',
					height : _this.mediaShareDigest?'138':'210',
					autoOrient : true,
					modifier : 'caret'
				}
				let digest = _this.item.digest
				serverDownloadAsync('media/' + digest + '/thumbnail', qs, mediaPath, digest + cacheName).then( data => {
					c('get Thumb success')
					_this.result = 'success'
					_this.setState('finish')
				}).catch(err => {
					c('get Thumb error : ')
					c(err)
					if (!_this.result) {
						_this.result = 'failed'
						_this.setState('finish')
					}
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
		if (this.result == 'failed') {
			this.root.taskFinish()
			return
		}
		if (this.mediaShareDigest) {
			c('thumb exist in mediaShare')
			let ms = mediaShareMap.get(this.mediaShareDigest)
			let photo = ms.doc.contents.find(item => item.digest == this.item.digest)
			photo.path = path.join(mediaPath,this.item.digest+'thumb210')
		}else {
			c('thumb exist in mediaList')
			mediaMap.get(this.item.digest).path = path.join(mediaPath,this.item.digest+'thumb138')
		}
		this.root.taskFinish()
	}
}
