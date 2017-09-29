import fs from 'fs'
import path from 'path'
import UUID from 'uuid'
import Debug from 'debug'
import store from './store'
import { getMainWindow } from './window'
import { ipcMain, shell } from 'electron'
import { downloadFile } from './server'
import { createTask } from './downloadTransform'

const debug = Debug('node:lib:newDownload: ')

const getDownloadPath = () => store.getState().config.downloadPath

const downloadHandle = (event, args) => {
  const { entries, dirUUID, driveUUID } = args
  const taskUUID = UUID.v4()
  const taskType = entries[0].type
  const createTime = (new Date()).getTime()
  const newWork = true
  // debug('downloadHandle', taskUUID, entries, dirUUID, driveUUID, taskType, createTime, newWork)

  const downloadPath = getDownloadPath()
  fs.readdir(downloadPath, (err, files) => {
    if (err) {
      debug('downloadHandle fs.readdir error: ', err)
      getMainWindow().webContents.send('snackbarMessage', { message: '读取下载目录失败' })
    } else {
      entries.forEach((entry) => {
        const name = entry.name
        let newName = name
        if (files.includes(name)) {
          const nameSpace = entries.map(e => e.name)
          nameSpace.push(...files)
          const extension = path.parse(name).ext
          for (let i = 1; nameSpace.includes(newName) || nameSpace.includes(`${newName}.download`); i++) {
            if (!extension || extension === name) {
              newName = `${name}(${i})`
            } else {
              newName = `${path.parse(name).name}(${j}).${extension}`
            }
          }
        }
        entry.newName = newName
      })
      createTask(taskUUID, entries, entries[0].newName, dirUUID, driveUUID, taskType, createTime, newWork, downloadPath)
      getMainWindow().webContents.send('snackbarMessage', { message: `${entries.length}个项目添加至下载队列` })
    }
  })
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

const startTransmissionHandle = () => {
  global.db.task.find({}, (error, tasks) => {
    if (error) return debug('load nedb store error', error)
    /* add t to load pre status */
    tasks.forEach(t => t.state !== 'finished' && t.trsType === 'download' &&
      createTask(t.uuid, t.entries, t.name, t.dirUUID, t.driveUUID, t.taskType, t.createTime, false, t.downloadPath, t)
    )
  })
}

ipcMain.on('DOWNLOAD', downloadHandle)
ipcMain.on('TEMP_DOWNLOADING', tempDownloadHandle)
ipcMain.on('OPEN_FILE', openHandle) // open file use system applications
ipcMain.on('START_TRANSMISSION', startTransmissionHandle)
