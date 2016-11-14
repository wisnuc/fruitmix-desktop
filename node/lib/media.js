import path from 'path'
import fs from 'fs'
import request from 'request'
import { ipcMain } from 'electron'
import Debug from 'debug'

const debug = Debug('lib:media')
const c = debug

var mediaApi = {
	//getMediaData
	getMediaData : function () {
		var media = new Promise((resolve,reject)=>{ 
			var options = {
				method: 'GET',
				url: server+'/media',
				headers: {
					Authorization: user.type+' '+user.token
				}

			};
			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					resolve(JSON.parse(body));
				}else {
					reject(err);
				}
			}
			request(options,callback);
		});
		return media;
	},

	downloadMediaImage : function(hash) {
		var promise = new Promise((resolve,reject)=>{
			var options = {
				method: 'GET',
				url: server+'/media/'+hash+'/download',
				headers: {
					Authorization: user.type+' '+user.token
				}
			}
			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					resolve()
				}else {
					c('err : ')
					c(res.body)
					c(err)

					reject()
				}
			}
			var stream = fs.createWriteStream(path.join(mediaPath,hash))
			request(options,callback).pipe(stream)
		})
		return promise
	},

	getMediaShare : function() {
		var promise = new Promise((resolve,reject) => {
			var options = {
				method : 'GET',
				url : server + '/mediaShare',
				headers : {
					Authorization: user.type+' '+user.token	
				}
			}

			function callback(err,res,body) {
				if (!err && res.statusCode == 200) {
					resolve(JSON.parse(body))
				}else {
					c('has err :')
					c(res.body)
					c(err)
					reject()
				}
			}

			request(options,callback)
		})

		return promise
	},

	createMediaShare : function(medias, users, album) {
		var promise = new Promise((resolve, reject) => {
			var b
			if (album) {
				b = JSON.stringify({
					viewers : users,
					contents : medias,
					album : album
				})
			}else {
				b = JSON.stringify({
					viewers : users,
					contents : medias
				})
			}
			var options = {
				method : 'post',
				url : server + '/mediaShare',
				headers : {
					Authorization: user.type+' '+user.token,
					'Content-Type': 'application/json'
				},
				body: b
			}

			function callback(err,res,body) {
				if (!err && res.statusCode == 200) {
					resolve(JSON.parse(body))
				}else {
					c('has err :')
					c(res.body)
					c(err)
					reject(err)
				}
			}

			request(options,callback)
		})
		return promise
	}


};

module.exports = mediaApi;

//media
let media = []
let mediaMap = new Map()
let mediaShare = []
let mediaShareMap = new Map()
let thumbQueue = []
let thumbIng = []
let shareThumbQueue = []
let shareThumbIng = []

//path
let mediaPath = path.join(__dirname,'media')
let downloadPath = path.join(__dirname,'download')

// media api --------------------------------------------

//getMediaData
ipcMain.on('getMediaData',(err)=>{
	c(' ')
	c('获取media...')
	mediaApi.getMediaData().then((data)=>{
		c('media 列表获取成功')
		media = data
		media.forEach(item=>{
			if (item == null) {return}
			let obj = Object.assign({},item,{failed:0})
			item.failed = 0
			mediaMap.set(item.digest,item)
		})
		// mainWindow.webContents.send('mediaFinish',media)
		dispatch(action.setMedia(media))
	}).catch(err=>{
		c('media 列表获取失败')
		console.log(err)
	})
})
//getMediaShareThumb
ipcMain.on('getAlbumThumb', (err, item, digest) => {
	item.parent = digest
	shareThumbQueue.push(item)
	dealShareThumbQueue()
})

function dealShareThumbQueue() {
	c(' ')
	if (shareThumbQueue.length == 0) {
		return
	}else {
			c('shareThumbQueue.length ' + shareThumbQueue.length)
			if (shareThumbIng.length == 0) {
				c('not wait')
				for (var i=0;i<1;i++) {
					if (shareThumbQueue.length == 0) {
						break
					}
					let item = shareThumbQueue.shift()
					shareThumbIng.push(item)
					isShareThumbExist(item)
				}
			}else {
				c('wait')
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
				// if () {

				// }
				sendThumb(item)
				console.log(shareThumbQueue.length+' length')
			}).catch(err=>{
				c(item.digest+' failed')
				item.failed++
				let index = shareThumbIng.findIndex(i=>i.digest == item.digest)
				let t = shareThumbIng[index]
				shareThumbIng.splice(index,1)
				shareThumbQueue.push(t)
				// if (item.failed <5) {
				// 	fs.readFile(path.join(mediaPath,item.digest+'thumb210'),(err,data)=>{
				// 		if (err) {

				// 		}else {
				// 			c('find cache')
				// 		}
				// 	})
					
				// }else {
				// 	// item.status='failed'
				// 	// mainWindow.webContents.send('getThumbFailed',item)
				// }
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
ipcMain.on('getThumb',(err,item)=>{
	thumbQueue.push(item)
	dealThumbQueue()
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
	c(' ')
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
		dealThumbQueue()
	}
}

function downloadMedia(item,large) {
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

//getMediaImage
ipcMain.on('getMediaImage',(err,hash)=>{
	c(hash)
	mediaApi.downloadMediaImage(hash).then(()=>{
		c('download media image success')
		var imageObj = {}
		imageObj.path = path.join(mediaPath,hash)
		let item = mediaMap.get(hash)
		if (item != undefined) {
			imageObj.exifOrientation = item.exifOrientation
		}else {
			imageObj.exifOrientation = null
		}
		// fs.stat(item.path,function(err,data){
		// 	c(data)
		// })
		mainWindow.webContents.send('donwloadMediaSuccess',imageObj)
	}).catch(err=>{
		c('download media image failed')
	})
})

//getMediaShare
ipcMain.on('getMediaShare' , err => {
	c('获取mediaShare...')
	mediaApi.getMediaShare().then(data => {
		c('获取mediaShare成功')

		mediaShare = utils.quickSort(data)
		mediaShare.forEach(item => {
			mediaShareMap.set(item.digest,item)
		})
		dispatch(action.setMediaShare(mediaShare))
		//mainWindow.webContents.send('mediaShare',data)
	}).catch(err => {
		c('获取mediaShare失败')
		c(err)
	})
})

// medias   array   photo.digest
// users    array   user.uuid  ['xxx','xxx,'xxx']
// album    object  {title:'xxx',text:'xxx'}

ipcMain.on('createMediaShare',(err, medias, users, album) => {
	c(' ')
	c('create media share-----------------------------')
	mediaApi.createMediaShare(medias, users, album).then(data => {
		c(data)
		mediaShare.push(data)
		mediaShareMap.set(data.digest,mediaShare[mediaShare.length-1])
		dispatch(action.setMediaShare(mediaShare))
		if (album) {
			mainWindow.webContents.send('message','创建相册成功')
		}else {
			mainWindow.webContents.send('message','创建分享成功')
		}
	}).catch(err => {
		c(err)
		if (album) {
			mainWindow.webContents.send('message','创建相册失败')
		}else {
			mainWindow.webContents.send('message','创建相册失败')
		}
		
	})
})


