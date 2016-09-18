
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
			children = parentNode.children.map(item => Object.assign({},item,{children:null}))
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
		if (file.size > 10000000) {
			countStatus = setInterval(()=>{
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

		let fileStream = fs.createReadStream(file.path)

		fileStream.on('end',() => {
			hash.end()
			let sha = hash.read()

			var tempStream = fs.createReadStream(file.path).pipe(transform);
			tempStream.path = file.path

			var options = {
				url:server+'/files/'+currentDirectory.uuid,
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

		let dir = map.get(files.parent)
		for (let item of files.data) {
			if (item.status == 1.01) {
				continue;
			}
			dir.children.push(item);
			map.set(item.uuid,dir.children[dir.children.length-1]);
			
		}
		if (files.parent == currentDirectory.uuid) {
			children = dir.children.map(i => Object.assign({},i,{children:null}));
			dispatch(action.setDir(currentDirectory,children,dirPath))
		}
	}

};

module.exports = transmission


