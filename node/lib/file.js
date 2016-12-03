import Debug from 'debug'
import { ipcMain } from 'electron'
import request from 'request'

// TODO
import store from '../serve/store/store'
import { addListener } from '../serve/reducers/login'
import registerCommandHandlers from './command'
import action from '../serve/action/action'
import { serverGetAsync, serverPostAsync, serverPatchAsync, serverDeleteAsync } from './server'

const debug = Debug('lib:file')
const c = debug

const asCallback = (afunc) => 
  (args, callback) => 
    afunc(args).asCallback((err, data) => 
      err ? callback(err) : callback(null, data))

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
///////////////////////////////////////////////////////////////////////////////

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


const getDrivesAsync = async() => await serverGetAsync(`drives`)

const listFolderAsync = async (folderUUID, rootUUID) => 
  await serverGetAsync(`files/${folderUUID}`, { rootUUID })

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
      key: n.name ? n.name : '',
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

const fileGetSharedWithMe = async () => 
  await serverGetAsync(`share/sharedWithMe`)

const fileGetSharedWithOthers = async () => 
  await serverGetAsync(`share/sharedWithOthers`) 

const fileNavAsync = async ({ context, folderUUID, rootUUID }) => {

  debug('fileNavAsync', context, folderUUID, rootUUID)

  switch (context) {
  case 'HOME_DRIVE':
    if (!folderUUID && !rootUUID) {
      folderUUID = rootUUID = store.getState().login.obj.home 
    }
    else if (!rootUUID) {
      rootUUID = store.getState().login.obj.home
    }
    else {
      throw(new Error(`error folder/root uuid: ${folderUUID}/${rootUUID}`))
    }
    break

  case 'SHARED_WITH_ME':

    if (!folderUUID && !rootUUID) {
      return {
        children: await fileGetSharedWithMe()
      }
    }
    else if (!folderUUID) { // only rootUUID means list this share root
      folderUUID = rootUUID
    }
    break

  case 'SHARED_WITH_OTHERS':
    if (!folderUUID && !rootUUID) {
      return {
        children: await fileGetSharedWithOthers()
      }
    }
    else if (!folderUUID) {
      folderUUID = rootUUID
    }
    break

  default:
    throw new Error('invalid nav context')
  }

  return await serverGetAsync(`files/${folderUUID}`, { navroot: rootUUID })
}

const fileRenameAsync = async({dir, node, name}) => {
  
  debug('fileRenameAsync', dir, node, name)

  return await serverPatchAsync(`files/${dir}/${node}`, { name })
}

const fileDeleteAsync = async ({dir, nodes}) => {

  debug('fileDeleteAsync', dir, nodes)

  return await Promise.map(nodes, node => 
    serverDeleteAsync(`files/${dir}/${node}`).reflect())
}

const fileCreateNewFolderAsync = async ({dir, name}) => {

  debug('fileCreateNewFolderAsync', dir, name)

  return await serverPostAsync(`files/${dir}`, { name })
}

const fileCommandMap = new Map([
  ['FILE_NAV', asCallback(fileNavAsync)],
  ['FILE_DELETE', asCallback(fileDeleteAsync)],
  ['FILE_RENAME', asCallback(fileRenameAsync)],
  ['FILE_CREATE_NEW_FOLDER', asCallback(fileCreateNewFolderAsync)]
])

registerCommandHandlers(fileCommandMap)

export { resetData }

















