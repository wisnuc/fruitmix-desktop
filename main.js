var Promise = require('bluebird')//corn module
var deepEqual = require('deep-equal')

var debug = require('debug')("main")

const electron = require('electron')
const {app, BrowserWindow, ipcMain, dialog, Menu, Tray } = require('electron')
global.ipcMain = ipcMain
var appIcon = null

global.request = require('request')
global.fs = require ('fs')
global.stream = require('stream')
global.path = require('path')
global._ = require('lodash')
global.mdns = require('mdns-js')
global.crypto = require('crypto')

global.mainWindow = null
global.testWindow = null
global.fruitmixWindow = null
global.appifiWindow = null
//server
global.server = ''
global.OSServer = ''
//user
global.user = {}
//files
global.drives = []
global.rootNode = null
global.tree = []
global.map = new Map()
//share
global.shareRoot = []
global.shareChildren = []
global.sharePath = []
//directory
global.currentDirectory = {}
global.children = []
global.parent = {}
global.dirPath = []
global.tree = []
//upload 
global.uploadNow = []
global.uploadHandleArr = []
global.uploadQueue = []
// global.httpRequestConcurrency = 4
// global.fileHashConcurrency = 4
// global.runningQueue = []
// const readyQueue = []
// const hashingQueue = []
// const hashlessQueue = []
// const userTasks = []
//download
global.downloadQueue = []
global.downloadNow = []
global.downloadFolderQueue = []
global.downloadFolderNow = []
//media
global.media = []
global.mediaMap = new Map()
global.mediaShare = []
global.mediaShareMap = new Map()
global.thumbQueue = []
global.thumbIng = []
global.shareThumbQueue = []
global.shareThumbIng = []
//path
global.mediaPath = path.join(__dirname,'media')
global.downloadPath = path.join(__dirname,'download')
//device
global.device = []
global.serverRecord = null
global.isLogin = false
global.c = console.log

global.mocha = false

// mdns.excludeInterface('0.0.0.0')
// var browser = mdns.createBrowser(mdns.tcp('http'))

//require module
const upload = require('./lib/upload')
const download = require('./lib/download')
const loginApi = require('./lib/login')
const mediaApi = require('./lib/media')
const deviceApi = require('./lib/device')
const fileApi = require('./lib/file')
const utils = require('./lib/util')
var findDevice = require('./lib/mdns')

//require store
global.action = require('./serve/action/action')
global.store = require('./serve/store/store')

// global.dispatch = store.dispatch
global.dispatch = (action) => {
	c(' ')
	// debug(action.type)
	store.dispatch(action)
}
const adapter = () => {
	c('run dapter')
	return {
		login : store.getState().login,
		setting : store.getState().setting,
		file : store.getState().file,
		media : store.getState().media,
		share: store.getState().share,
		// transimission: store.getState().transimission
	}
}

var storeLock = false
var waitForRender = null

store.subscribe(() => { 
	if (storeLock) {
		clearTimeout(waitForRender)
		waitForRender = setTimeout(()=>{
			storeLock = false;
			debug('subscribe doing .......' + (new Date).getTime())
			mainWindow.webContents.send('adapter',adapter())
		},200)
	}else {
		debug('subscribe doing .......' + (new Date).getTime())
		mainWindow.webContents.send('adapter',adapter())
		storeLock = true
		waitForRender = setTimeout(()=>{
			storeLock = false
		},200)
	}
})

// browser.on('update', deviceApi.findDevice) 


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
	})
	//window title
	mainWindow.on('page-title-updated',function(event){
		event.preventDefault()
	})
	mainWindow.webContents.openDevTools()
	mainWindow.loadURL('file://' + __dirname + '/build/index.html')
	//create folder
	fs.exists(mediaPath,exists=>{
		if (!exists) {
			fs.mkdir(mediaPath,err=>{
				if(err){
					console.log(err)
				}
			})
		}
	})
	fs.exists(downloadPath,exists=>{
		if (!exists) {
			fs.mkdir(downloadPath,err=>{
				if(err){
					console.log(err)
				}
			})
		}
	})

	setTimeout( () => {
		var x = findDevice().on('stationUpdate', data => {
			dispatch(action.setDevice(data))
		})
	},500)

	//Tray
	// appIcon = new Tray(path.join(__dirname,'180-180.png'))
	// var contextMenu = Menu.buildFromTemplate([
	//     { label: 'Item1', type: 'radio' },
	//     { label: 'Item2', type: 'radio' },
	//     { label: 'Item3', type: 'radio', checked: true },
	//     { label: 'Item4', type: 'radio' }
	// ])
	// appIcon.setToolTip('This is my application.')
 //  	appIcon.setContextMenu(contextMenu)

  	if (mocha) {
		testWindow = new BrowserWindow({
			frame: true,
			height: 768,
			resizable: true,
			width: 1366,
			minWidth:1024,
			minHeight:768,
			title:'WISNUC',
			icon: path.join(__dirname,'180-180.png')
		})
		// testWindow.webContents.openDevTools()
		testWindow.loadURL('file://' + __dirname + '/test/storeTest.html')
	}
})

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('getDeviceUsedRecently',err=>{
	deviceApi.getRecord()
})
//setIp
ipcMain.on('setServeIp',(err,ip, isCustom, isStorage)=>{
	c('set ip : ')
	dispatch(action.setDeviceUsedRecently(ip))
	server = 'http://' + ip + ':3721'
	// server = 'http://' + ip
	OSServer = 'http://' + ip + ':3000'
	// if (isCustom) {
	// 	c('??')
	// 	c(ip)
	// 	return
	// }
	if ( !isStorage) {
		return
	}
	fs.readFile(path.join(process.cwd(),'server'),{encoding: 'utf8'},(err,data)=>{
		if (err) {
			return
		}
		let d = JSON.parse(data)
		d.ip = ip
		if (isCustom) {
			d.customDevice.push({address:ip,host:ip,appifi:{},name:ip,active:false,checked:true,isCustom:true})
		}
		let j = JSON.stringify(d)
		fs.writeFile(path.join(__dirname,'server'),j,(err,data)=>{

		})
	})
})
ipcMain.on('delServer',(err,i)=>{
	// let index = device.findIndex(item=>{
	// 	return item.addresses[0] == i.addresses[0]
	// })
	// device.splice(index,1)

	dispatch(action.deleteServer(i))
	fs.readFile(path.join(__dirname,'server'),{encoding: 'utf8'},(err,data)=>{
		let d = JSON.parse(data) 
		c(d)
		let ind = d.customDevice.findIndex(item=>{
			return item.address == i.address
		})
		if (ind != -1) {
			d.customDevice.splice(ind,1)
		}
		let j = JSON.stringify(d)
		fs.writeFile(path.join(__dirname,'server'),j,(err,data)=>{

		})
	})

	// dispatch(action.setDevice(device))
})
//create fruitmix
ipcMain.on('createFruitmix',(err,item)=>{
	c(item.address[0]+':'+item.port)
	fruitmixWindow = new BrowserWindow({
		frame: true,
		height: 768,
		resizable: true,
		width: 1366,
		minWidth:1024,
		minHeight:768,
		title:'WISNUC'
	})
	//window title
	fruitmixWindow.on('page-title-updated',function(event){
		event.preventDefault()
	})
	fruitmixWindow.loadURL('http://'+item.address+':3000')
})

ipcMain.on('openAppifi', (err)=>{
	fruitmixWindow = new BrowserWindow({
		frame: true,
		height: 768,
		resizable: true,
		width: 1366,
		minWidth:1024,
		minHeight:768,
		title:'WISNUC'
	})
	//window title
	fruitmixWindow.on('page-title-updated',function(event){
		event.preventDefault()
	})
	c(server)
	fruitmixWindow.loadURL(server.substring(0,server.length-4)+3001)
})
//get all user information --------------------------------------
ipcMain.on('login',function(err,username,password){
	c(' ')
	c('login : ')
	dispatch({type: "LOGIN"})
	var tempArr = []
	var colorArr = ['#FFC107','#8BC34C','#00bcd4']
	loginApi.login().then((data)=>{
		c('get login data : ' + data.length + ' users')
		user = data.find((item)=>{return item.username == username})
		if (user == undefined) {
			throw new Error('username is not exist in login data')
		}
		user = Object.assign({},user)
		tempArr = data
		return loginApi.getToken(user.uuid,password)
	}).then((token)=>{
		c('get token : '+ token.type +token.token)
		user.token = token.token
		user.type = token.type
		return loginApi.getAllUser()
	}).then((users)=>{
		c('get users : ' + users.length)
		tempArr.forEach(item => {
			item.checked = false
			let randomNumber = Math.random()
			if (randomNumber< 0.33) {
				item.color = colorArr[0]
			}else if (randomNumber < 0.66) {
				item.color = colorArr[1]
			}else {
				item.color = colorArr[2]
			}
		})
		user.users = tempArr
		user.allUser = users
		isLogin = true
		dispatch(action.loggedin(user))

	}).catch((err)=>{
		c('login failed : ' + err)
		dispatch(action.loginFailed())
		mainWindow.webContents.send('message','登录失败',0)
	})
})
//get all files -------------------------------------------------
ipcMain.on('getRootData', ()=> {
	dispatch(action.loadingFile())
	drives = []
	rootNode = null
	tree = []
	map = new Map()

	c(' ')
	c('achieve data ===> ')
	fileApi.getDrive().then((drivesArr) => {
		drives = drivesArr
		let uuid = store.getState().login.obj.uuid
		let driveUUid = store.getState().login.obj.allUser.find(item=>item.uuid == uuid).home
		let drive = drives.find(item => {
			if (item.uuid == driveUUid) {return true}
		})
		if (drive == undefined) {
			throw new Error('can not find root node')
		}

		tree=Object.assign({},drive,{children:[]})
		map.set(tree.uuid, tree)
		rootNode = tree

		enterChildren(rootNode)
	})
	.catch((err) => {
		c(err)
		mainWindow.webContents.send('message','get data error',1)	
	})
})
//select children
ipcMain.on('enterChildren', (err,selectItem,a) => {
	enterChildren(selectItem)
})
function enterChildren(selectItem) {
	dispatch(action.loadingFile())
	c(' ')
	c('enterChildren : ')
	//c('open the folder : ' + selectItem.name?selectItem.name:'null')
	let folder = map.get(selectItem.uuid)
	fileApi.getFile(selectItem.uuid).then(file => {
		folder.children.length = 0
		file.forEach((item, index) => {
			folder.children.push(Object.assign({}, item, {parent:selectItem.uuid,children:[]}))
			map.set(item.uuid, folder.children[folder.children.length-1])
		})

		currentDirectory = Object.assign({}, selectItem, {children:null})
		children = file.map(item=>Object.assign({},item,{children:null,checked:false}))
		dirPath.length = 0
		getPath(folder)
		dispatch(action.setDir(currentDirectory,children,dirPath))

	}).catch(err => {
		c(err)
	})
}
//get path
function getPath(obj) {
	//obj is root?
	if (obj.parent == undefined || obj.parent == '') {
		dirPath.unshift({key:'',value:{}})
		return 
	}else {
		//insert obj to path
		let item = map.get(obj.uuid)
		dirPath.unshift({key:item.name,value:Object.assign({},item,{children:null})})
		getPath(map.get(obj.parent))
	}
}
ipcMain.on('getFile',(e,uuid)=>{
	getFile(uuid).then((data)=>{
		mainWindow.webContents.send('receiveFile',data)
	})
})
function getFile(uuid) {
	var file = new Promise((resolve,reject)=>{
		request
			.get(server+'/files/'+uuid)
			.set('Authorization',user.type+' '+user.token)
			.end((err,res)=>{
				if (res.ok) {
					resolve(eval(res.body))
				}else {
					reject(err)
				}
			})
	})
	return file
}

ipcMain.on('getFilesSharedToMe',()=>{
	fileApi.getFilesSharedWithMe().then(files=>{
		c('分享给我的文件 获取成功')
		c(files.length + '个文件')
		shareRoot = files
		shareChildren = files
		sharePath.length = 0
		sharePath.push({key:'',value:{}})
		dispatch(action.setShareChildren(shareChildren,sharePath))
	}).catch(err=>{
		c('分享给我的文件 获取失败')
		c(err)
	})
})

ipcMain.on('getFilesSharedToOthers',()=>{
	fileApi.getFilesSharedWithOthers().then(files=>{
		c('我分享的文件 获取成功')
		c(files.length + '个文件')
		dispatch(action.setFilesSharedWithMe(files))
	}).catch(err=>{
		c('我分享的文件 获取失败')
	})
})

//file operation api ------------------------------------------

//delete
ipcMain.on('delete',(e,objArr,dir)=>{
	let count = 0
	c(' ')
	c('删除文件 : ')
	deleteItem()
	function deleteItem() {
		fileApi.deleteFile(objArr[count].uuid,dir.uuid).then(()=>{
			c(objArr[count].uuid,dir.uuid + ' 删除成功')
			let index = map.get(dir.uuid).children.findIndex( (value) => value.uuid == objArr[count].uuid)
			if (index != -1) {
				 map.get(dir.uuid).children.splice(index,1)
				 let obj = map.get(objArr[count].uuid)
				 delete obj
				 map.delete(objArr[count].uuid)
			}
			operationFinish()
		}).catch(err=>{
			c(objArr[count].uuid,dir.uuid + ' 删除失败')
			operationFinish()
		})
	}

	function operationFinish() {
		count++
		if (count != objArr.length) {
			deleteItem()
		}else {
			if (dir.uuid == currentDirectory.uuid) {
				enterChildren(dir)
			}
		}
	}
})
//rename
ipcMain.on('rename',(e,uuid,name,oldName)=>{
	fileApi.rename(uuid,name,oldName).then(()=>{
		map.get(uuid).name = name
		// map.get(uuid).attribute.name = name
	}).catch((err)=>{
		mainWindow.webContents.send('message','文件重命名失败')	
	})
})
//close
ipcMain.on('close-main-window', function () {
    app.quit()
})
//create user
ipcMain.on('create-new-user',function(err, u, p){
	loginApi.createNewUser(u,p).then(()=>{
		console.log('register success')
		mainWindow.webContents.send('message','注册新用户成功')
		loginApi.getAllUser().then(users=>{
			user.allUser = users
			dispatch(action.loggedin(user))
			//mainWindow.webContents.send('addUser',user)
		})

		loginApi.login().then(data=> {
			data.forEach(item => {
				item.checked = false
			})
			user.users = data
			dispatch(action.loggedin(user))
		})
		
	}).catch((e)=>{
		c(e)
		mainWindow.webContents.send('message','注册新用户失败')
	})
})
ipcMain.on('userInit',(err,s,u,p,i)=>{
	c(' ')
	loginApi.userInit(s,u,p).then( () => {
		c('管理员注册成功')
		mainWindow.webContents.send('message','管理员注册成功')
	}).catch(err => {
		c(err)
		c('管理员注册失败')
		mainWindow.webContents.send('message','管理员注册失败')
	})
	return
	var options = {
		form: {username:u,password:p}
	}
	function callback (err,res,body) {
		if (!err && res.statusCode == 200) {
			console.log('res')
			c(i)
			mainWindow.webContents.send('message','管理员注册成功')
			let index = device.findIndex(item=>{
				return item.addresses[0] == i.addresses[0]
			})
			mainWindow.webContents.send('message',index)
			if (index != -1) {
				device[index].admin = true
				// mainWindow.webContents.send('device',device)
				dispatch(action.setDevice(device))
			}
		}else {
			console.log('err')
		}
	}
	request.post(s+'/init',options,callback)
})
//delete user 
ipcMain.on('deleteUser',(err,uuid)=>{
	c(uuid)
	loginApi.deleteUser(uuid).then(() => {

	}).catch(err => {
		mainWindow.webContents.send('message','删除用户失败，接口貌似还不OK')
	})
})
//getTreeChildren
ipcMain.on('getTreeChildren',function(err,uuid) {
	if (uuid && uuid!='') {
		let item = map.get(uuid)
		let name = item.name
		let ch = []
		item.children.forEach(item=>{
			if (item.type == 'folder') {
				ch.push({name:item.name,uuid:item.uuid,parent:item.parent})
			}
		})
		let treeObj = {isNull:false,children:ch,name:name,parent:item.parent,uuid:item.uuid}
		mainWindow.webContents.send('treeChildren',treeObj)
	}
	// let result = map.get(uuid)
	// result.children = result.children.map((item)=>{
	// 	return Object.assign({},item,{children:null})
	// })
})

ipcMain.on('move',function(err,arr,target) {
	let allPromise = arr.map((item,index)=>move(item.uuid,target,index))
	Promise.all(allPromise).then((result)=>{
		mainWindow.webContents.send('message',arr.length+' 个文件移动成功')
		if (currentDirectory.uuid == arr[0].parent) {
			enterChildren(currentDirectory)
		}
	}).catch(r=>{
		mainWindow.webContents.send('message','文件 '+arr[r].attribute.name+'移动失败')
		if (currentDirectory.uuid == arr[0].parent) {
			enterChildren(currentDirectory)
		}
	})
})
function move(uuid,target,index) {
	let promise = new Promise((resolve,reject)=>{
		var options = {
			headers: {
				Authorization: user.type+' '+user.token
			},
			form: {target:target}
		}
		function callback (err,res,body) {
			if (!err && res.statusCode == 200) {
				console.log(uuid + 'move to '+ target +'success')
				c(body)
				resolve(body)
				let currentNode = map.get(uuid)
				let parent = map.get(currentNode.parent)
				let targetNode = map.get(target)
				currentNode.parent = target
				parent.children.splice(parent.children.findIndex(item=>item.uuid==currentNode.uuid),1)
				targetNode.children.push(currentNode)
			}else {
				c(uuid + 'move to '+ target +'failed')
				c(res.body)
				reject(index)
			}
		}
		request.patch(server+'/files/'+uuid,options,callback)
	})
	return promise
}

//share
ipcMain.on('share',function(err,files,users){
	c(' ')
	c(files)
	c(users)
	var index = 0

	function doShare(err) {
		if (err) {
			mainWindow.webContents.send('message',files[index].name + '分享失败')	
			return
		}
		index++
		if (index == files.length) {
			console.log('all share success')
			mainWindow.webContents.send('message',files.length + ' 个文件分享成功')
			ipcMain.emit('getFilesSharedToOthers')
			ipcMain.emit('enterChildren',null,currentDirectory)
			return
		}else {
			fileApi.share(files[index],users,doShare)
		}
	}

	fileApi.share(files[index],users,doShare)
})

//enterShare
ipcMain.on('enterShare',(err,item)=>{
	c(' ')
	fileApi.getFile(item.uuid).then(data => {
		getSharePath(item)
		c('获取shareChildren成功')
		dispatch(action.setShareChildren(data,sharePath))
	}).catch(err => {
		c('获取shareChildren失败')
	})
})

function getSharePath(obj) {
	var index = sharePath.findIndex(item => {
		return item.value.uuid == obj.uuid
	})
	if (index != -1) {
		sharePath.splice(index,sharePath.length - 1 -index)
	}else {
		sharePath.push({key:obj.name,value:obj})
	}
}

ipcMain.on('backShareRoot',err=>{
	mainWindow.webContents.send('setShareChildren',shareChildren,sharePath)
})

//cancel share
ipcMain.on('cancelShare',(err,item)=>{
	fileApi.share(item.uuid, [], (err,data) => {
		ipcMain.emit('getFilesSharedToOthers')
	})
})
//loginOff
ipcMain.on('loginOff',err=>{
	user = {}
	//files
	rootNode= null
	allFiles = []
	filesSharedByMe = []
	tree = {}
	map = new Map()
	//share
	shareFiles = []
	shareTree = []
	shareMap = new Map()
	shareChildren = []
	sharePath = []
	//directory
	currentDirectory = {}
	children = []
	parent = {}
	dirPath = []
	tree = {}
	//upload 
	uploadQueue = []
	uploadNow = []
	//download
	downloadQueue = []
	downloadNow = []
	downloadFolderQueue = []
	downloadFolderNow = []
	//media
	media = []
	mediaMap = new Map()
	thumbQueue = []
	thumbIng = []
	shareThumbQueue = []
	shareThumbIng = []

	dispatch(action.loginoff())
	isLogin = false
})

ipcMain.on('changeDownloadPath', e=>{
	dialog.showOpenDialog({properties: [ 'openDirectory']},function(folder) {
		if (folder == undefined)　{
			return
		}
		let folderPath = path.normalize(folder[0])
		// c(folderPath)
		downloadPath = folderPath
		// mainWindow.webContents.send('setDownloadPath',downloadPath)
		dispatch(action.setDownloadPath(downloadPath))
		
		fs.readFile(path.join(__dirname,'server'),{encoding: 'utf8'},(err,data)=>{
			if (err) {
				serverRecord = {ip:'',savePassword:false,autoLogin:false,username:null,password:null,customDevice:[],download: downloadPath}
				let j = JSON.stringify(serverRecord)
				fs.writeFile(path.join(__dirname,'server'),j,(err,data)=>{

				})
			}else {
				serverRecord = JSON.parse(data)
				serverRecord.download = downloadPath
				let j = JSON.stringify(serverRecord)
				fs.writeFile(path.join(__dirname,'server'),j,(err,data)=>{

				})
			}
			
		})
	})
})


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
function downloadMedia(item,large,item) {
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

// data move api -----------------------------------------

//data move
ipcMain.on('getMoveData', () => {
	c('begin get move data : ')
	getMoveDataApi().then( data => {
		c('get move data success')
		var tempArr = []
		data.forEach(item => {
			if (item.children && item.children.length!=0) {
				tempArr.push(item)
			}
		})
		mainWindow.webContents.send('setMoveData',tempArr)
	}).catch(err => {
		c(err)
		c('get move data error !')
	})
})

function getMoveDataApi() {
		let login = new Promise((resolve,reject)=>{
			request(server+'/winsun',function(err,res,body){
				if (!err && res.statusCode == 200) {
					resolve(eval(body))
				}else {
					c(res.body)
					c(err)
					reject(err)
				}
			})
		})
		return login
}

ipcMain.on('move-data',(err,path) => {
	mainWindow.webContents.send('message','正在移动...')
	moveDataApi(path).then( ()=>{
		mainWindow.webContents.send('message','数据迁移成功')
		getMoveDataApi().then( data => {
			c('get move data success')
			var tempArr = []
			data.forEach(item => {
				if (item.children && item.children.length!=0) {
					tempArr.push(item)
				}
			})
			mainWindow.webContents.send('setMoveData',tempArr)
		}).catch(err => {
			c('get move data error !')
			mainWindow.webContents.send('message','数据迁移失败')
		})		

	}).catch( e=>{
		c('failed')
	})
})

function moveDataApi(path) {
	var a = rootNode.uuid
	var promise = new Promise((resolve,reject) => {
			var options = {
				method : 'post',
				url : server + '/winsun',
				headers : {
					Authorization : user.type + ' ' + user.token,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					src : path,
					dst : rootNode.uuid
				})
			}

			var callback = function(err, res, body) {
				if (!err && res.statusCode == 200) {
					c(res.body)
					resolve()
				}else {
					reject(err)
				}
			}
			request(options, callback)
		})
		return promise
}

// transimission api -------------------------------------

//create folder
ipcMain.on('upLoadFolder',(e,name,dir)=>{
	upload.createFolder(name,dir)
})

//upload file
ipcMain.on('uploadFile',(e,files)=>{
	// uploadQueue.push(files)
	// upload.dealUploadQueue()
	let target = currentDirectory.uuid
	dialog.showOpenDialog({properties: [ 'openFile','multiSelections','createDirectory']},function(data){
		if (!data) {
			return
		}
		let index = 0
		let count = data.length
		let fileArr = []
		let readFileInfor = (abspath) => {
			fs.lstat(abspath,(err, infor) => {
				if (err) {
					
				}else {
					fileArr.push(Object.assign({},infor,{abspath:abspath}))	
				}
				index++
				if(index < count) {
					readFileInfor(data[index])
				}else {
					upload.createUserTask('file',fileArr,target)
				}
			})
		}
		readFileInfor(data[index])
	})
})

//upload folder
ipcMain.on('openInputOfFolder', e => {
	let target = currentDirectory.uuid
	dialog.showOpenDialog({properties: [ 'openDirectory','multiSelections','createDirectory']},function(data){
		if (!data) {
			return
		}
		let index = 0
		let count = data.length
		let folderArr = []
		let readFolderInfor = (abspath) => {
			fs.stat(abspath,(err, infor) => {
				if (err) {
					
				}else {
					folderArr.push(Object.assign({},infor,{abspath:abspath}))	
				}
				index++
				if(index < count) {
					readFolderInfor(data[index])
				}else {
					c(folderArr)
					upload.createUserTask('folder',folderArr,target)
				}
			})
		}
		readFolderInfor(data[index])
	})
	return
	// initialize object
	var uploadObj = {
		status: '准备',
		data: {
			times: 0,
			children: [],
			path: null,
			status: '准备',
			parent: currentDirectory.uuid,
			type: 'folder',
			name: null
		},
		success: 0,
		count: 1,
		failed:0,
		key: '',
		type: 'folder',
		name: ''
	}
	dialog.showOpenDialog({properties: [ 'openDirectory']},function(folder){

		if (folder == undefined)　{
			return
		}
		// initialize object attribute
		let folderPath = path.normalize(folder[0])
		let t = (new Date()).getTime()
		
		uploadObj.name = path.basename(folderPath)
		uploadObj.key = folder+t
		uploadObj.data.path = folderPath 
		uploadObj.data.name = path.basename(folderPath)
		c('')
		c('upload folder path is : ' + folderPath)

		//send transmission task 
		mainWindow.webContents.send('transmissionUpload',uploadObj)


		let showCountOfUpload = setInterval(()=>{
			c('the number of folder ' + path.basename(folderPath) + ' is ' + uploadObj.count)
		},3000)
		// get upload folder tree and upload it 
		traverse(folderPath, uploadObj.data.children, function(err,o){

			clearInterval(showCountOfUpload)

			c('folder : ' + folderPath + ' loop finish ')

			c((new Date))
			
			let st = setInterval(()=>{
				mainWindow.webContents.send('refreshUploadStatusOfFolder',uploadObj.key,uploadObj.success+' / '+uploadObj.count)
				c('folder upload precess : ' + uploadObj.success + '/' + uploadObj.count + ' failed : ' + uploadObj.failed)
			},1000)
 		
			let f = function() {
				if (uploadObj.data.times>5) {
						c('root folder upload failed !')
						o.status = 'failed'
						clearInterval(st)
						mainWindow.webContents.send('refreshUploadStatusOfFolder',uploadObj.key,'上传失败')
					}else {
						uploadNode(uploadObj.data,s,f)
					}
			}
			let s = function() {
				c('folder upload success !')
				clearInterval(st)
				mainWindow.webContents.send('refreshUploadStatusOfFolder',uploadObj.key,'已完成')
				if (uploadObj.data.parent == currentDirectory.uuid) {
					enterChildren({uuid : uploadObj.data.parent})
				}
			}
			uploadNode(uploadObj.data, s, f)
		})
	})
	function traverse(filePath, position, callback ) {

		fs.readdir(filePath, (err, entries) => {
			if (err) {
				callback(err)
			}
			if (entries.length == 0) {
				return callback(null)
			}

			let count = entries.length
			let index = 0

			let childrenCallback = err => {
				if (err) {
					return callback(err)
				}
				index++
				if (index == count) {
					callback(null)
				}else {
					readEntry()
				}
			}

			let readEntry = ()=>{
				fs.stat(path.join(filePath,entries[index]),(err,stat)=>{

					if (err || (!stat.isDirectory() && !stat.isFile())) {
						return callback(err||'error')
					}

					uploadObj.count++
					position.push({times: 0,children: [],path: path.join(filePath,entries[index]),status: '准备',parent: null,type: stat.isFile()?'file':'folder',name: entries[index]})
					if (stat.isFile()) {
						childrenCallback(null)
					}else {
						traverse(path.join(filePath,entries[index]),position[index].children,childrenCallback)
					}
				})
			}
			readEntry()
		})
	}

	function uploadNode(node,callback,failedCallback) {
			c(' ')
			console.log('current file/folder is : ' + node.name)
			if (node.type == 'file') {
				c('is file')
				uploadFileInFolder(node).then(()=>{
					c('create file success : '+ node.name)
					uploadObj.success++
					return callback()

				}).catch((err)=>{
					c(err)
					c('create file failed! : '+ node.name)
					node.times++
					failedCallback(err)
				})
			}else {
				let length = node.children.length
				let index = 0
				c('is folder and has ' + length + ' children')
				createFolder({uuid:node.parent},node.name).then(uuid=>{
					node.uuid = uuid
					c('create folder success : '+ node.name)
					uploadObj.success++
					if (length == 0) {
						callback()
					}else {
						node.children.forEach((item,index)=>{
							node.children[index].parent = uuid
						})
						let s = function(){
							node.children[index].status = 'success'
							index++
							if (index >= length) {
								c('not have next')
								callback()
							}else {
								c('have next')
								uploadNode(node.children[index],s,f)
							}
						}

						let f = function() {
							if (node.children[index].times>5) {
								node.children[index].status = 'failed'
								c(node.children[index].name + 'is absolute failed')
								uploadObj.failed++
								index++
								if (index >= length) {
									callback()
								}else {
									uploadNode(node.children[index],s,f)
								}
							}else {
								uploadNode(node.children[index],s,f)
							}
						}
						uploadNode(node.children[index],s,f)
					}
				}).catch((err)=>{
					c(err)
					c('create folder failed: '+ node.name)
					node.times++
					failedCallback(err)
				})
			}
	}
})

function createFolder(dir,name) {
	let promise = new Promise((resolve,reject)=>{
		// c('folder name is ' + name + ' parent uuid is : ' + dir.uuid )
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
				resolve(JSON.parse(body).uuid)
			}else {
				reject(err)
			}
		})
	})
	return promise
}
function uploadFileInFolder(node) {
	var promise = new Promise((resolve,reject)=>{
		let hash = crypto.createHash('sha256')
		hash.setEncoding('hex')
		let fileStream = fs.createReadStream(node.path)
		fileStream.on('end',() => {
			hash.end()
			let sha = hash.read()

			var tempStream = fs.createReadStream(node.path)

			var options = {
				url:server+'/files/'+node.parent,
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
				if (!err && res.statusCode == 200) {
						resolve(JSON.parse(body).uuid)
				}else {
					reject(err)
				}
			})
			
		})

		fileStream.pipe(hash)
		c('file is hashing')
	})
	return promise
}
//download file
ipcMain.on('downloadFile',(e,files)=>{
	// downloadQueue.push(files)
	// download.dealDownloadQueue()
	c(files)
	download.createUserTask('file',files)
})
//download folder
ipcMain.on('downloadFolder',(err,folder)=>{
	download.createUserTask('folder',folder)
	// c('')
	// c('开始下载文件夹...')
	// folder.forEach(item=>{
	// 	getFolderTree(item,(err, tree) => {
	// 		if (err) {
	// 			c('get tree failed')
	// 			return
	// 		}
	// 		c('文件树组成')
	// 		let count = download.getTreeCount(tree)	
	// 		let time = (new Date()).getTime()
	// 		let obj = {count:count,failed:[],success:0,data:tree,type:'folder',status:'ready',key:item.uuid+time}
	// 		downloadFolderQueue.push(obj)
	// 		mainWindow.webContents.send('transmissionDownload',obj)	
	// 		if (downloadFolderNow.length == 0) {
	// 			downloadFolderNow.push(downloadFolderQueue[0])
	// 			download.downloadFolder(downloadFolderNow[0])
	// 		}
	// 	})
		
	// })
	
})

function getFolderTree(folderObj,call) {
	let tree = {uuid:folderObj.uuid,name:folderObj.name,path:path.join(downloadPath,folderObj.name),children:[]}

	function traverse(folder,callback) {
		fileApi.getFile(folder.uuid).then(result => {
			let files = result
			c()
			c(folder.name + ' has ' + files.length + ' children')
			files.forEach(item => {
				folder.children.push(
						Object.assign({},item, {children : [],path : path.join(folder.path,item.name),times:0})
					)
				c(path.join(folder.path,item.name))
			})
		
			if (files.length == 0) {c('this is empty folder');callback();return}
			let count = files.length
			let index = 0

			let childrenCallback = function (err) {
				if (err) {
					callback(err)
				}
				index++
				c(index + ' / ' + count)
				if (index == count) {
					c(folder.name + ' is end ')
					c('should return prev function')
					callback()
					return
				}else{
					readEntry()	
				}
				
			}
			let readEntry = function () {
				if (folder.children[index].type == 'file') {
					c(folder.children[index].name + ' is file')
					childrenCallback()
				}else {
					c(folder.children[index].name + ' is folder')
					traverse(folder.children[index],childrenCallback)
				}
			}
			readEntry()
		}).catch(e=>{
			c(e)
		})
	}

	traverse(tree, (err) => {
		if (err) {
			call(err)
		}else {
			call(null,tree)
		}
	})
}

//system api-----------------------------------------
ipcMain.on('runVolume',(err,address,target,init,mkfs) => {
	c(address)
	c(target)
	c(init)
	c(mkfs)
	mir(address,target).then(data => {
		
	}).catch(err => {
		
	})
})

ipcMain.on('installVolume', (err,address,target,init,mkfs,time) => {
	c(address)
	c(target)
	c(init)
	c(mkfs)
	c(time)
	mir(address,target,init,mkfs).then(data => {
		mainWindow.webContents.send('mirFinish-'+time,'success')
	}).catch(err => {
		mainWindow.webContents.send('mirFinish-'+time,'failed')
		mainWindow.webContents.send('message',err)
	})
})

function mir(address,target,init,mkfs) {
	console.log(target)
	var promise = new Promise((resolve,reject) => {
		let options = {
			method: 'post',
			url:' http://' + address +':3000/system/mir',
			headers : {
					'Content-Type': 'application/json'
				},
			body: JSON.stringify({
				target:target,
				init,
				mkfs
			})
		}
		let callback = (err,res,body) => {
			if (!err && res.statusCode == 200) {
				c('success : ')
				c(res.body)
				resolve(body)
			}else {
				c('failed : ')
				console.log(res.body)
				reject(res.body)
			}
		}
		request(options,callback)
	})
	return promise
}

ipcMain.on('store',(err,store)=>{
	console.log(store)
	var s = JSON.stringify(store)
	fs.writeFile(path.join(__dirname,'testData'),s,(err)=>{
		if (err) {
			c('save store failed : ' + err )
		}else {
			c('save store success ' )
		}
	})
})


var currentTestCase = null

if (mocha) {
	setTimeout(() => {
		testInit()
	}, 1000)
}

function testInit() {
	fs.readdir('viewtest', (err, entries) => {
		if (err) {
			testWindow.webContents.send('errorMessage','read directory viewtest failed')
			return
		}

		testWindow.webContents.send('viewtest',entries)

		ipcMain.on('selectTestCase', (err,index) => {
			currentTestCase = require(path.join(process.cwd(), 'viewtest', entries[index]))()
			currentTestCase.cases = currentTestCase.cases.map(item => {
				return Object.assign({}, item, {checked : false})
			})
			selectTestCase()
		})

	})
}

function selectTestCase() {
	testWindow.webContents.send('caseList',currentTestCase)
	fs.readFile(path.join(__dirname,'test',currentTestCase.data),{encoding:'utf8'}, (err, data) => {
		if (err) {
			testWindow.webContents.send('errorMessage','read store file failed')
			return	
		}
		mainWindow.webContents.send('stateUpdate', JSON.parse(data))
	})
}


ipcMain.on('dispatch', (err, action) => {
	if (!mocha) {return}
	testWindow.webContents.send('receiveDispatch',action)
	if (action === undefined || currentTestCase == null) return
	let mapCaseIndex = currentTestCase.cases.findIndex((item, index) => {
		return deepEqual(item.expectation, action)
	})
	if (mapCaseIndex != -1) {
		currentTestCase.cases[mapCaseIndex].checked = true
		testWindow.webContents.send('caseList',currentTestCase)
	}
})

//.........
