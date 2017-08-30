import os from 'os'
import Debug from 'debug'
import { ipcMain, powerSaveBlocker } from 'electron'

import { getMainWindow } from './window'
import { userTasks as uploadingTasks, finishTasks as uploadedTasks } from './newUpload'
import { userTasks as downloadingTasks, finishTasks as downloadedTasks } from './newDownload'
import TransferManager from './transferManager'
import store from '../serve/store/store'

const debug = Debug('node:lib:transmissionUpdate:')

let preLength = 0
let lock = false
let last = true
let id = -1 // The power save blocker id returned by powerSaveBlocker.start

const sendInfor = () => {
  if (lock || !last) return (last = true)
  lock = true
  const concatUserTasks = [].concat(uploadingTasks, downloadingTasks)
  const concatFinishTasks = [].concat(uploadedTasks, downloadedTasks)
  const userTasks = concatUserTasks.sort((a, b) => a.createTime - b.createTime) // Ascending
  const finishTasks = concatFinishTasks.sort((a, b) => b.finishDate - a.finishDate) // Descending

  if (!powerSaveBlocker.isStarted(id) && userTasks.length !== 0 && !store.getState().config.enableSleep) {
    id = powerSaveBlocker.start('prevent-display-sleep')
    console.log('powerSaveBlocker start', id, powerSaveBlocker.isStarted(id))
  }

  /* send message when all tasks finished */
  if (preLength !== 0 && userTasks.length === 0) {
    if (powerSaveBlocker.isStarted(id)) {
      powerSaveBlocker.stop(id)
      console.log('powerSaveBlocker stop', id, powerSaveBlocker.isStarted(id))
    }
    getMainWindow().webContents.send('snackbarMessage', { message: '文件传输任务完成' })
  }

  preLength = userTasks.length
  try {
    getMainWindow().webContents.send(
      'UPDATE_TRANSMISSION',
      userTasks.map(item => item.getSummary()),
      finishTasks.map(i => (i.getSummary ? i.getSummary() : i))
    )
  } catch (error) {
    /* Error: Object has been destroyed */
    if (error) {
      console.error(error)
    }
  }
  setTimeout(() => { lock = false; sendInfor() }, 200)
  // debug('sendInfor end')
  return (last = false)
}

// handle will open dialog from electron to clean record of the task have been downloaded
const cleanRecordHandle = () => {
  if (uploadedTasks.length === 0 && downloadedTasks.length === 0) return

  global.db.uploaded.remove({}, { multi: true }, (err) => {
    if (err) return debug(err)
    uploadedTasks.length = 0

    global.db.downloaded.remove({}, { multi: true }, (err) => {
      if (err) return debug(err)
      downloadedTasks.length = 0
      sendInfor()
    })
  })
}

const openHandle = (e, tasks) => {
  const osType = os.platform()
  tasks.forEach((task) => {
    const pathProperty = task.trsType === 'download' ? 'downloadPath' : 'abspath'
    const taskPath = task.trsType === 'download' ?
      task[pathProperty] : task[pathProperty].substring(0, task[pathProperty].lastIndexOf('\\'))
    debug('打开目录的文件资源管理器', taskPath) // FIXME
    switch (osType) {
      case 'win32':
        child_process.exec(`explorer ${taskPath}`, {})
        break
      case 'linux':
        child_process.exec(`nautilus ${taskPath}`, {})
        break
      case 'darwin':
        child_process.exec(`open ${taskPath}`, {})
        break
      default :
    }
  })
}

const transferHandle = (event, args) => {
  TransferManager.addTask(args)
}

ipcMain.on('OPEN_TRANSMISSION', openHandle)
ipcMain.on('CLEAN_RECORD', cleanRecordHandle)
ipcMain.on('TRANSFER', transferHandle)

export default sendInfor
