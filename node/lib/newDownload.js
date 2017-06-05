import os from 'os'
import child_process from 'child_process'
import registerCommandHandlers from './command'
import createTask, { sendMsg } from './downloadTaskCreater'
import { getMainWindow } from './window'
import { dialog, ipcMain } from 'electron'

const userTasks = []
const finishTasks = []

//args have imformation about file/folder get from server
//name,uuid,size,type were used to create manager
const downloadHandle = (args, callback) => {
	let files = args.files
	let folders = args.folders
	files.forEach(item => createTask(item.uuid, item.name, item.size, item.type, args.dirUUID, true))
	folders.forEach(item => createTask(item.uuid, item.name, 0, item.type, args.dirUUID?args.dirUUID:item.uuid, true))

	let count = files.length + folders.length
  getMainWindow().webContents.send('snackbarMessage', {message: count + '个任务添加至下载队列'})
}

const getTransmissionHandle = (args, callback) => {

	db.downloading.find({}, (err, tasks) => {
		if(err) return
		tasks.forEach(item => createTask(item.target, item.name, item.rootSize, item.type, item.dirUUID, 
				false, item.downloadPath, item._id, item.downloading, item.createTime))
	})

	db.downloaded.find({}).sort({finishDate: -1}).exec((err, tasks) => {
		if (err) return console.log(err)
		tasks.forEach(item => item.uuid = item._id)
		finishTasks.splice(0, 0, ...tasks)
		sendMsg()
	})
}

const deleteDownloadingHandle = (e, tasks) => {
	tasks.forEach(item => {
		let obj = userTasks.find(task => task.uuid === item.uuid)
		if (obj) obj.delete(cleanRecord)
	})
}

const deleteDownloadedHandle = (e, tasks) => {
	console.log(tasks)
	tasks.forEach(item => {
		let obj = finishTasks.find(task => task.uuid === item.uuid)
		if (obj) cleanRecord('finish', item.uuid)
	})
}

const cleanRecord = (type, uuid) => {
	let list = type === 'finish'? finishTasks: userTasks
	let d = type === 'finish'?db.downloaded:db.downloading
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
  ['DOWNLOAD', downloadHandle]
])

registerCommandHandlers(uploadCommandMap)

ipcMain.on('GET_TRANSMISSION', getTransmissionHandle)
ipcMain.on('DELETE_DOWNLOADING', deleteDownloadingHandle)
ipcMain.on('DELETE_DOWNLOADED', deleteDownloadedHandle)

ipcMain.on('PAUSE_DOWNLOADING', (e, uuid) => {
	if (!uuid) return
	let task = userTasks.find(item => item.uuid === uuid)
	if (task) {task.pauseTask()}
})

ipcMain.on('RESUME_DOWNLOADING', (e, uuid) => {
	if (!uuid) return
	let task = userTasks.find(item => item.uuid === uuid)
	if (task) task.resumeTask()
})

ipcMain.on('LOGIN_OUT', e => {
  console.log('LOGIN_OUT in download')
  userTasks.forEach(item => item.pauseTask())
  userTasks.length = 0
  sendMsg()
})


export { userTasks, finishTasks }