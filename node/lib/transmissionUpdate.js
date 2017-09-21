import os from 'os'
import Debug from 'debug'
import child from 'child_process'
import { ipcMain, powerSaveBlocker, shell } from 'electron'

import { getMainWindow } from './window'
import store from './store'

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
    if (t.state === 'finished') finishTasks.push(typeof t.status === 'function' ? t.status() : t)
    else userTasks.push(t.status())
  })
  userTasks.sort((a, b) => a.createTime - b.createTime) // Ascending
  finishTasks.sort((a, b) => b.finishDate - a.finishDate) // Descending

  if (!powerSaveBlocker.isStarted(id) && userTasks.length !== 0 && !store.getState().config.enableSleep) {
    id = powerSaveBlocker.start('prevent-display-sleep')
    // console.log('powerSaveBlocker start', id, powerSaveBlocker.isStarted(id))
  }

  /* send message when all tasks finished */
  if (preLength !== 0 && userTasks.length === 0) {
    if (powerSaveBlocker.isStarted(id)) {
      powerSaveBlocker.stop(id)
      // console.log('powerSaveBlocker stop', id, powerSaveBlocker.isStarted(id))
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
    case 'DELETE':
      func = (task) => {
        if (typeof task.pause === 'function' && task.state !== 'finished') task.pause()
        Tasks.splice(Tasks.indexOf(task), 1)
        global.db.task.remove({ _id: task.uuid }, { multi: true }, err => err && debug('DELETE_RUNNING error: ', err))
      }
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

const clearTasks = () => {
  debug('clearTasks !!')
  Tasks.forEach(task => task.state !== 'finished' && task.pause())
  Tasks.length = 0
  sendMsg()
}

/* ipc listeners */
ipcMain.on('GET_TRANSMISSION', sendMsg)

ipcMain.on('OPEN_TRANSMISSION', (e, paths) => paths.forEach(p => shell.openItem(p)))

ipcMain.on('PAUSE_TASK', (e, uuids) => actionHandler(e, uuids, 'PAUSE'))
ipcMain.on('RESUME_TASK', (e, uuids) => actionHandler(e, uuids, 'RESUME'))
ipcMain.on('DELETE_TASK', (e, uuids) => actionHandler(e, uuids, 'DELETE'))

ipcMain.on('START_TRANSMISSION', () => {
  global.db.task.find({}, (error, tasks) => {
    if (error) return debug('load nedb store error', error)
    // debug('startTransmissionHandle', tasks)
    tasks.forEach(t => t.state === 'finished' && Tasks.push(t))
  })
})

ipcMain.on('LOGOUT', clearTasks)

export { Tasks, sendMsg, clearTasks }
