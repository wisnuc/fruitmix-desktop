import Debug from 'debug'
import { ipcMain } from 'electron'
import request from 'request'
import sanitize from 'sanitize-filename'

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
    // else {
    //   throw(new Error(`error folder/root uuid: ${folderUUID}/${rootUUID}`))
    // }
    break

  case 'SHARED_WITH_ME':
    if (!folderUUID && !rootUUID) {
      return {
        children: await fileGetSharedWithMe(),
        path:[]
      }
    }
    else if (!folderUUID) { // only rootUUID means list this share root
      folderUUID = rootUUID
    }
    break

  case 'SHARED_WITH_OTHERS':
    if (!folderUUID && !rootUUID) {
      return {
        children: await fileGetSharedWithOthers(),
        path:[]
      }
    }
    else if (!folderUUID) {
      folderUUID = rootUUID
    }else if (!rootUUID) {
    	rootUUID = store.getState().login.obj.home
    }
    break

  default:
    throw new Error('invalid nav context')
  }

  return await serverGetAsync(`files/${folderUUID}`, { navroot: rootUUID })
}

const fileRenameAsync = async({dir, node, name}) => {
  
  debug('fileRenameAsync', dir, node, name)

  return await serverPatchAsync(`files/${dir}/${node}`, { name : sanitize(name) })
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

const fileShareAsync = async ({fileUUID, users, directoryUUID}) => {

	debug('fileShare', fileUUID, users)

	return await serverPatchAsync(`files/${directoryUUID}/${fileUUID}`,{writelist: users, readlist: users})
}

const fileCommandMap = new Map([
  ['FILE_NAV', asCallback(fileNavAsync)],
  ['FILE_DELETE', asCallback(fileDeleteAsync)],
  ['FILE_RENAME', asCallback(fileRenameAsync)],
  ['FILE_CREATE_NEW_FOLDER', asCallback(fileCreateNewFolderAsync)],
  ['FILE_SHARE',asCallback(fileShareAsync)]
])

registerCommandHandlers(fileCommandMap)

export { resetData }

















