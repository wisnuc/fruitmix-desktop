var Promise = require('bluebird')//corn module
var deepEqual = require('deep-equal')

const electron = require('electron');
const {app, BrowserWindow, ipcMain, dialog, Menu, Tray } = require('electron');
global.ipcMain = ipcMain;
var appIcon = null

global.request = require('request');
global.fs = require ('fs');
global.stream = require('stream');
var path = require('path');
global._ = require('lodash');
global.mdns = require('mdns-js');
// const m = require('mdns');
global.mainWindow = null;
global.fruitmixWindow = null
//server
global.server = '';
// server =	'http://211.144.201.201:8888';
// server = 'http://192.168.5.159:80';
// server = 'http://192.168.5.132:80';
//user
global.user = {};
//files
global.rootNode= null;
global.allFiles = [];
global.tree = {};
global.map = new Map();
//share
global.shareFiles = [];
global.shareTree = [];
global.shareMap = new Map();
global.shareChildren = [];
global.sharePath = [];
global.filesSharedByMe = [];
//directory
global.currentDirectory = {};
global.children = [];
global.parent = {};
global.dirPath = [];
global.tree = {};
//upload 
global.uploadQueue = [];
global.uploadNow = [];
//download
global.downloadQueue = [];
global.downloadNow = [];
global.downloadFolderQueue = [];
global.downloadFolderNow = [];
//media
global.media = [];
global.mediaMap = new Map();
global.thumbQueue = [];
global.thumbIng = [];
//path
global.mediaPath = path.join(__dirname,'media');
global.downloadPath = path.join(__dirname,'download');
//device
global.device = [];
global.serverRecord = null;

global.c = console.log;

global.mocha = true

mdns.excludeInterface('0.0.0.0');
var browser = mdns.createBrowser(mdns.tcp('http'));
browser.on('update', findDevice);
function findDevice(data) {
	if (!data.fullname) {
		return
	}
	let fru = data.fullname.toLowerCase().indexOf('fruitmix');
	let app = data.fullname.toLowerCase().indexOf('wisnuc appstation');
	if (fru == -1 && app == -1) {
		return
	}
	// c(data.addresses[0]);
	// is exist
	let deviceIndex = device.findIndex(item=>{
		return item.addresses[0] == data.addresses[0];
	});
	if (deviceIndex == -1) {
		c('ip not exist');
		//not exist
		if (fru != -1) {
			c('type is fruitmix');
			let index = device.length;
			device.push(Object.assign({},data,{active:false,isCustom:false,fruitmix:true,admin:false}));
			//fruitmix server
			request.get('http://'+data.addresses[0]+'/login',(err,res,body)=>{
				if (!err && res.statusCode == 200) {
					if (JSON.parse(body).length == 0) {
						device[index].admin = false;
					}else {
						device[index].admin = true;
					}
				}else {
					c('can not get users information');
					device[index].admin = false;
				}
				mainWindow.webContents.send('device',device);
				c('------------------------------------------1');
			});
		}else if(app != -1){
			c('type is wisnuc');
			device.push(Object.assign({},data,{active:false,isCustom:false,fruitmix:false,admin:false}));
			mainWindow.webContents.send('device',device);
			c('------------------------------------------2');
		}
	}else {
		c('ip exist');
		//exist
		if (device[deviceIndex].fullname == data.fullname) {
			return
		}else {
			c('ip has change');
			device[deviceIndex].fullname = data.fullname
			let f = fru==-1?false:true;
			if (!f) {
				device[deviceIndex].fruitmix = false;
				mainWindow.webContents.send('device',device);
				c('ip ' + data.addresses[0] + 'fruitmix close');
			}else {
				device[deviceIndex].fruitmix = true;
				setTimeout(function(){
					request.get('http://'+data.addresses[0]+'/login',(err,res,body)=>{
						c(res,err)
						if (!err && res.statusCode == 200) {
							if (JSON.parse(body).length == 0) {
								device[deviceIndex].admin = false;
							}else {
								device[deviceIndex].admin = true;
							}
						}else {
							device[deviceIndex].admin = false
						}
						mainWindow.webContents.send('device',device);
						c('ip ' + data.addresses[0] + 'fruitmix open');
					});	
				},2000);
			}
		}
	}	
}
//require module
const upload = require('./lib/upload');
const download = require('./lib/download');
const loginApi = require('./lib/login');
const mediaApi = require('./lib/media');  

//app ready and open window ------------------------------------
app.on('ready', function() {
	mainWindow = new BrowserWindow({
		frame: true,
		height: 768,
		resizable: true,
		width: 1366,
		minWidth:1024,
		minHeight:768,
		title:'WISNUC',
		icon: path.join(__dirname,'180-180.png')
	});
	//window title
	mainWindow.on('page-title-updated',function(event){
		event.preventDefault()
	});
	mainWindow.webContents.openDevTools();
	mainWindow.loadURL('file://' + __dirname + '/build/index.html');
	//create folder
	fs.exists(mediaPath,exists=>{
		if (!exists) {
			fs.mkdir(mediaPath,err=>{
				if(err){
					console.log(err);
				}
			});
		}
	});
	fs.exists(downloadPath,exists=>{
		if (!exists) {
			fs.mkdir(downloadPath,err=>{
				if(err){
					console.log(err);
				}
			});
		}
	});

	//Tray
	appIcon = new Tray(path.join(__dirname,'180-180.png'))
	var contextMenu = Menu.buildFromTemplate([
	    { label: 'Item1', type: 'radio' },
	    { label: 'Item2', type: 'radio' },
	    { label: 'Item3', type: 'radio', checked: true },
	    { label: 'Item4', type: 'radio' }
	]);
	appIcon.setToolTip('This is my application.');
  	appIcon.setContextMenu(contextMenu);
});

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('getDeviceUsedRecently',err=>{
	c(' ');
	//have device used recently
	fs.readFile(path.join(__dirname,'server'),{encoding: 'utf8'},(err,data)=>{
		if (err) {
			c('not find server record');
			serverRecord = {ip:'',savePassword:false,autoLogin:false,username:null,password:null,customDevice:[],download: downloadPath};
			let j = JSON.stringify(serverRecord);
			fs.writeFile(path.join(__dirname,'server'),j,(err,data)=>{

			});
			mainWindow.webContents.send('device',device);
		}else { 
			c('find record');
			serverRecord = JSON.parse(data);
			downloadPath = serverRecord.download;
			c('download path is : ' + downloadPath);
			mainWindow.webContents.send('setDownloadPath',downloadPath);
			if (serverRecord.ip != '') {
				server = 'http://'+serverRecord.ip;
				c('server ip is : ' + server);
				mainWindow.webContents.send('setDeviceUsedRecently',serverRecord.ip);
			}
			if (serverRecord.customDevice.length !=0) {
				device.concat(serverRecord.customDevice);
				for (let item of serverRecord.customDevice) {
					device.push(item);
				}
				mainWindow.webContents.send('device',device);
			}
		}
		
	});
});
//setIp
ipcMain.on('setServeIp',(err,ip, isCustom)=>{ 
	let index = device.findIndex(item=>{
		return item.addresses[0] == ip;
	});
	if (index != -1) {
		server = 'http://' + ip;
	}else {
		server = 'http://' + ip;
	}
	fs.readFile(path.join(__dirname,'server'),{encoding: 'utf8'},(err,data)=>{
		let d = JSON.parse(data);
		d.ip = ip;
		if (isCustom) {
			d.customDevice.push({addresses:[ip],host:ip,fullname:ip,active:false,checked:true,isCustom:true});
			device.push({addresses:[ip],host:ip,fullname:ip,active:false,checked:true,isCustom:true});
			mainWindow.webContents.send('device',device);
		}
		let j = JSON.stringify(d);
		fs.writeFile(path.join(__dirname,'server'),j,(err,data)=>{

		});
	});
});
ipcMain.on('delServer',(err,i)=>{
	let index = device.findIndex(item=>{
		return item.addresses[0] == i.addresses[0];
	});
	device.splice(index,1);
	fs.readFile(path.join(__dirname,'server'),{encoding: 'utf8'},(err,data)=>{
		let d = JSON.parse(data); 
		c(d);
		let ind = d.customDevice.findIndex(item=>{
			return item.addresses[0] == i.addresses[0]
		});
		if (ind != -1) {
			d.customDevice.splice(ind,1);
		}
		let j = JSON.stringify(d);
		fs.writeFile(path.join(__dirname,'server'),j,(err,data)=>{

		});
	});
	mainWindow.webContents.send('device',device);
});
//find fruitmix
ipcMain.on('findFruitmix',(e,item)=>{
	browser.discover();
});
//create fruitmix
ipcMain.on('createFruitmix',(err,item)=>{
	c(item.addresses[0]+':'+item.port);
	fruitmixWindow = new BrowserWindow({
		frame: true,
		height: 768,
		resizable: true,
		width: 1366,
		minWidth:1024,
		minHeight:768,
		title:'WISNUC'
	});
	//window title
	fruitmixWindow.on('page-title-updated',function(event){
		event.preventDefault()
	});
	fruitmixWindow.loadURL('http://'+item.addresses[0]+':3000');
});
//get usersList
ipcMain.on('getUserList',(e,item)=>{
	// c(item);
});
//get all user information --------------------------------------
ipcMain.on('login',function(err,username,password){
	c(' ');
	c('login : ');
	loginApi.login().then((data)=>{
		c('get login data : ' + data.length + ' users');
		user = data.find((item)=>{return item.username == username});
		if (user == undefined) {
			throw new Error('username is not exist in login data')
		}
		return loginApi.getToken(user.uuid,password);
	}).then((token)=>{
		c('get token : '+ token.type +token.token);
		user.token = token.token;
		user.type = token.type;
		return loginApi.getAllUser();
	}).then((users)=>{
		c('get users : ' + users.length);
		user.allUser = users;
		mainWindow.webContents.send('loggedin',user);
	}).catch((err)=>{
		c('login failed : ' + err);
		mainWindow.webContents.send('message','登录失败',0);
	});
});
//get all files -------------------------------------------------
ipcMain.on('getRootData', ()=> {
	c(' ');
	c('achieve data : ');
	getFiles().then((data)=>{
		c('get allfiles and length is : ' + data.length );
		//share data
		allFiles.length = 0;
		shareFiles.length = 0;
		sharePath.length = 0;
		shareChildren.length = 0;
		//remove folder
		removeFolder(data);
		dealWithData(data);
		sharePath.push({key:'',value:{}});
		let copyFilesSharedByMe = filesSharedByMe.map(item=>Object.assign({},item,{children:null,writelist:[].concat(item.writelist)}));
		mainWindow.webContents.send('setFilesSharedByMe',copyFilesSharedByMe);
		mainWindow.webContents.send('setShareChildren',shareChildren,sharePath);
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
	try{
		let uuid = null;
		let fruitmixIndex = data.findIndex((item,index)=>{
			return item.parent == ''
		});
		if (fruitmixIndex == -1) {
			throw 'can not find fruitmix';
			return 
		}else {
			rootNode = data[fruitmixIndex]; 
		}

		let fruitmixuuid = data[fruitmixIndex].uuid;
		data.splice(fruitmixIndex,1);
		//data/fruitmix is removed
		let driveIndex = data.findIndex((item)=>{
			return item.parent == fruitmixuuid
		})
		if (driveIndex == -1) {
			throw 'can not find drive';
			return
		}else {
			rootNode = data[driveIndex]; 	
		}
		let driveuuid= data[driveIndex].uuid
		data.splice(driveIndex,1);
		let uuidindex = data.findIndex((item)=>{
			return item.parent == driveuuid
		})
		if (uuidindex == -1) {
			throw 'can not find uuid folder';
			return
		}else {
			data[uuidindex].parent = '';
			data[uuidindex].attribute.name = 'my cloud';
			rootNode = data[uuidindex]; 	
		}
		c('remove folder and length is : ' + data.length );
	}catch(e){
		c(e);
	}
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
	//set share children
	shareTree.forEach((item)=>{if (item.hasParent == false) {shareChildren.push(item)}});
	//set filesSharedByMe
	getFilesSharedByMe();
	//show root file
	enterChildren(rootNode);
}
//get share children
function classifyShareFiles() {
	let userUUID = user.uuid;
	allFiles.forEach((item,index)=>{
		// owner is user ?
		if (item.permission.owner[0] != userUUID ) {
			// is not user
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
	})
	c('screen out share and length is : ' + shareFiles.length );
}
//generate tree
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
				path:item.path,
				name:item.attribute.name,
				parent: item.parent,
				children: item.children,
				share:item.share,
				type:item.type,
				checked:false,
				owner:item.permission.owner,
				readlist:item.permission.readlist,
				writelist:item.permission.writelist,
				attribute:item.attribute,
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
//seprate files shared by me from files
function getFilesSharedByMe() {
	tree.forEach(item=>{
		if (item.owner == user.uuid && item.readlist.length != 0 && item.writelist.length != 0 && item.readlist[0] != "" && item.writelist[0] != "") {
			filesSharedByMe.push(item);
		}
	});
	c('files shared by me length is : ' + filesSharedByMe.length );
}
//select children
ipcMain.on('enterChildren', (event,selectItem) => {
	enterChildren(selectItem);
});
function enterChildren(selectItem) {
	c(' ');
	c('open the folder : ' + selectItem.name);
	//parent
	if (selectItem.parent == '') {
		parent = {}
	}else {
		parent = Object.assign({},map.get(selectItem.parent),{children:null});	
	}
	c('parent is : ' + parent.name);
	//currentDirectory
	currentDirectory = selectItem;
	//children
	children = map.get(selectItem.uuid).children.map(item=>Object.assign({},item,{children:null}));
	c("number of this folder's children :"  + children.length);
	//path
	try {
		dirPath.length = 0;
		getPath(selectItem);
		dirPath = _.cloneDeep(dirPath);
		c('path length is : ' + dirPath.length);
	}catch(e) {
		console.log(e);        
		path.length=0;
	}finally {
		// let copyFilesSharedByMe = filesSharedByMe.map(item=>Object.assign({},item,{children:null,writelist:[].concat(item.writelist)}));
		mainWindow.webContents.send('receive',currentDirectory,children,parent,dirPath);
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

//file operation api ------------------------------------------

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
		mainWindow.webContents.send('message','注册新用户成功');
		// mainWindow.webContents.send('closeRegisterDialog');
		loginApi.getAllUser().then(users=>{
			user.allUser = users;
			mainWindow.webContents.send('addUser',user);
		});
		
	}).catch((e)=>{
		c(e);
		mainWindow.webContents.send('message','注册新用户失败');
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
			if (!err && res.statusCode == 200) {
				console.log('res');
				resolve(body);
			}else {
				console.log('err');
				c(res.body);
				reject(err)
			}
		};
		request.post(server+'/users/',options,callback);
	});
	return promise;
}
ipcMain.on('userInit',(err,s,u,p,i)=>{
	var options = {
		form: {username:u,password:p}
	};
	function callback (err,res,body) {
		if (!err && res.statusCode == 200) {
			console.log('res');
			c(i);
			mainWindow.webContents.send('message','管理员注册成功');
			let index = device.findIndex(item=>{
				return item.addresses[0] == i.addresses[0];
			});
			mainWindow.webContents.send('message',index);
			if (index != -1) {
				device[index].admin = true;
				mainWindow.webContents.send('device',device);
			}
		}else {
			console.log('err');
		}
	};
	request.post(s+'/init',options,callback);
});
//delete user 
ipcMain.on('deleteUser',(err,uuid)=>{
	c(uuid);
	var options = {
			headers: {
				Authorization: user.type+' '+user.token
			},
			form: {uuid:uuid}
		}
		function callback (err,res,body) {
			if (!err && res.statusCode == 200) {
				console.log('res');
				loginApi.getAllUser().then((users)=>{
					user.allUser = users;
					mainWindow.webContents.send('setUsers',user);
				});
			}else {
				console.log('err');
			}
		};
		request.del(server+'/users',options,callback);
});
//share
ipcMain.on('share',function(err,files,users){
	c(files);
	files.forEach((item)=>{
		share(item,users).then(()=>{
			//changeShareData
			let file = map.get(item.uuid);
			file.readlist = users;
			let u = _.clone(users);
			file.writelist = u;
			//is exist in filesSharedByMe?
			let index = filesSharedByMe.findIndex(f=>f.uuid == item.uuid);

			if (index == -1) {
				filesSharedByMe.push(file);
				mainWindow.webContents.send('setFilesSharedByMe',filesSharedByMe);
			}else {
				filesSharedByMe[index] = file;
				mainWindow.webContents.send('setFilesSharedByMe',filesSharedByMe);
			}
			mainWindow.webContents.send('message',item.name + '分享成功');	
		}).catch(err=>{
			mainWindow.webContents.send('message',item.name+ '分享失败,请稍后再试');
		});
	});
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
				console.log(res);
				reject()
			}
		};
		request.patch(server+'/files/'+file.uuid+'?type=permission',options,callback);
	});
	return s;
}
//cancel share
ipcMain.on('cancelShare',(err,item)=>{
	share(item,[]).then(()=>{
		console.log('cancel success');
		let index = filesSharedByMe.findIndex(i=>{
			return item.uuid == i.uuid
		});
		filesSharedByMe.splice(index,1);
		mainWindow.webContents.send('setFilesSharedByMe',filesSharedByMe);
	}).catch(err=>{
		c('cancel failed');
	});
});
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
		mainWindow.webContents.send('message',arr.length+' 个文件移动成功');
		if (currentDirectory.uuid == arr[0].parent) {
			enterChildren(currentDirectory);
		}
	}).catch(r=>{
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
				console.log(uuid + 'move to '+ target +'success');
				c(body);
				resolve(body);
				let currentNode = map.get(uuid);
				let parent = map.get(currentNode.parent);
				let targetNode = map.get(target);
				currentNode.parent = target;
				parent.children.splice(parent.children.findIndex(item=>item.uuid==currentNode.uuid),1);
				targetNode.children.push(currentNode);
			}else {
				c(uuid + 'move to '+ target +'failed');
				c(res.body);
				reject(index);
			}
		};
		request.patch(server+'/files/'+uuid,options,callback);
	});
	return promise
}
//enterShare
ipcMain.on('enterShare',(err,item)=>{
	let share = shareMap.get(item.uuid);
	let children = share.children.map(item=>{
		return Object.assign({},item,{children:[]});
	});
	sharePath = [];
	c(share);
	getSharePath(share);
	// let sharePath = [];
	mainWindow.webContents.send('setShareChildren',children,sharePath);
});
function getSharePath(obj) {
	//insert obj to path
	sharePath.unshift({key:obj.name,value:Object.assign({},obj,{children:null})});
	//obj is root?
	if (obj.parent == undefined || obj.parent == '') {
		sharePath.unshift({key:'',value:{}});
		return; 
	}else {
		let oo = shareMap.get(obj.parent);
		if (oo == undefined) {
			sharePath.unshift({key:'',value:{}});
			return
		}else {
			getSharePath(oo);	
		}
		
	}
}
ipcMain.on('backShareRoot',err=>{
	shareChildren.length = 0;
	shareTree.forEach((item)=>{if (item.hasParent == false) {shareChildren.push(item);}});
	sharePath.length = 0;
	sharePath.push({value:'',obj:{}})
	mainWindow.webContents.send('setShareChildren',shareChildren,sharePath);
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
	sharePath = [];
	//directory
	currentDirectory = {};
	children = [];
	parent = {};
	dirPath = [];
	tree = {};
	//upload 
	uploadQueue = [];
	uploadNow = [];
	//download
	downloadQueue = [];
	downloadNow = [];
	downloadFolderQueue = [];
	downloadFolderNow = [];
	//media
	media = [];
	mediaMap = new Map();
	thumbQueue = [];
	thumbIng = [];
});

ipcMain.on('changeDownloadPath', e=>{
	dialog.showOpenDialog({properties: [ 'openDirectory']},function(folder) {
		if (folder == undefined)　{
			return
		}
		let folderPath = path.normalize(folder[0]);
		c(folderPath);
		downloadPath = folderPath;
		mainWindow.webContents.send('setDownloadPath',downloadPath);
		fs.readFile(path.join(__dirname,'server'),{encoding: 'utf8'},(err,data)=>{
			if (err) {
				serverRecord = {ip:'',savePassword:false,autoLogin:false,username:null,password:null,customDevice:[],download: downloadPath};
				let j = JSON.stringify(serverRecord);
				fs.writeFile(path.join(__dirname,'server'),j,(err,data)=>{

				});
			}else {
				serverRecord = JSON.parse(data);
				serverRecord.download = downloadPath;
				let j = JSON.stringify(serverRecord);
				fs.writeFile(path.join(__dirname,'server'),j,(err,data)=>{

				});
			}
			
		});
	});
});


// media api --------------------------------------------

//getMediaData
ipcMain.on('getMediaData',(err)=>{
	mediaApi.getMediaData().then((data)=>{
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
//getMediaThumb
ipcMain.on('getThumb',(err,item)=>{
	thumbQueue.push(item);
	dealThumbQueue();
});
function dealThumbQueue() {
	if (thumbQueue.length == 0) {
		return
	}else {

			if (thumbIng.length == 0) {
				for (var i=0;i<1;i++) {
					if (thumbQueue.length == 0) {
						break;
					}
					let item = thumbQueue.shift();
					thumbIng.push(item);
					isThumbExist(item);
				}
			}

	}
}
function isThumbExist(item) {
	c(item.hash);
	fs.readFile(path.join(mediaPath,item.hash+'thumb'),(err,data)=>{
		if (err) {
			downloadMedia(item).then((data)=>{
				sendThumb(item);
				console.log(thumbQueue.length+' length');
			}).catch(err=>{
				c(item.hash+' failed');
				item.failed++;
				let index = thumbIng.findIndex(i=>i.hash == item.hash);
				let t = thumbIng[index];
				thumbIng.splice(index,1);
				if (item.failed <5) {
					fs.readFile(path.join(mediaPath,item.hash+'thumb'),(err,data)=>{
						if (err) {

						}else {
							c('find cache');
						}
					});
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
		c(item.hash+' is over');
		let index = thumbIng.findIndex(i=>i.hash == item.hash);
		thumbIng.splice(index,1);
		item.path = path.join(mediaPath,item.hash+'thumb');
		mainWindow.webContents.send('getThumbSuccess',item);
		setTimeout(dealThumbQueue,200);
	}
}
function downloadMedia(item) {
	var download = new Promise((resolve,reject)=>{
		let scale = item.width/item.height;
		let height = 100/scale;
		c('100 '+height);
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
				fs.unlink(path.join(mediaPath,item.hash+'thumb'), (err,data)=>{
					reject(err)	
				});
				
			}
		}
			var stream = fs.createWriteStream(path.join(mediaPath,item.hash+'thumb'));

			request(options,callback).pipe(stream);
		})
	return download;
}
//getMediaImage
ipcMain.on('getMediaImage',(err,item)=>{
	downloadMediaImage(item).then(()=>{
		c('download media image success');
		item.path = path.join(mediaPath,item.hash);
		fs.stat(item.path,function(err,data){
			c(data);
		});
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
				fs.unlink(path.join(mediaPath,item.hash), (err,data)=>{
					reject()
				});
				
			}
		}
		var stream = fs.createWriteStream(path.join(mediaPath,item.hash));
		request(options,callback).pipe(stream);
	});
	return promise
}

// transimission api -------------------------------------

//create folder
ipcMain.on('upLoadFolder',(e,name,dir)=>{
	upload.createFolder(name,dir);
});

//upload file
ipcMain.on('uploadFile',(e,files)=>{
	uploadQueue.push(files);
	upload.dealUploadQueue();
});

//upload folder
ipcMain.on('openInputOfFolder', e=>{
	var uploadObj = {status:'准备',data:{},success:0,count:0,key:'',type:'folder',name:''};
	dialog.showOpenDialog({properties: [ 'openDirectory']},function(folder){
		if (folder == undefined)　{
			return
		}
		let folderPath = path.normalize(folder[0]);
		c('folder path is : ' + folderPath);
		let t = (new Date()).getTime();
		uploadObj.key = folder+t;
		
		genTask(folderPath,function(err,o){		
			uploadObj.data = o;
			uploadObj.name = path.basename(folderPath);
			let st = setInterval(()=>{
				mainWindow.webContents.send('refreshUploadStatusOfFolder',uploadObj.key,uploadObj.success+' / '+uploadObj.count);
			},1000);
			let f = function() {
				if (o.times>5) {
						c('folder upload success !');
						o.status = 'failed';
						clearInterval(st);
						mainWindow.webContents.send('refreshUploadStatusOfFolder',uploadObj.key,'上传失败');
					}else {
						uploadNode(o,s,f);
					}
			}
			let s = function() {
				c('folder upload success !');
				clearInterval(st);
				mainWindow.webContents.send('refreshUploadStatusOfFolder',uploadObj.key,'已完成');
			}
			mainWindow.webContents.send('transmissionUpload',uploadObj);
			uploadNode(o,s,f);
		});
	})
	function genTask(rootpath, callback) {
	  	let obj = {times:0,children:[],path:rootpath,status:'准备',parent:currentDirectory.uuid,type:'folder',name:path.basename(rootpath)};
	  	var func = (dir, stat, cur) => {
	  		cur.push({
	  			path: dir,
	  			type: stat?'folder':'file',
	  			times: 0,
	  			status: 'ready',
	  			uuid:null,
	  			children:[],
	  			parent:null,
	  			name: path.basename(dir)
	  		});
	  	}
	  	traverse(rootpath, func, () => callback(null, obj), obj.children);
	  	function traverse(dir, visitor, callback, current) {
	  		uploadObj.count++;
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
	  						c('count : ' + uploadObj.count + ' ' + entryPath + ' ----> directory');
		        			//recursion
		        			let index = current.length;
		          			traverse(entryPath,visitor, () => {
		          			count--
		          			if (count === 0) callback()
		          				return
		          			},current[index-1].children);
		          			
		        		}
		        		else {
		        			uploadObj.count++;
		        			c('count : ' + uploadObj.count + ' ' + entryPath + ' ----> file');
		          			count--
				          	if (count === 0) callback()
				          	return
			        	}
			  		})
				})
		  	})
		}
	}
	function uploadNode(node,callback,failedCallback) {
		try{
			c(' ');
			console.log('current file/folder is : ' + node.name);
			if (node.type == 'file') {
				uploadFileInFolder(node).then(()=>{
					c('create file success : '+ node.name);
					uploadObj.success++;
					callback();
				}).catch((err)=>{
					c('create file failed! : '+ node.name);
					node.times++;
					failedCallback();
				});
			}else {
				let length = node.children.length;
				let index = 0;
				createFolder({uuid:node.parent},node.name).then(uuid=>{
					c('create folder success : '+ node.name);
					uploadObj.success++;
					if (length == 0) {
						callback();
					}else {
						node.children.forEach((item,index)=>{
							node.children[index].parent = uuid;
						});
						let c = function(){
							index++;
							
							if (index >= length) {
								callback();
							}else {
								console.log('current ' + index+ "   "+length);
								uploadNode(node.children[index],c)
							}
						};

						let f = function() {
							c('callback');
							if (node.children[index].times>5) {
								node.children[index].status = 'failed';
								c(node.children[index].name + 'is absolute failed');
								index++;
								if (index >= length) {
									
									callback();
								}else {
									console.log('current ' + index+ "   "+length);
									uploadNode(node.children[index],c)
								}
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
		}catch(e){

		}
	}
});

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
				upload.modifyFolder(name,dir,uuid,false);
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
				try{
				let uuid = body.slice(1,body.length-1);
				let dir = map.get(node.parent);
				let o = {
					uuid:uuid,
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
				map.set(uuid,o);
				resolve(uuid);
			}catch(e){

			}
			}else {
				console.log(res.body);
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
//download file
ipcMain.on('download',(e,files)=>{
	console.log(files)
	downloadQueue.push(files);
	download.dealDownloadQueue();
})
//download folder
ipcMain.on('downloadFolder',(err,folder,type)=>{
	folder.forEach(item=>{
		let tree = null;
		if (type == 'share') {
			tree = shareMap.get(item.uuid);
		}else {
			tree = map.get(item.uuid);
		}
		
		let count = download.getTreeCount(tree);
		let time = (new Date()).getTime();
		let obj = {count:count,failed:[],success:0,data:tree,type:'folder',status:'ready',key:item.uuid+time};
		downloadFolderQueue.push(obj);
		mainWindow.webContents.send('transmissionDownload',obj);	
	});
	if (downloadFolderNow.length == 0) {
		downloadFolderNow.push(downloadFolderQueue[0]);
		download.downloadFolder(downloadFolderNow[0]);
	}
})

ipcMain.on('store',(err,store)=>{
	console.log(store);
	var s = JSON.stringify(store);
	fs.writeFile(path.join(__dirname,'testData'),s,(err)=>{
		if (err) {
			c('save store failed : ' + err )
		}else {
			c('save store success ' )
		}
	});
});

var expecting = null

/**
ipcMain.on('dispatch',(err,action)=>{
	c('=== dispatch begin ===');
	c(action);
	c('=== dispatch end ===');
	let store ;
	switch(action.type){
		case "":
			return {}
		default :
			fs.readFile(path.join(__dirname,'testData'),{encoding:'utf8'},(err,data)=>{
				if (err) {
					c(err)
					return 
				}
				mainWindow.webContents.send('stateUpdate', JSON.parse(data));
			});
	}
});
**/

ipcMain.on('dispatch', (err, action) => {

	if (action === undefined) return

	if (expecting && typeof expecting ==='function') {
		console.log('triggering expecting >>>>')
		expecting(action)
		console.log('triggering expecting done <<<<')
		expecting = null
	}
	else {
		console.log('no expecting')
	}
})

function loadSendExpect(testcase, callback) {

	console.log('debug ====')
	console.log(testcase.data)

	fs.readFile(testcase.data, (err, data) => {
		if (err) return callback(err)
		let parsed
		try {
			parsed = JSON.parse(data.toString())
		}
		catch(e) {
			return callback(e)
		}
		console.log('sending parsed content to mainWindow')
		mainWindow.webContents.send('stateUpdate', parsed)

		console.log('testcase name:' + testcase.name)
		console.log('hint:' + testcase.hint)

		expecting = function(action) {
			if (deepEqual(action, testcase.expectation)) {
				console.log('passed.')
				callback(null)
			}
			else {
				console.log('assertion failed:' + testcase.name)
				console.log('expectation:')
				console.log(testcase.expectation)
				console.log('actual:')
				console.log(action)
				callback(new Error('test failed'))
			}
		}
	})
}

var loadSendExpectAsync = Promise.promisify(loadSendExpect)

function testInit(callback) {
	if (!mocha) {
		return
	}
	fs.readdir('viewtest', (err, entries) => {
		if (err) return callback(err)
		console.log('=====')
		console.log(entries)

		let cases = require(path.join(process.cwd(), 'viewtest', entries[0]))()

		console.log(cases)

		loadSendExpectAsync(cases[0])
			.then(() => callback(null))
			.catch(e => callback(e))
	})
}

setTimeout(() => testInit((err) => {
	console.log(err)
	console.log('test data sent to mainWindow')
}), 3000)

