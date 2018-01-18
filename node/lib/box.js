import fs from 'original-fs'
import i18n from 'i18n'
import path from 'path'
import UUID from 'uuid'
import sanitize from 'sanitize-filename'
import { dialog, ipcMain } from 'electron'
import { getMainWindow } from './window'
import { serverGetAsync, isCloud } from './server'
import { createTask } from './uploadTransform'

Promise.promisifyAll(fs) // babel would transform Promise to bluebird

const readUploadInfoAsync = async (entries, dirUUID, driveUUID) => {
  /* remove unsupport files */
  let taskType = ''
  const filtered = []
  const nameSpace = []
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const name = path.parse(entry).base
    nameSpace.push(name)
    const stat = await fs.lstatAsync(path.resolve(entry))
    const entryType = stat.isDirectory() ? 'directory' : stat.isFile() ? 'file' : 'others'
    /* only upload directory or file, ignore others, such as symbolic link */
    if (entryType !== 'others' && !(isCloud() && stat.size > 1073741824) && !(entryType === 'file' && name === '.DS_Store') && (name === sanitize(name))) {
      if (!taskType) taskType = entryType
      filtered.push({ entry, name, stat, entryType })
    }
  }

  const listNav = await serverGetAsync(`drives/${driveUUID}/dirs/${dirUUID}`)
  let remoteEntries = listNav.entries
  if (isCloud()) remoteEntries = listNav.data.entries
  nameSpace.push(...remoteEntries.map(e => e.name))
  const conflicts = []
  for (let i = 0; i < filtered.length; i++) {
    const { entry, entryType, name, stat } = filtered[i]
    const index = remoteEntries.findIndex(e => (e.name === name))
    if (index > -1) {
      let checkedName = name
      const extension = path.parse(name).ext
      for (let j = 1; nameSpace.includes(checkedName); j++) {
        if (!extension || extension === name) {
          checkedName = `${name}(${j})`
        } else {
          checkedName = `${path.parse(name).name}(${j})${extension}`
        }
      }
      // console.log('conflicts find', name)
      conflicts.push({ entry, entryType, name, checkedName, stat, remote: remoteEntries[index] })
    }
  }

  /*  sort conflicts by order of following:
   *
   *  directory => directory: 1
   *  directory => file: 2
   *  file => directory: 3
   *  file => file: 4
   *
   */
  const typeCheck = (c) => {
    if (c.entryType === 'directory' && c.remote.type === 'directory') return 1
    if (c.entryType === 'directory' && c.remote.type === 'file') return 2
    if (c.entryType === 'file' && c.remote.type === 'directory') return 3
    if (c.entryType === 'file' && c.remote.type === 'file') return 4
    return 5 // error ?
  }
  conflicts.forEach(c => (c.type = typeCheck(c)))
  conflicts.sort((a, b) => (a.type - b.type))

  // conflicts.length = 0

  /* wait user to choose policy
   *
   * cancel: cancel all uploading
   * skip: skip specific entry
   * rename: need a checkedName
   * replace: need remote target's uuid
   * merge: using mkdirp when create directory
   *
   */
  if (conflicts.length) {
    const response = await choosePolicy(conflicts)
    conflicts.forEach((c, i) => {
      const res = response[i]
      const index = filtered.findIndex(f => (f.entry === c.entry))
      if (res === 'skip') {
        filtered.splice(index, 1)
      } else {
        filtered[index].policy = res
        filtered[index].remoteUUID = c.remote.uuid
        filtered[index].checkedName = c.checkedName
      }
    })
  }

  /* createTask */
  if (filtered.length) {
    const policies = []
    const newEntries = filtered.map((f, i) => {
      const mode = f.policy ? f.policy : 'normal'
      const checkedName = mode === 'rename' ? f.checkedName : undefined
      policies[i] = { mode, checkedName, remoteUUID: f.remoteUUID }
      return f.entry
    })
    const taskUUID = UUID.v4()
    const createTime = (new Date()).getTime()
    const newWork = true
    createTask(taskUUID, newEntries, dirUUID, driveUUID, taskType, createTime, newWork, policies)
  }
  return filtered.length
}

/* handler */
const uploadHandle = (event, args) => {
  const { boxUUID, bToken, type, comment } = args
  const dialogType = type === 'directory' ? 'openDirectory' : 'openFile'
  dialog.showOpenDialog(getMainWindow(), { properties: [dialogType, 'multiSelections'], filters }, (entries) => {
    if (!entries || !entries.length) return
    readUploadInfo(entries, dirUUID, driveUUID)
  })
}

/* ipc listener */
ipcMain.on('BOX_UPLOAD', uploadHandle)
