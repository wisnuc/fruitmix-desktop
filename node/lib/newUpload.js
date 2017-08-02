import path from 'path'
import fs from 'fs'
import UUID from 'uuid'
import Debug from 'debug'
import { dialog, ipcMain } from 'electron'
import { getMainWindow } from './window'
import createTask, { sendMsg } from './uploadTaskCreater'

Promise.promisifyAll(fs) // babel would transform Promise to bluebird

const debug = Debug('node:lib:newUpload: ')
const userTasks = []
const finishTasks = []

const readUploadInfoAsync = async (entries, dirUUID, driveUUID) => {
  let count = 0
  for (let i = 0; i < entries.length; i++) {
    const taskUUID = UUID.v4()
    const entry = entries[i]
    const entryStat = await fs.lstatAsync(path.resolve(entry))
    const taskType = entryStat.isDirectory() ? 'folder' : entryStat.isFile() ? 'file' : 'others'
    const createTime = (new Date()).getTime()
    const newWork = true
    const uploadingList = []
    const rootNodeUUID = null
    /* only upload folder or file, ignore others, such as symbolic link */
    if (taskType !== 'others') {
      createTask(taskUUID, entry, dirUUID, driveUUID, taskType, createTime, newWork, uploadingList, rootNodeUUID)
      count += 1
    }
  }
  return count
}

const readUploadInfo = (entries, dirUUID, driveUUID) => {
  readUploadInfoAsync(entries, dirUUID, driveUUID)
    .then((count) => {
      let message = `${count}个任务添加至上传队列`
      if (count < entries.length) message = `${message} (忽略了${entries.length - count}个不支持的文件)`
      getMainWindow().webContents.send('snackbarMessage', { message })
    })
    .catch((e) => {
      debug('readUploadInfo error: ', e)
      getMainWindow().webContents.send('snackbarMessage', { message: '读取上传文件失败' })
    })
}

/* handler */
const uploadHandle = (event, args) => {
  const { driveUUID, dirUUID, type, filters } = args
  const dialogType = type === 'folder' ? 'openDirectory' : 'openFile'
  dialog.showOpenDialog({ properties: [dialogType, 'multiSelections'], filters }, (entries) => {
    if (!entries || !entries.length) return debug('no entry !')
    readUploadInfo(entries, dirUUID, driveUUID)
  })
}

const dragFileHandle = (event, args) => {
  let entries = args.files
  if (!entries || !entries.length) return debug('no entry !')
  entries = entries.map(entry => path.normalize(entry))
  readUploadInfo(entries, args.dirUUID, args.driveUUID)
}

const uploadMediaHandle = (event, args) => {
  const { driveUUID, dirUUID } = args
  uploadHandle(event, {
    dirUUID,
    driveUUID,
    type: 'file',
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
      { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] }
    ]
  })
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
      createTask(item._id, item.abspath, item.target, item.driveUUID, item.type, item.createTime, false, item.uploading, item.rootNodeUUID)
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

/* ipc listener */
ipcMain.on('START_TRANSMISSION', startTransmissionHandle)
ipcMain.on('GET_TRANSMISSION', sendMsg)
ipcMain.on('DELETE_UPLOADING', deleteUploadingHandle)
ipcMain.on('DELETE_UPLOADED', deleteUploadedHandle)
ipcMain.on('DRAG_FILE', dragFileHandle)
ipcMain.on('UPLOAD', uploadHandle)
ipcMain.on('UPLOADMEDIA', uploadMediaHandle)

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
