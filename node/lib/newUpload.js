import path from 'path'
import fs from 'fs'
import stream from 'stream'
import crypto from 'crypto'
import { dialog, ipcMain } from 'electron'

import request from 'request'

import registerCommandHandlers from './command'
import { getMainWindow } from './window'
import createTask, { sendMsg } from './uploadTaskCreater'

const userTasks = []
const finishTasks = []

//handler
const uploadHandle = args => {
  let { dirUUID, type } = args
  let dialogType = type == 'folder'? 'openDirectory': 'openFile'
  dialog.showOpenDialog({properties: [ dialogType,'multiSelections']},function(data){
    if (!data) return console.log('get list err',null)
    let index = 0
    let count = data.length
    let readUploadInfor = (abspath) => {
      fs.stat(abspath,(err, infor) => {
        if (err) return console.log('读取目录 ' + abspath + ' 错误')
        createTask(abspath, dirUUID, type, true, null, null, null)
        index++
        if(index < count) {
          readUploadInfor(data[index])
        }else {
          getMainWindow().webContents.send('snackbarMessage', {message: data.length + '个任务添加至上传队列'})
        }
      })
    }
    readUploadInfor(data[index])
  })
}

const dragFileHandle = (args) => {
	if (!args.files.length) return
  let index = 0
  let loop = () => {
    let filePath = path.normalize(args.files[index])
    let type = ''
    fs.stat(filePath, (err,stat) => {
      if (err) {
        index++
        return loop()
      }
      if (stat.isDirectory()) type='folder'
      else type = 'file'
      createTask(filePath, args.dirUUID, type, true, null, null, null)
      index++
      if (index == args.files.length) return getMainWindow().webContents.send('snackbarMessage', {message: args.files.length + '个任务添加至上传队列'})
      loop()
    })
  }
  loop()
}

const getTransmissionHandle = () => {
  db.uploaded.find({}).sort({finishDate: -1}).exec((err, docs) => {
    if (err) return console.log(err)
      docs.forEach(item => item.uuid = item._id)
      finishTasks.splice(0, 0, ...docs)
      sendMsg()
  })

  db.uploading.find({}, (err, tasks) => {
    if (err) return
    tasks.forEach(item => {
      createTask(item.abspath, item.target, item.type, false, item._id, item.uploading, item.rootNodeUUID, item.createTime)
    })
  })
}

const deleteUploadingHandle = (e, tasks) => {
  tasks.forEach(item => {
    let obj = userTasks.find(task => task.uuid === item.uuid)
    if (obj) obj.delete(cleanRecord)
  })
}

const deleteUploadedHandle = (e, tasks) => {
  tasks.forEach(item => {
    let obj = finishTasks.find(task => task.uuid === item.uuid)
    if (obj) cleanRecord('finish', item.uuid)
  })
}

const cleanRecord = (type, uuid) => {
  let list = type === 'finish'? finishTasks: userTasks
  let d = type === 'finish'?db.uploaded:db.uploading
  let index = list.findIndex(item => item.uuid === uuid)
  if (index === -1) return console.log('任务没有在任务列表中')
  else {
    console.log('删除列表中任务... 第' + (index + 1) + '个 共' + list.length + '个'  )
    list.splice(index, 1)
    console.log('列表中任务删除完成 剩余' + list.length + '个' )
    d.remove({_id: uuid}, {}, (err, doc) => {
      if(err) return console.log('删除数据库记录出错')
      console.log('删除数据库记录成功')
      sendMsg()
    })
  } 
}


const uploadCommandMap = new Map([
  ['UPLOAD', uploadHandle],
  ['DRAG_FILE', dragFileHandle]
])

registerCommandHandlers(uploadCommandMap)

ipcMain.on('loginOff', evt => {
  //todo
})

ipcMain.on('GET_TRANSMISSION', getTransmissionHandle)
ipcMain.on('DELETE_UPLOADING', deleteUploadingHandle)
ipcMain.on('DELETE_UPLOADED', deleteUploadedHandle)

// ipcMain.on('PAUSE_UPLOADING')
ipcMain.on('PAUSE_UPLOADING', (e, uuid) => {
  if (!uuid) return
  let task = userTasks.find(item => item.uuid === uuid)
  if (task) {task.pauseTask()}
})

ipcMain.on('RESUME_UPLOADING', (e, uuid) => {
  if (!uuid) return
  let task = userTasks.find(item => item.uuid === uuid)
  if (task) task.resumeTask()
})

ipcMain.on('LOGIN_OUT', e => {
  console.log('LOGIN_OUT in upload')
  userTasks.forEach(item => item.pauseTask())
  userTasks.length = 0
  finishTasks.length = 0
  sendMsg()
})


export { userTasks, finishTasks }