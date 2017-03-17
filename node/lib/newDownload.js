import registerCommandHandlers from './command'
import createTask, { sendMsg } from './downloadTaskCreater'
import { getMainWindow } from './window'
import { dialog, ipcMain } from 'electron'

const userTasks = []
const finishTasks = []

const downloadHandle = (args, callback) => {
	console.log(args)
	let files = args.files
	let folders = args.folders
	files.forEach(item => createTask(item.uuid, item.name, item.size, item.type, true))
	folders.forEach(item => createTask(item.uuid, item.name, 0, item.type, true))
	let count = files.length + folders.length
  getMainWindow().webContents.send('message', count + '个任务添加至下载队列')
}

const cleanRecordHandle = () => {
	dialog.showMessageBox({
		type:'question',
		buttons:['取消','确定'],
		title:'删除确认',
		icon:null,
		message:'你确定要清除所有下载记录吗？'},response => {
			if (!response) return
			db.downloaded.remove({},{multi: true},(err,re) => {
				if (err) return console.log(err);
				finishTasks.length = 0
				getTransmissionHandle()
			})
	})
}

const getTransmissionHandle = (args, callback) => {
	// db.uploading   to fixed
	db.downloading.find({}, (err, tasks) => {
		if(err) return 
		console.log(tasks)
		tasks.forEach(item => 
			createTask(item.target, item.name, item.size, item.type, false, item.downloadPath, item._id))
	})
	db.downloaded.find({}, (err, tasks) => {
		if (err) return console.log(err)
		finishTasks.splice(0, 0, ...tasks)
		sendMsg()
	})
}

const uploadCommandMap = new Map([
  ['DOWNLOAD', downloadHandle],
  ['CLEAN_DOWNLOAD_RECORD', cleanRecordHandle]
])

registerCommandHandlers(uploadCommandMap)

ipcMain.on('GET_TRANSMISSION', getTransmissionHandle)

export { userTasks, finishTasks }