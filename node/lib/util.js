
// login api
var utils = {

	quickSort: function(arr) {
		if (arr.length <= 1) {return arr}
		let pivotIndex = Math.floor(arr.length/2)
		let pivot = arr.splice(pivotIndex,1)[0]
		let left = []
		let right = []
		for (let item of arr) {
			if (item.doc.ctime > pivot.doc.ctime) {left.push(item)}
			else {right.push(item)}
		}
		return this.quickSort(left).concat([pivot], this.quickSort(right));
	},
};


var upload = {
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
}

var download = {

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

module.exports = utils