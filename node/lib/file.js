import Debug from 'debug'
import { ipcMain } from 'electron'
import request from 'request'

// TODO
import store from '../serve/store/store'
import { addListener } from '../serve/reducers/login'
import registerCommandHandlers from './command'
import action from '../serve/action/action'
import { requestGet, requestGetAsync, serverGetAsync } from './server'

const debug = Debug('lib:file')
const c = debug

addListener(login => {

  if (login === 'LOGGEDIN')
    debug('loggedin message')    
})

var fileApi = {
	//get files can be seen
	getFiles : function() {
		var files = new Promise((resolve,reject)=>{ 
			var options = {
				method: 'GET',
				url: server+'/files',
				headers: {
					Authorization: user.type+' '+user.token
				}

			}
			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					resolve(JSON.parse(body))
				}else {
					reject(err)
				}
			}
			request(options,callback)
		})
		return files
	},

	removeFolder : function(data) {
		try{
			let uuid = null
			let fruitmixIndex = data.findIndex((item,index)=>{
				return item.parent == ''
			})
			if (fruitmixIndex == -1) {
				throw 'can not find fruitmix'
				return 
			}else {
				rootNode = data[fruitmixIndex] 
			}

			let fruitmixuuid = data[fruitmixIndex].uuid
			data.splice(fruitmixIndex,1)
			//data/fruitmix is removed
			let driveIndex = data.findIndex((item)=>{
				return item.parent == fruitmixuuid
			})
			if (driveIndex == -1) {
				throw 'can not find drive'
				return
			}else {
				rootNode = data[driveIndex] 	
			}

			let driveuuid= data[driveIndex].uuid
			data.splice(driveIndex,1)
			let uuidindex = data.findIndex((item)=>{
				return item.parent == driveuuid
			})
			if (uuidindex == -1) {
				throw 'can not find uuid folder'
				return
			}else {
				data[uuidindex].parent = ''
				data[uuidindex].attribute.name = 'my cloud'
				rootNode = data[uuidindex] 	
			}
			c('remove folder and length is : ' + data.length )
		}catch(e){
			c('remove folder failed !')
			c(e)
		}
	},
	//get files shared to me
	classifyShareFiles : function(allFiles) {
		try{
			let userUUID = user.uuid
			allFiles.forEach((item,index)=>{
				// owner is user ?
				if (item.permission.owner[0] != userUUID ) {
					// is not user
					let result = item.permission.readlist.find((readUser)=>{
						return readUser == userUUID
					})
					if (result != undefined) {
						//file is shared to user
						item.share = true
						shareFiles.push(item)
					}else {
						//is file included in shareFolder?
						var findParent = function(i) {
							if (i.parent == '') {
								//file belong to user but is not upload by client
								return
							}
							let re = allFiles.find((p)=>{
								return i.parent == p.uuid
							})
							if (re.parent == '') {
								return
							}
							let rer = re.permission.readlist.find((parentReadItem,index)=>{
								return parentReadItem == userUUID
							})
							if (rer == undefined) {
								//find parent again
								findParent(re)
							}else {
								item.share = true
								shareFiles.push(item)
							}
						}
						findParent((item))
					}
				}
			})
		}catch(err){
			c(err)
		}
		c('screen out share and length is : ' + shareFiles.length )
	},
	//generate tree
	getTree : function(f,type) {
		let fileMap = new Map()
		f.forEach(item => {
			fileMap.set(item.uuid, item)
		})
		if (type == 'share') {
			f.forEach(item => {
				let r = fileMap.get(item.parent)
				if (r == undefined ) { item.hasParent = false}
				
			})
		}
		
		f.forEach(item => {
			if (item.type == 'file' || item.children.length == 0) {
				return
			}
			item.children.map((folderChildren,index) => {
				item.children[index] = fileMap.get(folderChildren)
			})

		})

		if (type == 'share') {
			shareMap = fileMap
		}else {
			map = fileMap
		}

		return f
	},
	
	//---------------------------------------
	getDrive : function() {
		var drive = new Promise((resolve,reject) => {
				var options = {
					method: 'GET',
					url: server+'/drives',
					headers: {
						Authorization: user.type+' '+user.token
					}

				}
				function callback (err,res,body) {
					if (!err && res.statusCode == 200) {
						resolve(JSON.parse(body))
					}else {
						reject(err)
					}
				}
				request(options,callback)
		})
		return drive
	},

	getFile : function(uuid) {
		var file = new Promise((resolve,reject) => {
			var options = {
				method: 'GET',
				url: server+'/files/'+uuid,
				headers: {
					Authorization: user.type+' '+user.token
				}

			}
			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					resolve(JSON.parse(body))
				}else {
					reject(err)
				}
			}
			request(options,callback)
		})
		return file	
	},

	getFilesSharedWithMe : function() {
		var promise = new Promise((resolve,reject) => {
			var options = {
				method: 'GET',
				url: server+'/share/sharedWithMe',
				headers: {
					Authorization: user.type+' '+user.token
				}

			}
			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					resolve(JSON.parse(body))
				}else {
					reject(err)
				}
			}
			request(options,callback)
		})
		return promise	
	},

	getFilesSharedWithOthers : function() {
		var promise = new Promise((resolve,reject) => {
			var options = {
				method: 'GET',
				url: server+'/share/sharedWithOthers',
				headers: {
					Authorization: user.type+' '+user.token
				}

			}
			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					resolve(JSON.parse(body))
				}else {
					reject(err)
				}
			}
			request(options,callback)
		})
		return promise	
	},

	deleteFile : function(objUUID,dirUUID) {
		let promise = new Promise((resolve,reject)=>{
			var options = {
				method: 'delete',
				url: server+'/files/' + dirUUID + '/' + objUUID,
				headers: {
					Authorization: user.type+' '+user.token
				}

			}

			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					console.log('success')
					resolve()
				}else {
					console.log('failed')
					reject()
				}
			}

			request(options,callback)

		})
		return promise
	},

	rename : function(uuid,name) {
		var promise = new Promise((resolve, reject) => {
			var options = {
				method: 'delete',
				url: server+'/files/' + dirUUID + '/' + objUUID,
				headers: {
					Authorization: user.type+' '+user.token
				}

			}

			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					console.log('success')
					resolve()
				}else {
					console.log('failed')
					reject()
				}
			}

			request(options,callback)
		})
		return promise
	},

	share : function(uuid,users,shareCallback) {
		var options = {
				method : 'patch',
				url : server + '/files/' + currentDirectory.uuid +'/' + uuid,
				headers : {
					Authorization : user.type + ' ' + user.token,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ writelist: users, readlist: users })
			}

			var callback = function(err, res, body) {
				if (!err && res.statusCode == 200) {
					c('share success')
					shareCallback(null,JSON.parse(res.body))
				}else {
					c('share failed')
					shareCallback('err',null)
				}
			}
		request(options, callback)
	},

	rename : function(uuid,name,oldName) {
		let rename = new Promise((resolve,reject)=>{
			var options = {
				method: 'patch',
				url: server+'/files/'+ currentDirectory.uuid + '/' + uuid,
				headers: {
						Authorization: user.type+' '+user.token
					},
				form: {name:name}
			}

			function callback (err,res,body) {
				console.log(res)
					if (!err && res.statusCode == 200) {
						console.log('res')
					}else {
						console.log('err')
						console.log(err)
						reject(err)
					}
				}

			request(options,callback)
		})
		return rename
	}
}

module.exports = fileApi

//
let context = null
let drives = []
let tree = null
let rootNode = null
let map = new Map()

const resetData = () => {
  context = null
  drives = []
  tree = null
  rootNode = null
  map = new Map()
}

//directory 
let currentDirectory = {}
let children = []
let parent = {}
let dirPath = []


//share
global.shareRoot = []
global.shareChildren = []
global.sharePath = []

//upload 
global.uploadNow = []
global.uploadHandleArr = []
global.uploadQueue = []

//download
global.downloadQueue = []
global.downloadNow = []
global.downloadFolderQueue = []
global.downloadFolderNow = []

const getDrivesAsync = async() => await serverGetAsync(`drives`)
const listFolderAsync = async (uuid) => await serverGetAsync(`files/${uuid}`)

// pure
const fileNodePath = (node) => {

  let arr = []
  if (!node.parent || node.parent === '') {
    arr.unshift({
      key: '',
      value: {}
    }) 
    return arr
  }

  for (let n = map.get(node.uuid); 
    (n !== null && n !== undefined && n !== ''); 
    n = n.parent) {
    arr.unshift({
      key: n.name,
      value: Object.assign({}, n, { children: undefined })
    })
  } 
  return arr 
}

const updateLocalTree = (folder, children) => {

  // tree visitor
  const visit = (node, func) => {
    if (node.children && node.children.length)
      node.children.forEach(child => visit(child, func))
    func(node) 
  }

  // remove map index for all children subtree
  folder.children.forEach(child => 
    visit(child, node => map.delete(node.uuid)))

  // clear children
  folder.children = []

  // add new children and map index
  children.forEach((item, index) => {
    let x = Object.assign({}, item, {
      parent: folder.uuid,
      children: []
    })
    folder.children.push(x)
    map.set(item.uuid, x)
  })
}

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

  return { directory, children, path }
}

const fileNavHandler = ({context, target}, callback) => 
  fileNavAsync(context, target).asCallback((err, data) => 
      err ? callback(err) : callback(null, data))

const fileCommandMap = new Map([
  ['FILE_NAV', fileNavHandler],
])

console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.')
registerCommandHandlers(fileCommandMap)

//get all files -------------------------------------------------
ipcMain.on('getRootData', ()=> {

  debug('getRootData') 
  return

	// dispatch(action.loadingFile())

	// drives = []
	// rootNode = null
	// tree = []
	// map = new Map()
  resetData()

	c(' ')
	c('achieve data ===> ')

  // get drive list
	fileApi.getDrive().then((drivesArr) => {

		drives = drivesArr // save drive list

    // user uuid
		let uuid = store.getState().login.obj.uuid

		// let driveUUid = store.getState().login.obj.allUser.find(item=>item.uuid == uuid).home
    // find home drive
    let driveUUid = store.getState().node.server.users.find(item => item.uuid === uuid).home

		let drive = drives.find(item => {
			if (item.uuid == driveUUid) {return true}
		})

		if (drive == undefined) {
			throw new Error('can not find root node')
		}

    // tree
		tree = Object.assign({}, drive, { children:[] })

    // index
		map.set(tree.uuid, tree)

    // 
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

  // get target node
	let folder = map.get(selectItem.uuid)

  // list node, http get
	fileApi.getFile(selectItem.uuid).then(file => {
    
		folder.children = []

		file.forEach((item, index) => {
      let x = Object.assign({}, item, {
        parent:selectItem.uuid,
        children:[]
      })
      folder.children.push(x)
			map.set(item.uuid, x)
		})

    // {currentDirectory, children, path}

    // mapped object
		currentDirectory = Object.assign({}, selectItem, {
      children:null
    })

    // mapped objects
		children = file.map(item=>
      Object.assign({}, item, {
        children:null,
        checked:false
      }))

		dirPath.length = 0
		getPath(folder)

		dispatch(action.setDir(currentDirectory, children, dirPath))

	}).catch(err => {
		c(err)
	})
}

// input file node
// return array 
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
				 // delete obj
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
			return
		}else {
			fileApi.share(files[index],users,doShare)
		}
	}

	fileApi.share(files[index],users,doShare)
})

const shareFilesHandler = ({files, users}, callback) => 
  Promise.map(files, file => {
    let opt = {
      // 
    }
    return Promise.promisify(request)(opts).reflect()
  }).asCallback((err, arr) => callback(err))

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

function getFolderTree(folderObj,call) {

	let tree = {
    uuid: folderObj.uuid,
    name: folderObj.name,
    path: path.join(downloadPath,folderObj.name),
    children:[]
  }

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

export { resetData }



















