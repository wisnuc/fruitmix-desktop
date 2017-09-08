import fs from 'fs'
import path from 'path'
import UUID from 'uuid'
import Debug from 'debug'
import { dialog, ipcMain } from 'electron'
import { getMainWindow } from './window'
import { createTask } from './uploadTransform'
import { serverGetAsync } from './server'

Promise.promisifyAll(fs) // babel would transform Promise to bluebird

const debug = Debug('node:lib:newUpload: ')

const readUploadInfoAsync = async (entries, dirUUID, driveUUID) => {
  const listNav = await serverGetAsync(`drives/${driveUUID}/dirs/${dirUUID}`)
  const remoteEntries = listNav.entries
  let overWrite = false
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const fileName = entry.replace(/^.*\//, '')
    const index = remoteEntries.findIndex(e => (e.name === fileName))
    if (index > -1) {
      debug('find name conflict', entry)
      const response = dialog.showMessageBox(getMainWindow(), {
        type: 'warning',
        title: '文件名冲突',
        buttons: ['取消', '单独保存'], // ['取消', '单独保存', '覆盖']
        message: `上传内容中${fileName}等文件与此文件夹中的现有文件存在命名冲突。\n是否覆盖已有文件？`
      })
      if (!response) throw new Error('cancel')
      if (response === 2) overWrite = true
      break
    }
  }

  debug('check name, overWrite ?', overWrite)
  let taskType = ''
  const filtered = []
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const entryStat = await fs.lstatAsync(path.resolve(entry))
    const entryType = entryStat.isDirectory() ? 'folder' : entryStat.isFile() ? 'file' : 'others'
    /* only upload folder or file, ignore others, such as symbolic link */
    if (entryType !== 'others') {
      if (!taskType) taskType = entryType
      filtered.push(entry)
    }
  }

  debug('entries', entries)
  debug('filtered', filtered)
  const taskUUID = UUID.v4()
  const createTime = (new Date()).getTime()
  const newWork = true
  const uploadingList = []
  const rootNodeUUID = null
  if (filtered.length) {
    createTask(taskUUID, filtered, dirUUID, driveUUID, taskType, createTime, newWork)
  }
  return filtered.length
}

const readUploadInfo = (entries, dirUUID, driveUUID) => {
  readUploadInfoAsync(entries, dirUUID, driveUUID)
    .then((count) => {
      let message = `${count}个项目添加至上传队列`
      if (count < entries.length) message = `${message} (忽略了${entries.length - count}个不支持的文件)`
      getMainWindow().webContents.send('snackbarMessage', { message })
    })
    .catch((e) => {
      debug('readUploadInfo error: ', e)
      if (e.code === 'ECONNREFUSED') {
        getMainWindow().webContents.send('snackbarMessage', { message: '与设备的连接已断开' })
      } else if (e.message !== 'cancel') {
        getMainWindow().webContents.send('snackbarMessage', { message: '读取上传文件失败' })
      }
    })
}

/* handler */
const uploadHandle = (event, args) => {
  const { driveUUID, dirUUID, type, filters } = args
  const dialogType = type === 'folder' ? 'openDirectory' : 'openFile'
  dialog.showOpenDialog(getMainWindow(), { properties: [dialogType, 'multiSelections'], filters }, (entries) => {
    if (!entries || !entries.length) return
    readUploadInfo(entries, dirUUID, driveUUID)
  })
}

const dragFileHandle = (event, args) => {
  let entries = args.files
  if (!entries || !entries.length) return
  entries = entries.map(entry => path.normalize(entry))
  readUploadInfo(entries, args.dirUUID, args.driveUUID)
}

const uploadMediaHandle = (event, args) => {
  const { driveUUID, dirUUID } = args
  uploadHandle(event, {
    dirUUID,
    driveUUID,
    type: 'file',
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
      { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] }
    ]
  })
}

/* ipc listener */
ipcMain.on('UPLOAD', uploadHandle)
ipcMain.on('UPLOADMEDIA', uploadMediaHandle)
ipcMain.on('DRAG_FILE', dragFileHandle)
