import fs from 'fs'
import path from 'path'
import UUID from 'uuid'
import Debug from 'debug'
import { getMainWindow } from './window'
import { ipcMain, shell } from 'electron'
import { createTask } from './downloadTransform'
import { downloadFile } from './server'

const debug = Debug('node:lib:newDownload: ')

const downloadHandle = (event, args) => {
  const { entries, dirUUID, driveUUID } = args
  const taskUUID = UUID.v4()
  const taskType = entries[0].type
  const createTime = (new Date()).getTime()
  const newWork = true
  // debug('downloadHandle', taskUUID, entries, dirUUID, driveUUID, taskType, createTime, newWork)
  createTask(taskUUID, entries, dirUUID, driveUUID, taskType, createTime, newWork)
  getMainWindow().webContents.send('snackbarMessage', { message: `${entries.length}个项目添加至下载队列` })
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
