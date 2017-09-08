import os from 'os'
import Debug from 'debug'
import child from 'child_process'
import { ipcMain, powerSaveBlocker } from 'electron'

import { getMainWindow } from './window'
import store from '../serve/store/store'

const debug = Debug('node:lib:transmissionUpdate:')

const Tasks = []

/* send message */
let preLength = 0
let lock = false
let last = true
let id = -1 // The power save blocker id returned by powerSaveBlocker.start

const sendMsg = () => {
  if (lock || !last) return (last = true)
  lock = true
  const userTasks = []
  const finishTasks = []
  Tasks.forEach((t) => {
    const task = t.status()
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

const actionHandler = (e, uuids, type) => {
  if (!Tasks.length || !uuids || !uuids.length) return

  let func
  switch (type) {
    case 'DELETE_FINISHED':
      func = task => Tasks.splice(Tasks.indexOf(task), 1)
      break
    case 'DELETE_RUNNING':
      func = (task) => { task.pause(); Tasks.splice(Tasks.indexOf(task), 1) }
      break
    case 'PAUSE':
      func = task => task.pause()
      break
    case 'RESUME':
      func = task => task.resume()
      break
    default:
      func = () => debug('error in actionHandler: no such action')
  }

  uuids.forEach((u) => {
    const task = Tasks.find(t => t.uuid === u)
    if (task) func(task)
  })
  debug(type, uuids)
  sendMsg()
}

/* ipc listeners */
ipcMain.on('GET_TRANSMISSION', sendMsg)

ipcMain.on('OPEN_TRANSMISSION', (e, tasks) => { // FIXME
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
})

ipcMain.on('PAUSE_UPLOADING', (e, uuids) => actionHandler(e, uuids, 'PAUSE'))
ipcMain.on('RESUME_UPLOADING', (e, uuids) => actionHandler(e, uuids, 'RESUME'))
ipcMain.on('DELETE_UPLOADING', (e, uuids) => actionHandler(e, uuids, 'DELETE_RUNNING'))
ipcMain.on('DELETE_UPLOADED', (e, uuids) => actionHandler(e, uuids, 'DELETE_FINISHED'))

ipcMain.on('PAUSE_DOWNLOADING', (e, uuids) => actionHandler(e, uuids, 'PAUSE'))
ipcMain.on('RESUME_DOWNLOADING', (e, uuids) => actionHandler(e, uuids, 'RESUME'))
ipcMain.on('DELETE_DOWNLOADING', (e, uuids) => actionHandler(e, uuids, 'DELETE_RUNNING'))
ipcMain.on('DELETE_DOWNLOADED', (e, uuids) => actionHandler(e, uuids, 'DELETE_FINISHED'))

ipcMain.on('CLEAN_RECORD', () => { // TODO
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
})

ipcMain.on('LOGIN_OUT', () => {
  debug('LOGIN_OUT')
  Tasks.forEach(task => task.state !== 'finished' && task.pause())
  sendMsg()
})

const startTransmissionHandle = () => {
  return
  db.uploaded.find({}).sort({ finishDate: -1 }).exec((err, docs) => {
    if (err) return console.log(err)
    docs.forEach(item => item.uuid = item._id)
    finishTasks.splice(0, 0, ...docs)
    sendMsg()
  })

  db.uploading.find({}, (err, tasks) => {
    if (err) return
    tasks.forEach((item) => {
      createTask(item._id, item.abspath, item.target, item.driveUUID, item.type, item.createTime, false, item.uploading, item.rootNodeUUID)
    })
  })
}

// ipcMain.on('START_TRANSMISSION', startTransmissionHandle)

export { Tasks, sendMsg }
