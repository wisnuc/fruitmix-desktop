'use strict';
//corn module

const electron = require('electron');
const {app, BrowserWindow, ipcMain, dialog } = require('electron');

var request = require('request');
var http = require('http');
var fs = require ('fs');
var stream = require('stream');
var path = require('path');
var _ = require('lodash');
var mdns = require('mdns-js');
var mainWindow = null;

var server = 'http://211.144.201.201:8888';
// server ='http://192.168.5.132:80';
// server ='http://192.168.5.134:80';
//user
var user = {};
//files
var rootNode= null;
var allFiles = [];
var filesSharedByMe = [];
var tree = {};
var map = new Map();
//share
var shareFiles = [];
var shareTree = [];
var shareMap = new Map();
var shareChildren = [];
//directory
var currentDirectory = {};
var children = [];
var parent = {};
var dirPath = [];
var tree = {};
//upload 
var uploadQueue = [];
var uploadNow = [];
var uploadMap = new Map();
//media
var media = [];
var mediaMap = new Map();
var thumbQueue = [];
var thumbIng = [];
//device
var device = [];

var c = console.log;
// var browser = mdns.createBrowser();


// try{
// 	browser.on('ready', function () {
// 		c('ready');
// 	    browser.discover(); 
// 	});
// 	browser.on('update', function (data) {
// 		console.log('----------------------------------------');
// 		device.push(data);
// 	    console.log(data);
// 	});

// 	browser.on('error',err=>{
// 		c('mdns err');
// 		c(err);
// 	});
// }catch(e){
// 	console.log(e);
// }

//app ready and open window
app.on('ready', function() {
	mainWindow = new BrowserWindow({
		frame: true,
		height: 768,
		resizable: true,
		width: 1366,
		minWidth:1024,
		minHeight:768
	});
	mainWindow.webContents.openDevTools();
	// dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']})
	mainWindow.loadURL('file://' + __dirname + '/ele/index.html');
});		
app.on('window-all-closed', () => {
  app.quit();
});
//get all user information
ipcMain.on('login',function(event,username,password){
	login().then((data)=>{
		user = data.find((item)=>{return item.username == username});
		if (user == undefined) {
			throw new error
		}
		return getToken(user.uuid,password);
	}).then((token)=>{
		user.token = token.token;
		user.type = token.type;
		return getAllUser();
	}).then((users)=>{
		user.allUser = users;
		mainWindow.webContents.send('loggedin',user);
	}).catch((err)=>{
		console.log(err);
		mainWindow.webContents.send('message','登录失败',0);
	});
});
function login() {
	let login = new Promise((resolve,reject)=>{
		request(server+'/login',function(err,res,body){
			if (!err && res.statusCode == 200) {
				resolve(eval(body));
			}else {
				reject(err)
			}
		})
	});
	return login;
}
function getToken(uuid,password) {
	let a = new Promise((resolve,reject)=>{
		request.get(server+'/token',{
			'auth': {
			    'user': uuid,
			    'pass': password,
			    'sendImmediately': false
			  }
		},function(err,res,body) {
			if (!err && res.statusCode == 200) {
				resolve(JSON.parse(body));
			}else {
				reject(err)
			}
		});
	});
	return a;
}
function getAllUser() {
	var promise = new Promise((resolve,reject)=>{
		var options = {
			method: 'GET',
			url: server+'/users',
			headers: {
				Authorization: user.type+' '+user.token
			}
		};
		function callback (err,res,body) {
			if (!err && res.statusCode == 200) {
				resolve(JSON.parse(body));
			}else {
				reject(err)
			}
		}
		request(options,callback);
	});
	return promise
}
//get all files
ipcMain.on('getRootData', ()=> {
	getFiles().then((data)=>{
		// //remove folder
		removeFolder(data);
		dealWithData(data);
		let copyFilesSharedByMe = filesSharedByMe.map(item=>Object.assign({},item,{children:null,writelist:[].concat(item.writelist)}));
		mainWindow.webContents.send('receive', currentDirectory,children,parent,dirPath,shareChildren,copyFilesSharedByMe);
	}).catch((err)=>{
		console.log(err);
		mainWindow.webContents.send('message','get data error',1);	
	});
});
ipcMain.on('refresh',()=>{
	getFiles().then((data)=>{
		c('1');
		removeFolder(data);
		c('2');
		dealWithData(data);
		c('3');
		mainWindow.webContents.send('refresh',children);
	}).catch((err)=>{
		mainWindow.webContents.send('message','get data error',1);	
	});
});
//getFils api
function getFiles() {
	var files = new Promise((resolve,reject)=>{ 
			var options = {
				method: 'GET',
				url: server+'/files',
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
	return files;
}
//remove folder fruitmix ...
function removeFolder(data) {
	let uuid = null;
	let index = data.findIndex((item,index)=>{
		return item.parent == ''
	});
	if (index == undefined) {
		return 
	}
	uuid = data[index].uuid;
	data.splice(index,1);
	index = data.findIndex((item)=>{
		return item.parent == uuid
	})
	uuid= data[index].uuid
	data.splice(index,1);
	index = data.findIndex((item)=>{
		return item.parent == uuid
	})
	data[index].parent = '';
	data[index].attribute.name = 'my cloud';
	rootNode = data[index]; 
}
//get shareFiles,tree,rootNode
function dealWithData(data) {
	//set allfiles
	allFiles = data.map((item)=>{item.share = false;item.checked = false;return item});
	//separate shared files from allfiles
	classifyShareFiles();
	//set tree
	tree = getTree(allFiles,'file');
	shareTree = getTree(shareFiles,'share');
	//set children
	shareTree.forEach((item)=>{if (item.hasParent == false) {shareChildren.push(item)}});
	//set filesSharedByMe
	getFilesSharedByMe();
	//show root file
	enterChildren(rootNode);
}
function classifyShareFiles() {
	let userUUID = user.uuid;
	allFiles.forEach((item,index)=>{
		try{
		// owner is user ?
		if (item.permission.owner[0] != userUUID ) {
			// console.log('is not user');
			let result = item.permission.readlist.find((readUser)=>{
				return readUser == userUUID
			});
			if (result != undefined) {
				//file is shared to user
				shareFiles.push(item);
				allFiles[index].share = true;
			}else {
				//is file included in shareFolder?
				var findParent = function(i) {
					if (i.parent == '') {
						//file belong to user but is not upload by client
						return
					}
					let re = allFiles.find((p)=>{
						return i.parent == p.uuid
					});
					if (re.parent == '') {
						return;
					}
					let rer = re.permission.readlist.find((parentReadItem,index)=>{
						return parentReadItem == userUUID
					})
					if (rer == undefined) {
						//find parent again
						findParent(re);
					}else {
						shareFiles.push(item);
						allFiles[index].share = true;
					}
				};
				findParent((item));
			}
		}
	}catch(e){
		console.log(e);
	}
	})
}
function getTree(f,type) {
	let files = [];
	f.forEach((item)=>{
		if ((type == 'file' && !item.share)||(type == 'share' && item.share)) {
			let hasParent = true;
			if (type == 'share') {
				let r = f.find((i)=>{return i.uuid == item.parent});
				if (r == undefined ) { hasParent = false}
			}
			files.push({
				uuid:item.uuid,
				name:item.attribute.name,
				parent: item.parent,
				children: item.children,
				share:item.share,
				type:item.type,
				checked:false,
				owner:item.permission.owner,
				readlist:item.permission.readlist,
				writelist:item.permission.writelist,
				attribute:{
					changetime:item.attribute.changetime,
					modifytime:item.attribute.modifytime,
					createtime:item.attribute.modifytime,
					size:item.attribute.size,
					name:item.attribute.name
				},
				hasParent:hasParent
			});
		}
	});
	let tree = files.map((node,index)=>{
		// node.parent = files.find((item1)=>{return (item1.uuid == node.parent)});
		node.children = files.filter((item2)=>{return (item2.parent == node.uuid)});
		return node
	});
	if (type == 'share') {
		tree.forEach((item)=>{
			shareMap.set(item.uuid,item);
		});
	}else {
		tree.forEach((item)=>{
			map.set(item.uuid,item);	
		
		});
	}
	return tree;	
}
function getFilesSharedByMe() {
	tree.forEach(item=>{
		if (item.owner == user.uuid && item.readlist.length != 0 && item.writelist.length != 0 && item.readlist[0] != "" && item.writelist[0] != "") {
			filesSharedByMe.push(item);
		}
	});
}
//select children
ipcMain.on('enterChildren', (event,selectItem) => {
	enterChildren(selectItem);
});
function enterChildren(selectItem) {
	//parent
	if (selectItem.parent == '') {
		parent = {}
	}else {
		parent = Object.assign({},map.get(selectItem.parent),{children:null});	
	}
	//currentDirectory
	currentDirectory = selectItem;
	//children
	children = map.get(selectItem.uuid).children.map(item=>Object.assign({},item,{children:null}));
	//path
	try {
		dirPath.length = 0;
		getPath(selectItem);
		dirPath = _.cloneDeep(dirPath);
	}catch(e) {
		console.log(e);        
		path.length=0;
	}finally {
		mainWindow.webContents.send('receive',currentDirectory,children,parent,dirPath,shareChildren);
	}
}
//get path
function getPath(obj) {
	//insert obj to path
	let item = map.get(obj.uuid);
	dirPath.unshift({key:item.name,value:Object.assign({},item,{children:null})});
	//obj is root?
	if (obj.parent == undefined || obj.parent == '') {
		dirPath.unshift({key:'',value:{}});
		return; 
	}else {
		getPath(map.get(obj.parent));
	}
}
ipcMain.on('getFile',(e,uuid)=>{
	getFile(uuid).then((data)=>{
		mainWindow.webContents.send('receiveFile',data);
	})
});
function getFile(uuid) {
	var file = new Promise((resolve,reject)=>{
		request
			.get(server+'/files/'+uuid)
			.set('Authorization',user.type+' '+user.token)
			.end((err,res)=>{
				if (res.ok) {
					resolve(eval(res.body));
				}else {
					reject(err);
				}
			});
	});
	return file;
}
//upload file
ipcMain.on('uploadFile',(e,files)=>{
	// uploadQueueWait = uploadQueueWait.concat(files);
	// dealUploadQueue();
	//-------------------------------------------------------------------------------------------------------------
	uploadQueue.push(files);
	dealUploadQueue();
});
function dealUploadQueue() {
	if (uploadQueue.length == 0) {
		return
	}else {
		if (uploadQueue[0].index == uploadQueue[0].length && uploadNow.length == 0) {
			mainWindow.webContents.send('message',uploadQueue[0].success+' 个文件上传成功 '+uploadQueue[0].failed+' 个文件上传失败');
			modifyData(uploadQueue.shift());
			console.log('a upload task over');
			console.log(uploadQueue);
			dealUploadQueue();
		}else {
			if (uploadNow.length < 3) {
				let gap = 3 - uploadNow.length;
				for (let i = 0; i < gap; i++) {
					let index = uploadQueue[0].index;
					if (index > uploadQueue[0].length-1) {
						return
					}
					uploadNow.push(uploadQueue[0].data[index]);
					uploadFile(uploadQueue[0].data[index]);
					uploadQueue[0].index++;
				}
			}
			console.log(uploadQueue);
		}
	}
}
function uploadFile(file) {
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
	//callback
	function callback (err,res,body) {
		clearInterval(countStatus);
		if (!err && res.statusCode == 200) {
			uploadQueue[0].success += 1;
			mainWindow.webContents.send('refreshStatusOfUpload',file.path+file.uploadTime,1);
			var uuid = body;
			console.log('upload success');
			console.log(uuid);
			let fileObj = uploadQueue[0].data.find(item2=>file.path == item2.path);
			let index = uploadNow.findIndex(item=>item.path == file.path);
			uploadNow.splice(index,1);

			if (fileObj != undefined) {
				fileObj.uuid = uuid;
			}
			if (uploadNow.length == 0) {
				dealUploadQueue();
			}
		}else {
			uploadQueue[0].failed += 1;
			mainWindow.webContents.send('refreshStatusOfUpload',file.path+file.uploadTime,1.01);
			let index = uploadNow.findIndex(item3=>item3.path == file.path);
			uploadNow.splice(index,1);
			if (uploadNow.length == 0) {
				dealUploadQueue();
			}
			console.log('upload failed!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
			mainWindow.webContents.send('message','upload failed');
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
}
function modifyData(files,uuid) {
	let dir = map.get(files.parent);
	for (let item of files.data) {
		let o = {
			uuid:item.uuid,
			parent: item.parent,
			checked: false,
			share:false,
			attribute: {
				name:item.name,
				size:item.size	,
				changetime: "",
				createtime: "",
			},
			type: 'file',
			children : [],
			name:item.name,
		};
		map.set(item.uuid,Object.assign({},item,o));
		dir.children.push(o);
	}
	if (files.parent == currentDirectory.uuid) {
		children = dir.children.map(i => Object.assign({},i,{children:null}));
		mainWindow.webContents.send('uploadSuccess',{},children);
	}
}
//create folder
ipcMain.on('upLoadFolder',(e,name,dir)=>{
	var r = request.post(server+'/files/'+dir.uuid+'?type=folder',{
		headers: {
			Authorization: user.type+' '+user.token
		},
	},function (err,res,body) {
		if (!err && res.statusCode == 200) {
			console.log('res');
			var uuid = body;
			uuid = uuid.slice(1,uuid.length-1);
			modifyFolder(name,dir,uuid,true);
		}else {
			mainWindow.webContents.send('message','新建文件夹失败');
			console.log('err');
			console.log(res);
			console.log(err);
		}
	});
	var form = r.form();
	form.append('foldername',name);
});
function modifyFolder(name,dir,folderuuid,send) {
	//insert uuid

	// let item = allFiles.find((item)=>{return item.uuid == dir.uuid});
	// item != undefined && item.children.push(folderuuid);

	var folder = {
		uuid:folderuuid,
		parent: dir.uuid,
		checked: false,
		share:false,
		attribute: {
			name:name,
			size: 4096,
			changetime: "",
			createtime: "",
		},
		type: 'folder',
		children:[],
		name:name,
	};
	//insert folder obj into map
	map.set(folderuuid,folder);
	let a = map.get(dir.uuid);
	a.children.push(folder)
	if (dir.uuid == currentDirectory.uuid) {
		//get children
		children = a.children.map(item => Object.assign({},item,{children:null}))
		//ipc
		if (send) {
			mainWindow.webContents.send('message','新建文件夹成功');
		}
		mainWindow.webContents.send('uploadSuccess',folder,_.cloneDeep(children));
	}
}
//upload folder
ipcMain.on('openInputOfFolder', e=>{
	dialog.showOpenDialog({properties: [ 'openDirectory']},function(folder){
		console.log(folder[0]);
		let folderPath = path.normalize(folder[0]);
		c(folderPath);
		genTask(folderPath,function(err,o){
			let f = function() {
				if (o.times>5) {
						o.status = 'failed';
					}else {
						uploadNode(o,function(){c('success end');},f);
					}
			}
			uploadNode(o,function(){c('success end');},f);
		});
	})
});
function genTask(rootpath, callback) {
  	let obj = {times:0,children:[],path:rootpath,status:'ready',parent:currentDirectory.uuid,type:'folder',name:rootpath.split('\\')[rootpath.split('\\').length-1]};
  	var func = (dir, stat, cur) => {
  		cur.push({
  			path: dir,
  			type: stat?'folder':'file',
  			times: 0,
  			status: 'ready',
  			uuid:null,
  			children:[],
  			parent:null,
  			name: dir.split('\\')[dir.split('\\').length-1]
  		});
  	}
  	traverse(rootpath, func, () => callback(null, obj), obj.children)
}
function traverse(dir, visitor, callback, current) {
	//read directory
  	fs.readdir(dir, (err, entries) => {
  		//directory err
  		if (err) return callback(err);
		if (entries.length === 0) return callback(err);
		//directory right
		var count = entries.length;
		//map children
		entries.forEach(entry => {
	  		let entryPath = path.join(dir, entry);
	  		fs.stat(entryPath, (err, stat) => {
	  			//is entry directory
			  	if (err || (!stat.isDirectory() && !stat.isFile())) {
			  	  	count--
			  	  	if (count === 0) callback()
			  	  	return
			  	}
			  	//insert file to tree
				visitor(entryPath, stat.isDirectory(), current);
        		if (stat.isDirectory()) {
        			//recursion
        			let index = current.length;
          			traverse(entryPath,visitor, () => {
          			count--
          			if (count === 0) callback()
          				return
          			},current[index-1].children);
          			
        		}
        		else {
          			count--
		          	if (count === 0) callback()
		          	return
	        	}
	  		})
		})
  	})
}
function uploadNode(node,callback,failedCallback) {
	console.log(node.name);
	if (node.type == 'file') {
		uploadFileInFolder(node).then(()=>{
			c('create file success: '+ node.name);
			callback();
		}).catch((err)=>{
			node.times++;
			failedCallback();
		});
	}else {
		let length = node.children.length;
		let index = 0;
		console.log(index+"-"+length);
		createFolder({uuid:node.parent},node.name).then(uuid=>{
			c('create folder success: '+ node.name);
			if (length == 0) {
				callback();
			}else {
				node.children.forEach((item,index)=>{
					node.children[index].parent = uuid;
				});
				let c = function(){
					index++;
					console.log(index+"-"+length);
					if (index >= length) {
						callback();
					}else {
						uploadNode(node.children[index],c)
					}
				};

				let f = function() {
					if (node.children[index].times>5) {
						node.children[index].status = 'failed';
					}else {
						uploadNode(node.children[index],c,f);
					}
				}
				uploadNode(node.children[index],c,f);
			}
		}).catch(()=>{
			c('create folder failed: '+ node.name);
			node.times++;
			failedCallback();
		});
	}
}
function createFolder(dir,name) {
	let promise = new Promise((resolve,reject)=>{
		var r = request.post(server+'/files/'+dir.uuid+'?type=folder',{
			headers: {
				Authorization: user.type+' '+user.token
			},
		},function (err,res,body) {
			if (!err && res.statusCode == 200) {
				var uuid = body;
				uuid = uuid.slice(1,uuid.length-1);
				modifyFolder(name,dir,uuid,false);
				resolve(uuid);
			}else {
				reject();
			}
		});
		var form = r.form();
		form.append('foldername',name);
	});
	return promise
}
function uploadFileInFolder(node) {
	console.log(node.name);
	var promise = new Promise((resolve,reject)=>{
		let callback = function(err,res,body) {
			if (!err && res.statusCode == 200) {
				let dir = map.get(node.parent);
				let o = {
					uuid:body,
					parent: node.parent,
					checked: false,
					share:false,
					attribute: {
						name:node.name,
						size:null	,
						changetime: "",
						createtime: "",
					},
					type: 'file',
					children : [],
					name:node.name,
				};
				dir.children.push(o);
				map.set(body,o);
				resolve(body);
			}else {
				console.log(res);
				reject();
			}
		}
		//request
		let r = request.post(server+'/files/'+node.parent+'?type=file',{
			headers: {
				Authorization: user.type+' '+user.token
			},
		},callback);

		//add file
		let form = r.form();
		let tempStream = fs.createReadStream(node.path);
		tempStream.path = node.path
		form.append('file', tempStream);
	});
	return promise;
}
//download
ipcMain.on('download',(e,file)=>{
	download(file).then(data=>{
		console.log(file.attribute.name + ' download success');
	});
})
function download(item) {
	var download = new Promise((resolve,reject)=>{
		var body = 0;
		var options = {
			method: 'GET',
			url: server+'/files/'+item.uuid+'?type=media',
			headers: {
				Authorization: user.type+' '+user.token
			}
		};

		function callback (err,res,body) {
			if (!err && res.statusCode == 200) {
				console.log('res');
				resolve(body);
				}else {
					mainWindow.webContents.send('message','文件 '+item.name+' 下载失败');
					// reject(err)
					console.log('err');
					console.log(err);
				}
			}
			var stream = fs.createWriteStream('download/'+item.attribute.name);

			var interval = setInterval(function() {
				var upLoadProcess = body/item.attribute.size;
				mainWindow.webContents.send('refreshStatusOfDownload',item,upLoadProcess);
				if (upLoadProcess >= 1) {
					resolve();
					clearInterval(interval);
				}
			},500);

			request(options,callback).on('data',function(d){
				body += d.length;
			}).pipe(stream);
			
			var transform = new stream.Transform({
				transform: function(chunk, encoding, next) {
					body+=chunk.length;
					this.push(chunk)
					next();
				}
			});	
		})
	return download;
}
//delete
ipcMain.on('delete',(e,objArr,dir)=>{
	for (let item of objArr) {
		deleteFile(item).then(()=>{
			//delete file in children
			let index2 = children.findIndex((value)=>value.uuid == item.uuid);
			if (index2 != -1) {
				children.splice(index2,1)
			}

			let index = map.get(dir.uuid).children.findIndex( (value) => value.uuid == item.uuid);
			if (index != -1) {
				 map.get(dir.uuid).children.splice(index,1)
			}
			mainWindow.webContents.send('message','文件删除成功');	
			if (currentDirectory.uuid == dir.uuid) {
				mainWindow.webContents.send('deleteSuccess',item,children,dir);	
			}
		}).catch((err)=>{
			mainWindow.webContents.send('message','文件删除失败');	
		});
	}
});
function deleteFile(obj) {
	var deleteF = new Promise((resolve,reject)=>{
			var options = {
				method: 'delete',
				url: server+'/files/'+obj.uuid,
				headers: {
					Authorization: user.type+' '+user.token
				}

			};

			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					console.log('res');
					console.log(body)
					resolve(JSON.parse(body));
				}else {
					console.log('err');
					console.log(res);
					console.log(err);
					reject(err)
				}
			}

			request(options,callback);

	});
	return deleteF;
}
//rename
ipcMain.on('rename',(e,uuid,name,oldName)=>{
	rename(uuid,name,oldName).then(()=>{
		map.get(uuid).name = name;
		map.get(uuid).attribute.name = name;
	}).catch((err)=>{
		mainWindow.webContents.send('message','文件重命名失败');	
	});
})
function rename(uuid,name,oldName) {
	let rename = new Promise((resolve,reject)=>{
		var options = {
			method: 'patch',
			url: server+'/files/'+uuid,
			headers: {
					Authorization: user.type+' '+user.token
				},
			form: {filename:name}
		};

		function callback (err,res,body) {
			console.log(res);
				if (!err && res.statusCode == 200) {
					console.log('res');
					resolve(body);
				}else {
					console.log('err');
					console.log(err);
					reject(err)
				}
			}

		request(options,callback);
	});
	return rename;
}
//close
ipcMain.on('close-main-window', function () {
    app.quit();
});
//create user
ipcMain.on('create-new-user',function(err,u,p,e){
	createNewUser(u,p,e).then(()=>{
		console.log('register success');
	}).catch(()=>{
		console.log('failed');
	});
});
function createNewUser(username,password,email) {
	let promise = new Promise((resolve,reject)=>{
		var options = {
			headers: {
				Authorization: user.type+' '+user.token
			},
			form: {username:username,password:password,email:email,isAdmin:false,isFirstUser:false}
		};
		function callback (err,res,body) {
			console.log(res);
			if (!err && res.statusCode == 200) {
				console.log('res');
				resolve(body);
			}else {
				console.log('err');
				console.log(err);
				reject(err)
			}
		};
		request.post(server+'/users/',options,callback);
	});
	return promise;
}
//share
ipcMain.on('share',function(err,files,users){
	files.forEach((item)=>{
		share(item,users).then(()=>{
			//changeShareData
			let file = map.get(item.uuid);
			file.readlist = users;
			file.writelist = users;
			//is exist in filesSharedByMe?
			let index = filesSharedByMe.findIndex(f=>f.uuid == item.uuid);
			if (index == -1) {
				filesSharedByMe.push(map.get(item.uuid));

			}
		});
	});
	mainWindow.webContents.send('message',files.length + '个文件分享成功');
});
function share(file,users) {
	var s = new Promise((resolve,reject)=>{
		var y = [];
		var options = {
			headers: {
				Authorization: user.type+' '+user.token
			},
			form: {readlist:JSON.stringify(users),writelist:JSON.stringify(users)}
		}
		function callback (err,res,body) {
			if (!err && res.statusCode == 200) {
				console.log('res');
				resolve();
			}else {
				console.log('err');
				console.log(err);
				reject()
			}
		};
		request.patch(server+'/files/'+file.uuid+'?type=permission',options,callback);
	});
	return s;
}
//getTreeChildren
ipcMain.on('getTreeChildren',function(err,uuid) {
	if (uuid && uuid!='') {
		let item = map.get(uuid);
		let name = item.name;
		let ch = [];
		item.children.forEach(item=>{
			if (item.type == 'folder') {
				ch.push({name:item.name,uuid:item.uuid,parent:item.parent});
			}
		});
		let treeObj = {isNull:false,children:ch,name:name,parent:item.parent,uuid:item.uuid}
		mainWindow.webContents.send('treeChildren',treeObj);
	}
	// let result = map.get(uuid);
	// result.children = result.children.map((item)=>{
	// 	return Object.assign({},item,{children:null});
	// });
});

ipcMain.on('move',function(err,arr,target) {
	let allPromise = arr.map((item,index)=>move(item.uuid,target,index));
	Promise.all(allPromise).then((result)=>{
		console.log(result);
		mainWindow.webContents.send('message',arr.length+' 个文件移动成功');
		if (currentDirectory.uuid == arr[0].parent) {
			enterChildren(currentDirectory);
		}
	}).catch(r=>{
		c(r);
		mainWindow.webContents.send('message','文件 '+arr[r].attribute.name+'移动失败');
		if (currentDirectory.uuid == arr[0].parent) {
			enterChildren(currentDirectory);
		}
	})
});
function move(uuid,target,index) {
	let promise = new Promise((resolve,reject)=>{
		var options = {
			headers: {
				Authorization: user.type+' '+user.token
			},
			form: {target:target}
		};
		function callback (err,res,body) {
			if (!err && res.statusCode == 200) {
				console.log('res');
				resolve(body);
				let currentNode = map.get(uuid);
				let parent = map.get(currentNode.parent);
				let targetNode = map.get(target);
				parent.children.splice(parent.children.findIndex(item=>item.uuid==currentNode.uuid),1);
				targetNode.children.push(currentNode);
			}else {
				console.log('err');
				console.log(err);
				reject(index);
			}
		};
		request.patch(server+'/files/'+uuid,options,callback);
	});
	return promise
}
//getMediaData
ipcMain.on('getMediaData',(err)=>{
	getMediaData().then((data)=>{
		data.forEach(item=>{
			if (item == null) {return}
			let obj = Object.assign({},item,{status:'notReady',failed:0});
			media.push(obj);	
			mediaMap.set(item.hash,item);
		});
		mainWindow.webContents.send('mediaFinish',media);
	}).catch(err=>{
		console.log(err);
	});
});
function getMediaData() {
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
}
//getMediaThumb
ipcMain.on('getThumb',(err,item)=>{
	thumbQueue.push(item);
	dealThumbQueue();
});

function dealThumbQueue() {
		if (thumbQueue.length == 0) {
			return
		}else {
			setTimeout(function(){
				if (thumbIng.length == 0) {
					c('----');
					console.log('run');
					for (var i=0;i<3;i++) {
						if (thumbQueue.length == 0) {
							break;
						}
						let item = thumbQueue.shift();
						thumbIng.push(item);
						isThumbExist(item);
					}
				}
			},500);
		}
}

function isThumbExist(item) {
	fs.readFile(__dirname+'/media/'+item.hash+'thumb',(err,data)=>{
		if (err) {
			downloadMedia(item).then((data)=>{
				sendThumb(item);
				console.log(thumbQueue.length+' length');
			}).catch(err=>{
				item.failed++;
				let index = thumbIng.findIndex(i=>i.hash == item.hash);
				let t = thumbIng[index];
				thumbIng.splice(index,1);
				if (item.failed <5) {
					thumbQueue.push(t);
				}else {
					item.status='failed'
					mainWindow.webContents.send('getThumbFailed',item);
				}
				dealThumbQueue();
				console.log(thumbQueue.length+' length');
			});
		}else {
			sendThumb(item);
		}
		console.log('finish');
	});

	function sendThumb(item){
		let index = thumbIng.findIndex(i=>i.hash == item.hash);
		thumbIng.splice(index,1);
		dealThumbQueue();
		item.path=__dirname+'/media/'+item.hash+'thumb';
		mainWindow.webContents.send('getThumbSuccess',item);
	}
}

function downloadMedia(item) {
	var download = new Promise((resolve,reject)=>{
		let scale = item.width/item.height;
		let height = 100/scale;
		var options = {
			method: 'GET',
			url: server+'/media/'+item.hash+'?type=thumb&width=100&height='+height,
			headers: {
				Authorization: user.type+' '+user.token
			}
		};

		function callback (err,res,body) {
			if (!err && res.statusCode == 200) {
				console.log('res');
				resolve(body);
			}else {
				console.log('err');
				console.log(item.hash);
				fs.unlink('media/'+item.hash+'thumb', (err,data)=>{
				});
				reject(err)
			}
		}
			var stream = fs.createWriteStream('media/'+item.hash+'thumb');

			request(options,callback).pipe(stream);
		})
	return download;
}
//getMediaImage
ipcMain.on('getMediaImage',(err,item)=>{
	downloadMediaImage(item).then(()=>{
		c('download media image success');
		item.path = __dirname+'/media/'+item.hash;
		mainWindow.webContents.send('donwloadMediaSuccess',item);
	}).catch(err=>{
		c('download media image failed');
	});
})
function downloadMediaImage(item) {
	let promise = new Promise((resolve,reject)=>{
		var options = {
			method: 'GET',
			url: server+'/media/'+item.hash+'?type=original',
			headers: {
				Authorization: user.type+' '+user.token
			}
		};
		function callback (err,res,body) {
			if (!err && res.statusCode == 200) {
				console.log('res');
				resolve();
			}else {
				console.log('err');
				fs.unlink('media/'+item.hash, (err,data)=>{
				});
				reject()
			}
		}
		var stream = fs.createWriteStream('media/'+item.hash);
		request(options,callback).pipe(stream);
	});
	return promise
}
//enterShare
ipcMain.on('enterShare',(err,item)=>{
	let share = shareMap.get(item.uuid);
	console.log(share.children);
	let children = share.children.map(item=>{
		return Object.assign({},item,{children:[]});
	});
	mainWindow.webContents.send('setShareChildren',children);
});
ipcMain.on('backShareRoot',err=>{
	shareChildren.length = 0;
	shareTree.forEach((item)=>{if (item.hasParent == false) {shareChildren.push(item);}});
	mainWindow.webContents.send('setShareChildren',shareChildren);
});
//loginOff
ipcMain.on('loginOff',err=>{
	user = {};
	//files
	rootNode= null;
	allFiles = [];
	filesSharedByMe = [];
	tree = {};
	map = new Map();
	//share
	shareFiles = [];
	shareTree = [];
	shareMap = new Map();
	shareChildren = [];
	//directory
	currentDirectory = {};
	children = [];
	parent = {};
	dirPath = [];
	tree = {};
	//upload 
	uploadQueue = [];
	uploadNow = [];
	uploadMap = new Map();
	//media
	media = [];
	mediaMap = new Map();
	thumbQueue = [];
	thumbIng = [];
});
//copy 
// ipcMain.on('copy'，);

// function setGlobalShortcuts() {
//     globalShortcut.unregisterAll();

//     var shortcutKeysSetting = configuration.readSettings('shortcutKeys');
//     var shortcutPrefix = shortcutKeysSetting.length === 0 ? '' : shortcutKeysSetting.join('+') + '+';
//     console.log(shortcutPrefix);

//     globalShortcut.register(shortcutPrefix + '1', function () {
//         mainWindow.webContents.send('global-shortcut', 0);
//     });
//     globalShortcut.register(shortcutPrefix + '2', function () {
//         mainWindow.webContents.send('global-shortcut', 1);
//     });
// }



// ipc.on('open-settings-window', function () {
//     if (settingsWindow) {
//         return;
//     }

//     settingsWindow = new BrowserWindow({
//         frame: false,
//         height: 768,
//         resizable: false,
//         width: 1366
//     });

//     settingsWindow.webContents.openDevTools();
//     settingsWindow.loadUrl('http://localhost:8000/#/settings');

//     settingsWindow.on('closed', function () {
//         settingsWindow = null;
//     });
// });

// ipc.on('close-settings-window', function () {
//     if (settingsWindow) {
//         settingsWindow.close();
//     }
// });

// ipc.on('set-global-shortcuts', function () {
//     setGlobalShortcuts();
// });



