
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
}

// var mediaApi = {
// 	//getMediaData
// 	getMediaData : function () {
// 		var media = new Promise((resolve,reject)=>{ 
// 			var options = {
// 				method: 'GET',
// 				url: server+'/media',
// 				headers: {
// 					Authorization: user.type+' '+user.token
// 				}

// 			};
// 			function callback (err,res,body) {
// 				if (!err && res.statusCode == 200) {
// 					resolve(JSON.parse(body));
// 				}else {
// 					reject(err);
// 				}
// 			}
// 			request(options,callback);
// 		});
// 		return media;
// 	},

// 	downloadMediaImage : function(hash) {
// 		var promise = new Promise((resolve,reject)=>{
// 			var options = {
// 				method: 'GET',
// 				url: server+'/media/'+hash+'/download',
// 				headers: {
// 					Authorization: user.type+' '+user.token
// 				}
// 			}
// 			function callback (err,res,body) {
// 				if (!err && res.statusCode == 200) {
// 					resolve()
// 				}else {
// 					c('err : ')
// 					c(res.body)
// 					c(err)

// 					reject()
// 				}
// 			}
// 			var stream = fs.createWriteStream(path.join(mediaPath,hash))
// 			request(options,callback).pipe(stream)
// 		})
// 		return promise
// 	},

// 	getMediaShare : function() {
// 		var promise = new Promise((resolve,reject) => {
// 			var options = {
// 				method : 'GET',
// 				url : server + '/mediaShare',
// 				headers : {
// 					Authorization: user.type+' '+user.token	
// 				}
// 			}

// 			function callback(err,res,body) {
// 				if (!err && res.statusCode == 200) {
// 					resolve(JSON.parse(body))
// 				}else {
// 					c('has err :')
// 					c(res.body)
// 					c(err)
// 					reject()
// 				}
// 			}

// 			request(options,callback)
// 		})

// 		return promise
// 	},

// 	createMediaShare : function(medias, users, album) {
// 		var promise = new Promise((resolve, reject) => {
// 			var b
// 			if (album) {
// 				b = JSON.stringify({
// 					viewers : users,
// 					contents : medias,
// 					album : album
// 				})
// 			}else {
// 				b = JSON.stringify({
// 					viewers : users,
// 					contents : medias
// 				})
// 			}
// 			var options = {
// 				method : 'post',
// 				url : server + '/mediaShare',
// 				headers : {
// 					Authorization: user.type+' '+user.token,
// 					'Content-Type': 'application/json'
// 				},
// 				body: b
// 			}

// 			function callback(err,res,body) {
// 				if (!err && res.statusCode == 200) {
// 					resolve(JSON.parse(body))
// 				}else {
// 					c('has err :')
// 					c(res.body)
// 					c(err)
// 					reject(err)
// 				}
// 			}

// 			request(options,callback)
// 		})
// 		return promise
// 	}
// };


/**
const fileNavAsync = async (context, target) => {

  if (target === null) {

    // get drive list
    drives = await getDrivesAsync()
    // user uuid
		let uuid = store.getState().login.obj.uuid
    // find home drive uuid
    let driveUUID = store.getState().server.users.find(item => item.uuid === uuid).home
    // find home drive 
		let drive = drives.find(item => item.uuid == driveUUID)
		if (!drive) 
			throw new Error('can not find root node')
 
    // set root and map
		rootNode = Object.assign({}, drive, { children:[] })
		map.set(rootNode.uuid, rootNode)

    target = rootNode.uuid
  }

  let folder = map.get(target)    
  let kids = await listFolderAsync(target)

  updateLocalTree(folder, kids)

  let directory = Object.assign({}, folder, { children: undefined }) 
  let children = kids.map(kid => Object.assign({}, kid, {
    children: null, // TODO
    checked: false, // TODO 
  }))

  let path = fileNodePath(folder)

  let newState = { directory, children, path } 
  store.dispatch({
    type: 'SET_DIR2',
    data: newState
  })

  return { directory, children, path }
}
**/

// function enterChildren(selectItem) {

// 	dispatch(action.loadingFile())
// 	c(' ')
// 	c('enterChildren : ')
// 	//c('open the folder : ' + selectItem.name?selectItem.name:'null')

//   // get target node
// 	let folder = map.get(selectItem.uuid)

//   // list node, http get
// 	fileApi.getFile(selectItem.uuid).then(file => {
    
// 		folder.children = []

// 		file.forEach((item, index) => {
//       let x = Object.assign({}, item, {
//         parent:selectItem.uuid,
//         children:[]
//       })
//       folder.children.push(x)
// 			map.set(item.uuid, x)
// 		})

//     // {currentDirectory, children, path}

//     // mapped object
// 		currentDirectory = Object.assign({}, selectItem, {
//       children:null
//     })

//     // mapped objects
// 		children = file.map(item=>
//       Object.assign({}, item, {
//         children:null,
//         checked:false
//       }))

// 		dirPath.length = 0
// 		getPath(folder)

// 		dispatch(action.setDir(currentDirectory, children, dirPath))

// 	}).catch(err => {
// 		c(err)
// 	})
// }

// // input file node
// // return array 
// function getPath(obj) {
// 	//obj is root?
// 	if (obj.parent == undefined || obj.parent == '') {
// 		dirPath.unshift({key:'',value:{}})
// 		return 
// 	}else {
// 		//insert obj to path
// 		let item = map.get(obj.uuid)
// 		dirPath.unshift({key:item.name,value:Object.assign({},item,{children:null})})
// 		getPath(map.get(obj.parent))
// 	}
// }

// //delete

// // objArr filenode array
// // 
// ipcMain.on('delete',(e,objArr,dir)=>{

// 	let count = 0
// 	c(' ')
// 	c('删除文件 : ')
// 	deleteItem()
// 	function deleteItem() {
// 		fileApi.deleteFile(objArr[count].uuid,dir.uuid).then(()=>{
// 			c(objArr[count].uuid,dir.uuid + ' 删除成功')
// 			let index = map.get(dir.uuid).children.findIndex( (value) => value.uuid == objArr[count].uuid)
// 			if (index != -1) {
// 				 map.get(dir.uuid).children.splice(index,1)
// 				 let obj = map.get(objArr[count].uuid)
// 				 // delete obj
// 				 map.delete(objArr[count].uuid)
// 			}
// 			operationFinish()
// 		}).catch(err=>{
// 			c(objArr[count].uuid,dir.uuid + ' 删除失败')
// 			operationFinish()
// 		})
// 	}

// 	function operationFinish() {
// 		count++
// 		if (count != objArr.length) {
// 			deleteItem()
// 		} else {
// 			if (dir.uuid == currentDirectory.uuid) {
// 				enterChildren(dir)
// 			}
// 		}
// 	}
// })

// //rename
// ipcMain.on('rename',(e,uuid,name,oldName)=>{
// 	fileApi.rename(uuid,name,oldName).then(()=>{
// 		map.get(uuid).name = name
// 		// map.get(uuid).attribute.name = name
// 	}).catch((err)=>{
// 		mainWindow.webContents.send('message','文件重命名失败')	
// 	})
// })

// //getTreeChildren
// ipcMain.on('getTreeChildren',function(err,uuid) {
// 	if (uuid && uuid!='') {
// 		let item = map.get(uuid)
// 		let name = item.name
// 		let ch = []
// 		item.children.forEach(item=>{
// 			if (item.type == 'folder') {
// 				ch.push({name:item.name,uuid:item.uuid,parent:item.parent})
// 			}
// 		})
// 		let treeObj = {isNull:false,children:ch,name:name,parent:item.parent,uuid:item.uuid}
// 		mainWindow.webContents.send('treeChildren',treeObj)
// 	}
// 	// let result = map.get(uuid)
// 	// result.children = result.children.map((item)=>{
// 	// 	return Object.assign({},item,{children:null})
// 	// })
// })

// ipcMain.on('move',function(err,arr,target) {
// 	let allPromise = arr.map((item,index)=>move(item.uuid,target,index))
// 	Promise.all(allPromise).then((result)=>{
// 		mainWindow.webContents.send('message',arr.length+' 个文件移动成功')
// 		if (currentDirectory.uuid == arr[0].parent) {
// 			enterChildren(currentDirectory)
// 		}
// 	}).catch(r=>{
// 		mainWindow.webContents.send('message','文件 '+arr[r].attribute.name+'移动失败')
// 		if (currentDirectory.uuid == arr[0].parent) {
// 			enterChildren(currentDirectory)
// 		}
// 	})
// })

// function move(uuid,target,index) {
// 	let promise = new Promise((resolve,reject)=>{
// 		var options = {
// 			headers: {
// 				Authorization: user.type+' '+user.token
// 			},
// 			form: {target:target}
// 		}
// 		function callback (err,res,body) {
// 			if (!err && res.statusCode == 200) {
// 				console.log(uuid + 'move to '+ target +'success')
// 				c(body)
// 				resolve(body)
// 				let currentNode = map.get(uuid)
// 				let parent = map.get(currentNode.parent)
// 				let targetNode = map.get(target)
// 				currentNode.parent = target
// 				parent.children.splice(parent.children.findIndex(item=>item.uuid==currentNode.uuid),1)
// 				targetNode.children.push(currentNode)
// 			}else {
// 				c(uuid + 'move to '+ target +'failed')
// 				c(res.body)
// 				reject(index)
// 			}
// 		}
// 		request.patch(server+'/files/'+uuid,options,callback)
// 	})
// 	return promise
// }

// ipcMain.on('getFilesSharedToMe',()=>{
// 	fileApi.getFilesSharedWithMe().then(files=>{
// 		c('分享给我的文件 获取成功')
// 		c(files.length + '个文件')
// 		shareRoot = files
// 		shareChildren = files
// 		sharePath.length = 0
// 		sharePath.push({key:'',value:{}})
// 		dispatch(action.setShareChildren(shareChildren,sharePath))
// 	}).catch(err=>{
// 		c('分享给我的文件 获取失败')
// 		c(err)
// 	})
// })

// ipcMain.on('getFilesSharedToOthers',()=>{
// 	fileApi.getFilesSharedWithOthers().then(files=>{
// 		c('我分享的文件 获取成功')
// 		c(files.length + '个文件')
// 		dispatch(action.setFilesSharedWithMe(files))
// 	}).catch(err=>{
// 		c('我分享的文件 获取失败')
// 	})
// })

// //share
// ipcMain.on('share',function(err,files,users){
// 	c(' ')
// 	c(files)
// 	c(users)
// 	var index = 0

// 	function doShare(err) {
// 		if (err) {
// 			mainWindow.webContents.send('message',files[index].name + '分享失败')	
// 			return
// 		}
// 		index++
// 		if (index == files.length) {
// 			console.log('all share success')
// 			mainWindow.webContents.send('message',files.length + ' 个文件分享成功')
// 			return
// 		}else {
// 			fileApi.share(files[index],users,doShare)
// 		}
// 	}

// 	fileApi.share(files[index],users,doShare)
// })

// const shareFilesHandler = ({files, users}, callback) => 
//   Promise.map(files, file => {
//     let opt = {
//       // 
//     }
//     return Promise.promisify(request)(opts).reflect()
//   }).asCallback((err, arr) => callback(err))

// //enterShare
// ipcMain.on('enterShare',(err,item)=>{
// 	c(' ')
// 	fileApi.getFile(item.uuid).then(data => {
// 		getSharePath(item)
// 		c('获取shareChildren成功')
// 		dispatch(action.setShareChildren(data,sharePath))
// 	}).catch(err => {
// 		c('获取shareChildren失败')
// 	})
// })

// function getSharePath(obj) {
// 	var index = sharePath.findIndex(item => {
// 		return item.value.uuid == obj.uuid
// 	})
// 	if (index != -1) {
// 		sharePath.splice(index,sharePath.length - 1 -index)
// 	}else {
// 		sharePath.push({key:obj.name,value:obj})
// 	}
// }

// ipcMain.on('backShareRoot',err=>{
// 	mainWindow.webContents.send('setShareChildren',shareChildren,sharePath)
// })

// //cancel share
// ipcMain.on('cancelShare',(err,item)=>{
// 	fileApi.share(item.uuid, [], (err,data) => {
// 		ipcMain.emit('getFilesSharedToOthers')
// 	})
// })

// function getFolderTree(folderObj,call) {

// 	let tree = {
//     uuid: folderObj.uuid,
//     name: folderObj.name,
//     path: path.join(downloadPath,folderObj.name),
//     children:[]
//   }

// 	function traverse(folder,callback) {
// 		fileApi.getFile(folder.uuid).then(result => {
// 			let files = result
// 			c()
// 			c(folder.name + ' has ' + files.length + ' children')
// 			files.forEach(item => {
// 				folder.children.push(
// 						Object.assign({},item, {children : [],path : path.join(folder.path,item.name),times:0})
// 					)
// 				c(path.join(folder.path,item.name))
// 			})
		
// 			if (files.length == 0) {c('this is empty folder');callback();return}
// 			let count = files.length
// 			let index = 0

// 			let childrenCallback = function (err) {
// 				if (err) {
// 					callback(err)
// 				}
// 				index++
// 				c(index + ' / ' + count)
// 				if (index == count) {
// 					c(folder.name + ' is end ')
// 					c('should return prev function')
// 					callback()
// 					return
// 				}else{
// 					readEntry()	
// 				}
				
// 			}
// 			let readEntry = function () {
// 				if (folder.children[index].type == 'file') {
// 					c(folder.children[index].name + ' is file')
// 					childrenCallback()
// 				}else {
// 					c(folder.children[index].name + ' is folder')
// 					traverse(folder.children[index],childrenCallback)
// 				}
// 			}
// 			readEntry()
// 		}).catch(e=>{
// 			c(e)
// 		})
// 	}

// 	traverse(tree, (err) => {
// 		if (err) {
// 			call(err)
// 		}else {
// 			call(null,tree)
// 		}
// 	})
// }

// //create folder
// ipcMain.on('upLoadFolder',(e,name,dir)=>{
// 	upload.createFolder(name,dir)
// })

// //upload file
// ipcMain.on('uploadFile',(e,files)=>{
// 	// uploadQueue.push(files)
// 	// upload.dealUploadQueue()
// 	let target = currentDirectory.uuid
// 	dialog.showOpenDialog({properties: [ 'openFile','multiSelections','createDirectory']},function(data){
// 		if (!data) {
// 			return
// 		}
// 		let index = 0
// 		let count = data.length
// 		let fileArr = []
// 		let readFileInfor = (abspath) => {
// 			fs.lstat(abspath,(err, infor) => {
// 				if (err) {
					
// 				}else {
// 					fileArr.push(Object.assign({},infor,{abspath:abspath}))	
// 				}
// 				index++
// 				if(index < count) {
// 					readFileInfor(data[index])
// 				}else {
// 					upload.createUserTask('file',fileArr,target)
// 				}
// 			})
// 		}
// 		readFileInfor(data[index])
// 	})
// })

// //upload folder
// ipcMain.on('openInputOfFolder', e => {
// 	let target = currentDirectory.uuid
// 	dialog.showOpenDialog({properties: [ 'openDirectory','multiSelections','createDirectory']},function(data){
// 		if (!data) {
// 			return
// 		}
// 		let index = 0
// 		let count = data.length
// 		let folderArr = []
// 		let readFolderInfor = (abspath) => {
// 			fs.stat(abspath,(err, infor) => {
// 				if (err) {
					
// 				}else {
// 					folderArr.push(Object.assign({},infor,{abspath:abspath}))	
// 				}
// 				index++
// 				if(index < count) {
// 					readFolderInfor(data[index])
// 				}else {
// 					c(folderArr)
// 					upload.createUserTask('folder',folderArr,target)
// 				}
// 			})
// 		}
// 		readFolderInfor(data[index])
// 	})
// 	return
// 	// initialize object
// 	var uploadObj = {
// 		status: '准备',
// 		data: {
// 			times: 0,
// 			children: [],
// 			path: null,
// 			status: '准备',
// 			parent: currentDirectory.uuid,
// 			type: 'folder',
// 			name: null
// 		},
// 		success: 0,
// 		count: 1,
// 		failed:0,
// 		key: '',
// 		type: 'folder',
// 		name: ''
// 	}

// 	dialog.showOpenDialog({properties: [ 'openDirectory']},function(folder){

// 		if (folder == undefined)　{
// 			return
// 		}
// 		// initialize object attribute
// 		let folderPath = path.normalize(folder[0])
// 		let t = (new Date()).getTime()
		
// 		uploadObj.name = path.basename(folderPath)
// 		uploadObj.key = folder+t
// 		uploadObj.data.path = folderPath 
// 		uploadObj.data.name = path.basename(folderPath)
// 		c('')
// 		c('upload folder path is : ' + folderPath)

// 		//send transmission task 
// 		mainWindow.webContents.send('transmissionUpload',uploadObj)

// 		let showCountOfUpload = setInterval(()=>{
// 			c('the number of folder ' + path.basename(folderPath) + ' is ' + uploadObj.count)
// 		},3000)
// 		// get upload folder tree and upload it 
// 		traverse(folderPath, uploadObj.data.children, function(err,o){

// 			clearInterval(showCountOfUpload)

// 			c('folder : ' + folderPath + ' loop finish ')

// 			c((new Date))
			
// 			let st = setInterval(()=>{
// 				mainWindow.webContents.send('refreshUploadStatusOfFolder',uploadObj.key,uploadObj.success+' / '+uploadObj.count)
// 				c('folder upload precess : ' + uploadObj.success + '/' + uploadObj.count + ' failed : ' + uploadObj.failed)
// 			},1000)
 		
// 			let f = function() {
// 				if (uploadObj.data.times>5) {
// 						c('root folder upload failed !')
// 						o.status = 'failed'
// 						clearInterval(st)
// 						mainWindow.webContents.send('refreshUploadStatusOfFolder',uploadObj.key,'上传失败')
// 					}else {
// 						uploadNode(uploadObj.data,s,f)
// 					}
// 			}
// 			let s = function() {
// 				c('folder upload success !')
// 				clearInterval(st)
// 				mainWindow.webContents.send('refreshUploadStatusOfFolder',uploadObj.key,'已完成')
// 				if (uploadObj.data.parent == currentDirectory.uuid) {
// 					enterChildren({uuid : uploadObj.data.parent})
// 				}
// 			}
// 			uploadNode(uploadObj.data, s, f)
// 		})
// 	})
// 	function traverse(filePath, position, callback ) {

// 		fs.readdir(filePath, (err, entries) => {
// 			if (err) {
// 				callback(err)
// 			}
// 			if (entries.length == 0) {
// 				return callback(null)
// 			}

// 			let count = entries.length
// 			let index = 0

// 			let childrenCallback = err => {
// 				if (err) {
// 					return callback(err)
// 				}
// 				index++
// 				if (index == count) {
// 					callback(null)
// 				}else {
// 					readEntry()
// 				}
// 			}

// 			let readEntry = ()=>{
// 				fs.stat(path.join(filePath,entries[index]),(err,stat)=>{

// 					if (err || (!stat.isDirectory() && !stat.isFile())) {
// 						return callback(err||'error')
// 					}

// 					uploadObj.count++
// 					position.push({times: 0,children: [],path: path.join(filePath,entries[index]),status: '准备',parent: null,type: stat.isFile()?'file':'folder',name: entries[index]})
// 					if (stat.isFile()) {
// 						childrenCallback(null)
// 					}else {
// 						traverse(path.join(filePath,entries[index]),position[index].children,childrenCallback)
// 					}
// 				})
// 			}
// 			readEntry()
// 		})
// 	}

// 	function uploadNode(node,callback,failedCallback) {
// 			c(' ')
// 			console.log('current file/folder is : ' + node.name)
// 			if (node.type == 'file') {
// 				c('is file')
// 				uploadFileInFolder(node).then(()=>{
// 					c('create file success : '+ node.name)
// 					uploadObj.success++
// 					return callback()

// 				}).catch((err)=>{
// 					c(err)
// 					c('create file failed! : '+ node.name)
// 					node.times++
// 					failedCallback(err)
// 				})
// 			}else {
// 				let length = node.children.length
// 				let index = 0
// 				c('is folder and has ' + length + ' children')
// 				createFolder({uuid:node.parent},node.name).then(uuid=>{
// 					node.uuid = uuid
// 					c('create folder success : '+ node.name)
// 					uploadObj.success++
// 					if (length == 0) {
// 						callback()
// 					}else {
// 						node.children.forEach((item,index)=>{
// 							node.children[index].parent = uuid
// 						})
// 						let s = function(){
// 							node.children[index].status = 'success'
// 							index++
// 							if (index >= length) {
// 								c('not have next')
// 								callback()
// 							}else {
// 								c('have next')
// 								uploadNode(node.children[index],s,f)
// 							}
// 						}

// 						let f = function() {
// 							if (node.children[index].times>5) {
// 								node.children[index].status = 'failed'
// 								c(node.children[index].name + 'is absolute failed')
// 								uploadObj.failed++
// 								index++
// 								if (index >= length) {
// 									callback()
// 								}else {
// 									uploadNode(node.children[index],s,f)
// 								}
// 							}else {
// 								uploadNode(node.children[index],s,f)
// 							}
// 						}
// 						uploadNode(node.children[index],s,f)
// 					}
// 				}).catch((err)=>{
// 					c(err)
// 					c('create folder failed: '+ node.name)
// 					node.times++
// 					failedCallback(err)
// 				})
// 			}
// 	}
// })

// function createFolder(dir,name) {

// 	let promise = new Promise((resolve,reject)=>{
// 		// c('folder name is ' + name + ' parent uuid is : ' + dir.uuid )
// 		var _this = this
// 		var options = {
// 			url:server+'/files/'+dir.uuid,
// 			method:'post',
// 			headers: {
// 				Authorization: user.type+' '+user.token,
// 				'Content-Type': 'application/json'
// 			},
// 			body: JSON.stringify({
// 				name:name
// 			})
// 		}
// 		request(options,function (err,res,body) {
// 			if (!err && res.statusCode == 200) {
// 				resolve(JSON.parse(body).uuid)
// 			}else {
// 				reject(err)
// 			}
// 		})
// 	})
// 	return promise
// }

// function uploadFileInFolder(node) {
// 	var promise = new Promise((resolve,reject)=>{
// 		let hash = crypto.createHash('sha256')
// 		hash.setEncoding('hex')
// 		let fileStream = fs.createReadStream(node.path)
// 		fileStream.on('end',() => {
// 			hash.end()
// 			let sha = hash.read()

// 			var tempStream = fs.createReadStream(node.path)

// 			var options = {
// 				url:server+'/files/'+node.parent,
// 				method:'post',
// 				headers: {
// 					Authorization: user.type+' '+user.token
// 				},
// 				formData : {
// 					'sha256' : sha,
// 					'file' : tempStream
// 				}

// 			}
// 			request(options,function (err,res,body) {
// 				if (!err && res.statusCode == 200) {
// 						resolve(JSON.parse(body).uuid)
// 				}else {
// 					reject(err)
// 				}
// 			})
			
// 		})

// 		fileStream.pipe(hash)
// 		c('file is hashing')
// 	})
// 	return promise
// }

// //download file
// ipcMain.on('downloadFile',(e,files)=>{
// 	// downloadQueue.push(files)
// 	// download.dealDownloadQueue()
// 	c(files)
// 	download.createUserTask('file',files)
// })

// //download folder
// ipcMain.on('downloadFolder',(err,folder)=>{
// 	download.createUserTask('folder',folder)
// 	// c('')
// 	// c('开始下载文件夹...')
// 	// folder.forEach(item=>{
// 	// 	getFolderTree(item,(err, tree) => {
// 	// 		if (err) {
// 	// 			c('get tree failed')
// 	// 			return
// 	// 		}
// 	// 		c('文件树组成')
// 	// 		let count = download.getTreeCount(tree)	
// 	// 		let time = (new Date()).getTime()
// 	// 		let obj = {count:count,failed:[],success:0,data:tree,type:'folder',status:'ready',key:item.uuid+time}
// 	// 		downloadFolderQueue.push(obj)
// 	// 		mainWindow.webContents.send('transmissionDownload',obj)	
// 	// 		if (downloadFolderNow.length == 0) {
// 	// 			downloadFolderNow.push(downloadFolderQueue[0])
// 	// 			download.downloadFolder(downloadFolderNow[0])
// 	// 		}
// 	// 	})
		
// 	// })
	
// })


//upload 
// global.uploadNow = []
// global.uploadHandleArr = []
// global.uploadQueue = []

// //download
// global.downloadQueue = []
// global.downloadNow = []
// global.downloadFolderQueue = []
// global.downloadFolderNow = []

module.exports = utils