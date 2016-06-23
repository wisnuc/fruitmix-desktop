'use strict';
//corn module

const electron = require('electron');
const {app, BrowserWindow, ipcMain} = require('electron');

var configuration = require('./configuration');
var request = require('request');
var http = require('http');
var fs = require ('fs');
var stream = require('stream');
var _ = require('lodash');
var mainWindow = null;

var server = 'http://211.144.201.201:8888';
// server ='http://192.168.5.132:80';
// server ='http://192.168.5.134:80';
//user
var user = {};
//files
var allFiles = [];
var tree = {};
var map = new Map();
//share
var shareFiles = [];
var shareTree = [];
var shareMap = new Map();
var filesShared = [];
var shareChildren = [];
//directory
var currentDirectory = {};
var children = [];
var parent = {};
var path = [];
var tree = {};
//upload 
// var uploadQueueWait = [];
// var uploadQueue = [];
//-------------------------------------------------------------------------------------------------------------
var uploadQueue = [];
var uploadNow = [];
var uploadMap = new Map();

var c = console.log;
//app ready and open window
app.on('ready', function() {
	mainWindow = new BrowserWindow({
		frame: true,
		height: 768,
		resizable: false,
		width: 1366
	});
	mainWindow.webContents.openDevTools();
	mainWindow.loadURL('file://' + __dirname + '/ele/index.html');
});
//get all user information
ipcMain.on('login',function(event,username,password){
	login().then((data)=>{
		user = data.find((item)=>{return item.username == username});
		return getToken(user.uuid,password);
	}).then((token)=>{
		user.token = token.token;
		user.type = token.type;
		return getAllUser();
	}).then((users)=>{
		user.allUser = users;
		mainWindow.webContents.send('loggedin',user);
	}).catch((err)=>{
		mainWindow.webContents.send('message','loginFailed',0);
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
			console.log();
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
		dealWithData(data);
		mainWindow.webContents.send('receive', currentDirectory,children,parent,path,shareChildren);
		// mainWindow.webContents.send('setTree',tree[0]);
	}).catch((err)=>{
		mainWindow.webContents.send('message','get data error',1);	
	});
});
ipcMain.on('refresh',(e,uuid)=>{
	getFiles().then((data)=>{
		dealWithData(data);
		mainWindow.webContents.send('refresh',children);
	}).catch((err)=>{
		mainWindow.webContents.send('message','get data error',1);	
	});
});
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
function dealWithData(data) {
	//set allfiles
	allFiles = data;
	allFiles = allFiles.map((item)=>{item.share = false;item.checked = false;return item});
	//separate shared files from allfiles
	classifyShareFiles();
	//set tree
	tree = getTree(allFiles,'file');
	shareTree = getTree(shareFiles,'share');
	// set children
	// children = Object.assign({},tree.filter(item=>item.parent==''),{children:null});
	children = tree.filter(item=>item.parent=='').map(item=>Object.assign({},item,{children:{}}));
	shareTree.forEach((item)=>{if (item.hasParent == false) {shareChildren.push(item)}});
	//set path
	path.length = 0;
	path.push({key:''});
}
function classifyShareFiles() {
	let userUUID = user.uuid;
	allFiles.forEach((item,index)=>{
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
				}(item);
			}
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
				share:item.share==true?true:false,
				type:item.type,
				checked:false,
				owner:item.permission.owner,
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
			if (item.type == 'folder') {
				map.set(item.uuid,item);	
			}	
		});
	}
	return tree;	
}
//select children
ipcMain.on('enterChildren', (event,selectItem) => {
	//parent
	var parent = Object.assign({},map.get(selectItem.parent),{children:null});
	//currentDirectory
	currentDirectory = selectItem;
	//children
	children = map.get(selectItem.uuid).children.map(item=>Object.assign({},item,{children:null}));
	//path
	try {
		path.length = 0;
		getPath(selectItem);
		path = _.cloneDeep(path);
	}catch(e) {
		console.log(e);        
		path.length=0;
	}finally {
		mainWindow.webContents.send('receive',currentDirectory,children,parent,path,shareChildren);
	}
});
function getPath(obj) {
	//insert obj to path
	path.unshift({key:obj.attribute.name,value:allFiles.find((item)=>{return item.uuid == obj.uuid})});
	//obj is root?
	if (obj.parent == undefined || obj.parent == '') {
		path.unshift({key:'',value:{}});
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
//upload file
ipcMain.on('uploadFile',(e,files)=>{
	// uploadQueueWait = uploadQueueWait.concat(files);
	// dealUploadQueue();
	//-------------------------------------------------------------------------------------------------------------
	uploadQueue.push(files);
	dealUploadQueue();
});
function dealUploadQueue() {
	// if (uploadQueueWait.length == 0) {
	// 	return;
	// }else  {
	// 	if (uploadQueue.length < 10) {
	// 		let times =10- uploadQueue.length;
	// 		// console.log('times:'+ times);
	// 		for (let i =0; i < times ;i++) {
	// 			console.log(uploadQueueWait.length);
	// 			if (uploadQueueWait.length == 0 ) {break;}
	// 			let file = uploadQueueWait.shift();
	// 			uploadQueue.push(file);
	// 			uploadFile(file);
	// 		}
	// 	}else {
	// 		return
	// 	}
	// }
	//-------------------------------------------------------------------------------------------------------------
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
					console.log(index);
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
			// let index = uploadQueue.findIndex((item,index)=>{
			// 	return item.path == file.path;
			// });
			// uploadQueue.splice(index,1);
			// if (uploadQueue.length == 0) {
			// 	dealUploadQueue();
			// }
			//-------------------------------------------------------------------------------------------------------------
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
	//insert obj
	// var f= {
	// 	uuid:uuid,
	// 	parent: file.parent.uuid,
	// 	checked: false,
	// 	share:false,
	// 	attribute: {
	// 		name:file.name,
	// 		size:file.size	,
	// 		changetime: "",
	// 		createtime: "",
	// 	},
	// 	type: 'file',
	// 	children : [],
	// 	name:file.name,
	// }
	// let d = map.get(file.parent.uuid);
	// d.children.push(f);
	// //insert folder obj into map
	// map.set(uuid,f);
	// //get children 
	// children = d.children.map(item=>Object.assign({},item,{children:null}));
	// mainWindow.webContents.send('uploadSuccess',file,children);	
	//-------------------------------------------------------------------------------------------------------------
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
		c('after');

		children = dir.children.map(i => Object.assign({},i,{children:null}));
		console.log(children);
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
			modifyFolder(name,dir,uuid);
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
function modifyFolder(name,dir,folderuuid) {
	//insert uuid
	let item = allFiles.find((item)=>{return item.uuid == dir.uuid});
	item != undefined && item.children.push(folderuuid);

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
		mainWindow.webContents.send('message','新建文件夹成功');
		mainWindow.webContents.send('uploadSuccess',folder,_.cloneDeep(children));
	}
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
	console.log('ipc enter');
	files.forEach((item)=>{
		console.log('for each');
		share(item,users).then(()=>{
			console.log('then le');
		});
	});
});
function share(file,users) {
	var s = new Promise((resolve,reject)=>{
		console.log(users);
		var y = [];
		var options = {
			headers: {
				Authorization: user.type+' '+user.token
			},
			form: {readlist:JSON.stringify(users),writelist:JSON.stringify(y)}
		}
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
		console.log('333');
		request.patch(server+'/files/'+file.uuid+'?type=permission',options,callback);
	});
	return s;
}
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
//getTreeChildren
ipcMain.on('getTreeChildren',function(err,uuid) {
	if (uuid) {
		let item = map.get(uuid);
		let name = item.name;
		let ch = [];
		item.children.forEach(item=>{
			if (item.type == 'folder') {
				ch.push({name:item.name,uuid:item.uuid});
			}
		});
		let treeObj = {isNull:false,children:ch,name:name}
		mainWindow.webContents.send('treeChildren',treeObj);
	}else {
		let c = {isNull:false,children:children,name:null};
		mainWindow.webContents.send('treeChildren',c);
	}
	// let result = map.get(uuid);
	// result.children = result.children.map((item)=>{
	// 	return Object.assign({},item,{children:null});
	// });
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



