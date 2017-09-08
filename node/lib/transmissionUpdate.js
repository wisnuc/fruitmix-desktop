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

ipcMain.on('DELETE_UPLOADED', (e, uuids) => {
  if (!Tasks.length || !uuids || !uuids.length) return
  uuids.forEach((u) => {
    const task = Tasks.find(t => t.uuid === u)
    if (task) {
      Tasks.splice(Tasks.indexOf(task), 1)
    }
  })
  debug('DELETE_UPLOADED', uuids)
  sendMsg()
})

ipcMain.on('DELETE_UPLOADING', (e, uuids) => {
  if (!Tasks.length || !uuids || !uuids.length) return
  uuids.forEach((u) => {
    const task = Tasks.find(t => t.uuid === u)
    if (task) {
      task.pause()
      Tasks.splice(Tasks.indexOf(task), 1)
    }
  })
  debug('DELETE_UPLOADING', uuids)
  sendMsg()
})

ipcMain.on('PAUSE_UPLOADING', (e, uuids) => {
  if (!Tasks.length || !uuids || !uuids.length) return
  uuids.forEach((u) => {
    const task = Tasks.find(t => t.uuid === u)
    if (task) task.pause()
  })
  debug('PAUSE_UPLOADING', uuids)
  sendMsg()
})

ipcMain.on('RESUME_UPLOADING', (e, uuids) => {
  if (!Tasks.length || !uuids || !uuids.length) return
  uuids.forEach((u) => {
    const task = Tasks.find(t => t.uuid === u)
    if (task) task.resume()
  })
  debug('RESUME_UPLOADING', uuids)
  sendMsg()
})

ipcMain.on('CLEAN_RECORD', () => {
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

export { Tasks, sendMsg }
