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
const uploadHandle = (args, callback) => {
  initArgs()
  let folderUUID = args.folderUUID
  let dialogType = args.type=='folder'?'openDirectory':'openFile'
  dialog.showOpenDialog({properties: [ dialogType,'multiSelections','createDirectory']},function(data){
    if (!data) return callback('get list err',null)
    let index = 0
    let count = data.length
    let uploadArr = []
    let readUploadInfor = (abspath) => {
      fs.stat(abspath,(err, infor) => {
        if (err) return console.log('读取目录 ' + abspath + ' 错误')
        uploadArr.push({size:infor.size,abspath:abspath}) 
        index++
        if(index < count) {
          readUploadInfor(data[index])
        }else {
          createUserTask(args.type,uploadArr,folderUUID)
          getMainWindow().webContents.send('message',uploadArr.length + '个任务添加至上传队列')
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
      createTask(filePath, args.dirUUID, type, true)
      index++
      if (index == args.files.length) return getMainWindow().webContents.send('message', args.files.length + '个任务添加至上传队列')
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
      createTask(item.abspath, item.target, item.type, false, item._id, item.uploading, item.rootUUID)
      }
      )
  })
	// db.uploading   to fixed
}

const cleanRecordHandle = () => {
	dialog.showMessageBox({
		type:'question',
		buttons:['取消','确定'],
		title:'删除确认',
		icon:null,
		message:'你确定要清除所有上传记录吗？'},response => {
			if (!response) return
			db.uploaded.remove({},{multi: true},(err,re) => {
				if (err) return console.log(err);
				finishTasks.length = 0
				getTransmissionHandle()
			})
	})
}

const uploadCommandMap = new Map([
  ['UPLOAD_FOLDER', uploadHandle],
  ['UPLOAD_FILE', uploadHandle],
  ['DRAG_FILE', dragFileHandle],
  ['CLEAN_UPLOAD_RECORD', cleanRecordHandle]
])

registerCommandHandlers(uploadCommandMap)

ipcMain.on('loginOff', evt => {
  //todo
})

ipcMain.on('GET_TRANSMISSION', getTransmissionHandle)

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

export { userTasks, finishTasks }