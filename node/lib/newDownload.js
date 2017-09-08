import Debug from 'debug'
import { getMainWindow } from './window'
import { ipcMain, shell } from 'electron'
import { downloadFile } from './server'

const debug = Debug('node:lib:newDownload: ')

const downloadHandle = (event, args, callback) => {
  const files = args.files
  const folders = args.folders
  files.forEach(item => createTask(item.uuid, item.name, item.size, item.type, args.dirUUID, true, null, null, null, null, args.driveUUID, item.name))
  folders.forEach(item => createTask(item.uuid, item.name, 0, item.type, args.dirUUID ? args.dirUUID : item.uuid, true, null, null, null, null, args.driveUUID, item.name))

  const count = files.length + folders.length
  getMainWindow().webContents.send('snackbarMessage', { message: `${count}个任务添加至下载队列` })
}

const openHandle = (event, args) => {
  const { driveUUID, dirUUID, entryUUID, fileName } = args
  downloadFile(driveUUID, dirUUID, entryUUID, fileName, null, (error, filePath) => {
    if (error) debug('open file error', error)
    else shell.openItem(filePath)
  })
}

const tempDownloadHandle = (e, args) => {
  const { session, driveUUID, dirUUID, entryUUID, fileName } = args
  downloadFile(driveUUID, dirUUID, entryUUID, fileName, null, (error, filePath) => {
    if (error) debug('temp Download error', error)
    else getMainWindow().webContents.send('TEMP_DOWNLOAD_SUCCESS', session, filePath)
  })
}

ipcMain.on('DOWNLOAD', downloadHandle)
ipcMain.on('TEMP_DOWNLOADING', tempDownloadHandle)
ipcMain.on('OPEN_FILE', openHandle) // open file use system applications
