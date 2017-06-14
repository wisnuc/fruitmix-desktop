import os from 'os'
import child_process from 'child_process'
import { dialog, ipcMain } from 'electron'

import { getMainWindow } from './window'
import { userTasks as uploadingTasks, finishTasks as uploadedTasks } from './newUpload'
import { userTasks as downloadingTasks, finishTasks as downloadedTasks } from './newDownload'
import TransferManager from './transferManager'
import registerCommandHandlers from './command'

const lock = false

const quickSort = (arr, type) => {
  if (arr.length < 1) return arr
  const pivotIndex = Math.floor(arr.length / 2)
  const pivot = arr.splice(pivotIndex, 1)[0]
  const left = []
  const right = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][type] < pivot[type]) right.push(arr[i])
    else left.push(arr[i])
  }

  return quickSort(left, type).concat([pivot], quickSort(right, type))
}

const sendInfor = () => {
  const concatUserTasks = [].concat(uploadingTasks, downloadingTasks)
  const concatFinishTasks = [].concat(uploadedTasks, downloadedTasks)
  const userTasks = quickSort(concatUserTasks, 'createTime')
  const finishTasks = quickSort(concatFinishTasks, 'finishDate')
  try {
    getMainWindow().webContents.send(
      'UPDATE_TRANSMISSION',
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
}

// handle will open dialog from electron to clean record of the task have been downloaded
const cleanRecordHandle = () => {
  if (uploadedTasks.length === 0 && downloadedTasks.length === 0) return
  dialog.showMessageBox({
    type: 'question',
    buttons: ['取消', '确定'],
    title: '删除确认',
    icon: null,
    message: '你确定要清除所有传输记录吗？' }, (response) => {
    if (!response) return
    global.db.uploaded.remove({}, { multi: true }, (err) => {
      if (err) return console.log(err)
      uploadedTasks.length = 0

      global.db.downloaded.remove({}, { multi: true }, (err) => {
        if (err) return console.log(err)
        downloadedTasks.length = 0
        sendInfor()
      })
    })
  })
}

const openHandle = (e, tasks) => {
  const osType = os.platform()
  tasks.forEach((task) => {
    const pathProperty = task.trsType === 'download' ? 'downloadPath' : 'abspath'
    const taskPath = task.trsType === 'download' ?
      task[pathProperty] : task[pathProperty].substring(0, task[pathProperty].lastIndexOf('\\'))
    console.log('打开目录的文件资源管理器', taskPath)
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

const transferHandle = (args) => {
  TransferManager.addTask(args.obj)
}

const commandMap = new Map([
  ['CLEAN_RECORD', cleanRecordHandle],
  ['TRANSFER', transferHandle]
])


registerCommandHandlers(commandMap)

ipcMain.on('OPEN_TRANSMISSION', openHandle)


export default sendInfor
