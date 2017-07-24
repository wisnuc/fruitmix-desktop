import path from 'path'
import fs from 'fs'
import stream from 'stream'
import crypto from 'crypto'
import { dialog, ipcMain } from 'electron'
import request from 'request'
import { getMainWindow } from './window'
import createTask, { sendMsg } from './uploadTaskCreater'
import { uploadFile, hashFile, getFileInfo } from './upload'

const userTasks = []
const finishTasks = []

// handler
const uploadHandle = (event, args) => {
  console.log('uploadHandle...')
  console.log(args)
  const { driveUUID, dirUUID, type, filters } = args
  if (type === 'folder') return null // TODO
  const dialogType = type === 'folder' ? 'openDirectory' : 'openFile'
  dialog.showOpenDialog({ properties: [dialogType, 'multiSelections'], filters }, (data) => {
    if (!data) return console.log('get list err', null)
    console.log(data)
    getFileInfo(driveUUID, dirUUID, data[0])
    return null
    let index = 0
    const count = data.length
    const readUploadInfor = (abspath) => {
      fs.stat(abspath, (err, infor) => {
        if (err) return console.log(`读取目录 ${abspath} 错误`)
        createTask(abspath, dirUUID, type, true, null, null, null)
        index++
        if (index < count) {
          readUploadInfor(data[index])
        } else {
          getMainWindow().webContents.send('snackbarMessage', { message: `${data.length}个任务添加至上传队列` })
        }
      })
    }
    readUploadInfor(data[index])
  })
}

const uploadMediaHandle = (event, rootUUID) => {
  const dirUUID = rootUUID
  uploadHandle(event, { dirUUID,
    type: 'file',
    filters: [
    { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
    { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] }
    ]
  })
}

const dragFileHandle = (event, args) => {
  if (!args.files.length) return
  let index = 0
  const loop = () => {
    const filePath = path.normalize(args.files[index])
    let type = ''
    fs.stat(filePath, (err, stat) => {
      if (err) {
        index++
        return loop()
      }
      if (stat.isDirectory()) type = 'folder'
      else type = 'file'
      createTask(filePath, args.dirUUID, type, true, null, null, null)
      index++
      if (index == args.files.length) return getMainWindow().webContents.send('snackbarMessage', { message: `${args.files.length}个任务添加至上传队列` })
      loop()
    })
  }
  loop()
}

const startTransmissionHandle = () => {
  db.uploaded.find({}).sort({ finishDate: -1 }).exec((err, docs) => {
    if (err) return console.log(err)
    docs.forEach(item => item.uuid = item._id)
    finishTasks.splice(0, 0, ...docs)
    sendMsg()
  })

  db.uploading.find({}, (err, tasks) => {
    if (err) return
    tasks.forEach((item) => {
      createTask(item.abspath, item.target, item.type, false, item._id, item.uploading, item.rootNodeUUID, item.createTime)
    })
  })
}

const deleteUploadingHandle = (e, tasks) => {
  tasks.forEach((item) => {
    const obj = userTasks.find(task => task.uuid === item.uuid)
    if (obj) obj.delete(cleanRecord)
  })
}

const deleteUploadedHandle = (e, tasks) => {
  tasks.forEach((item) => {
    const obj = finishTasks.find(task => task.uuid === item.uuid)
    if (obj) cleanRecord('finish', item.uuid)
  })
}

const cleanRecord = (type, uuid) => {
  const list = type === 'finish' ? finishTasks : userTasks
  const d = type === 'finish' ? db.uploaded : db.uploading
  const index = list.findIndex(item => item.uuid === uuid)
  if (index === -1) return console.log('任务没有在任务列表中')

  console.log(`删除列表中任务... 第${index + 1}个 共${list.length}个`)
  list.splice(index, 1)
  console.log(`列表中任务删除完成 剩余${list.length}个`)
  d.remove({ _id: uuid }, {}, (err, doc) => {
    if (err) return console.log('删除数据库记录出错')
    console.log('删除数据库记录成功')
    sendMsg()
  })
}


ipcMain.on('loginOff', (evt) => {
  // todo
})

ipcMain.on('START_TRANSMISSION', startTransmissionHandle)
ipcMain.on('GET_TRANSMISSION', sendMsg)
ipcMain.on('DELETE_UPLOADING', deleteUploadingHandle)
ipcMain.on('DELETE_UPLOADED', deleteUploadedHandle)
ipcMain.on('DRAG_FILE', dragFileHandle)
ipcMain.on('UPLOAD', uploadHandle)
ipcMain.on('UPLOADMEDIA', uploadMediaHandle)

// ipcMain.on('PAUSE_UPLOADING')
ipcMain.on('PAUSE_UPLOADING', (e, uuid) => {
  if (!uuid) return
  const task = userTasks.find(item => item.uuid === uuid)
  if (task) { task.pauseTask() }
})

ipcMain.on('RESUME_UPLOADING', (e, uuid) => {
  if (!uuid) return
  const task = userTasks.find(item => item.uuid === uuid)
  if (task) task.resumeTask()
})

ipcMain.on('LOGIN_OUT', (e) => {
  console.log('LOGIN_OUT in upload')
  userTasks.forEach(item => item.pauseTask())
  userTasks.length = 0
  finishTasks.length = 0
  sendMsg()
})


export { userTasks, finishTasks }
