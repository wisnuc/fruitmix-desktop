import os from 'os'
import Debug from 'debug'
import { ipcMain, powerSaveBlocker } from 'electron'
import child from 'child_process'

import { getMainWindow } from './window'
import TransferManager from './transferManager'
import store from '../serve/store/store'

const debug = Debug('node:lib:transmissionUpdate:')

/* send message */
let preLength = 0
let lock = false
let last = true
let id = -1 // The power save blocker id returned by powerSaveBlocker.start

const Tasks = []
const sendMsg = () => {
  if (lock || !last) return (last = true)
  lock = true
  const userTasks = []
  const finishTasks = []
  Tasks.forEach((task) => {
    if (task.state === 'finished') {
      finishTasks.push(task)
    } else {
      userTasks.push(task)
    }
  })
  userTasks.sort((a, b) => a.createTime - b.createTime) // Ascending
  finishTasks.sort((a, b) => b.finishDate - a.finishDate) // Descending

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

  /* Error: Object has been destroyed */
  try {
    getMainWindow().webContents.send('UPDATE_TRANSMISSION', [...userTasks], [...finishTasks])
  } catch (error) {
    console.error(error)
  }
  setTimeout(() => { lock = false; sendMsg() }, 200)
  return (last = false)
}

// handle will open dialog from electron to clean record of the task have been downloaded
const cleanRecordHandle = () => {
  debug('Tasks before', Tasks.length)
  for (let i = Tasks.length - 1; i > -1; i--) {
    if (Tasks[i].state === 'finished') Tasks.splice(i, 1)
  }
  sendMsg()
  debug('Tasks after', Tasks.length)
  return
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
        child.exec(`explorer ${taskPath}`, {})
        break
      case 'linux':
        child.exec(`nautilus ${taskPath}`, {})
        break
      case 'darwin':
        child.exec(`open ${taskPath}`, {})
        break
      default :
    }
  })
}

const transferHandle = (event, args) => {
  TransferManager.addTask(args)
}

ipcMain.on('GET_TRANSMISSION', sendMsg)
ipcMain.on('OPEN_TRANSMISSION', openHandle)
ipcMain.on('CLEAN_RECORD', cleanRecordHandle)
ipcMain.on('TRANSFER', transferHandle)

export { Tasks, sendMsg }
export default sendMsg
