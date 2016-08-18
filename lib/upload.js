
// transimission api
var transmission = {
	//create folder
	createFolder: function(name,dir) {
		var _this = this;
		var r = request.post(server+'/files/'+dir.uuid+'?type=folder',{
			headers: {
				Authorization: user.type+' '+user.token
			},
		},function (err,res,body) {
			if (!err && res.statusCode == 200) {
				console.log('res');
				var uuid = body;
				uuid = uuid.slice(1,uuid.length-1);
				_this.modifyFolder(name,dir,uuid,true);
			}else {
				mainWindow.webContents.send('message','新建文件夹失败');
				console.log('err');
				console.log(res);
				console.log(err);
			}
		});
		var form = r.form();
		form.append('foldername',name);
	},

	modifyFolder: function(name,dir,folderuuid,send) {
		//insert uuid
		var t = (new Date()).toLocaleString();
		var folder = {
			uuid:folderuuid,
			parent: dir.uuid,
			checked: false,
			share:false,
			attribute: {
				name:name,
				size: 4096,
				changetime: t,
				createtime: t,
			},
			type: 'folder',
			children:[],
			name:name,
			owner:[''],
			readlist:[''],
			writelist:['']
		};
		//insert folder obj into map
		map.set(folderuuid,folder);
		let parentNode = map.get(dir.uuid);
		parentNode.children.push(folder)
		if (dir.uuid == currentDirectory.uuid) {
			//get children
			children = parentNode.children.map(item => Object.assign({},item,{children:null}))
			//ipc
			if (send) {
				mainWindow.webContents.send('message','新建文件夹成功');
			}
			mainWindow.webContents.send('uploadSuccess',folder,_.cloneDeep(children));
		}
	},
	//upload file
	dealUploadQueue: function() {
		if (uploadQueue.length == 0) {
			return
		}else {
			if (uploadQueue[0].index == uploadQueue[0].length && uploadNow.length == 0) {
				mainWindow.webContents.send('message',uploadQueue[0].success+' 个文件上传成功 '+uploadQueue[0].failed+' 个文件上传失败');
				this.modifyData(uploadQueue.shift());
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
		if (file.attribute.size > 10000000) {
			countStatus = setInterval(()=>{
				let status = body/file.attribute.size;
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
		//callback
		function callback (err,res,body) {
			clearInterval(countStatus);
			if (!err && res.statusCode == 200) {
				uploadQueue[0].success += 1;
				file.status = 1;
				mainWindow.webContents.send('refreshStatusOfUpload',file.path+file.uploadTime,1);
				let uuid = body.slice(1,body.length-1);
				console.log(file.name + ' upload success ! uuid is ' + uuid);
				file.uuid = uuid;
			}else {
				uploadQueue[0].failed += 1;
				file.status = 1.01;
				mainWindow.webContents.send('refreshStatusOfUpload',file.path+file.uploadTime,1.01);
				console.log(file.name + ' upload failed ! reson:' + res.body);
				mainWindow.webContents.send('message','upload failed');
			}
			let index = uploadNow.findIndex(item=>item.path == file.path);
			uploadNow.splice(index,1);
			if (uploadNow.length == 0) {
				_this.dealUploadQueue();
			}
		}
		//request
		let r = request.post(server+'/files/'+currentDirectory.uuid+'?type=file',{
			headers: {
				Authorization: user.type+' '+user.token
			},
		},callback)
		//add file
		let form = r.form();
		let tempStream = fs.createReadStream(file.path).pipe(transform);
		tempStream.path = file.path
		form.append('file', tempStream);	
	},

	modifyData: function(files,uuid) {
		let dir = map.get(files.parent);
		for (let item of files.data) {
			if (item.status == 1.01) {
				continue;
			}
			map.set(item.uuid,item);
			dir.children.push(item);
		}
		if (files.parent == currentDirectory.uuid) {
			children = dir.children.map(i => Object.assign({},i,{children:null}));
			mainWindow.webContents.send('uploadSuccess',{},children);
		}
	}

};

module.exports = transmission


