import os from 'os'
import child_process from 'child_process'
import { dialog, ipcMain } from 'electron'
import { getMainWindow } from './window'
import { userTasks as uploadingTasks, finishTasks as uploadedTasks} from './newUpload'
import { userTasks as downloadingTasks, finishTasks as downloadedTasks} from './newDownload'
import TransferManager from './transferManager'
import registerCommandHandlers from './command'

let lock = false

const sendInfor = urgent => {
	let concatUserTasks = [].concat(uploadingTasks, downloadingTasks)
	let concatFinishTasks = [].concat(uploadedTasks, downloadedTasks)
	let userTasks = quickSort(concatUserTasks, 'createTime')
	let finishTasks = quickSort(concatFinishTasks, 'finishDate')
	getMainWindow().webContents.send(
  	'UPDATE_TRANSMISSION', 
  	'UPDATE_TRANSMISSION', 
  	userTasks.map(item => item.getSummary()), 
  	finishTasks.map(i => i.getSummary?i.getSummary():i)
  )
}

const quickSort = (arr, type) => {
	if (arr.length < 1) return arr
	let pivotIndex = Math.floor(arr.length / 2)
	let pivot = arr.splice(pivotIndex,1)[0]
	let left = []
	let right = []
	for (let i = 0; i < arr.length; i++) {
		if (arr[i][type] < pivot[type]) right.push(arr[i])
		else left.push(arr[i])
	}
	
	return quickSort(left, type).concat([pivot], quickSort(right, type))
}

//handle will open dialog from electron to clean record of the task have been downloaded
const cleanRecordHandle = () => {
	dialog.showMessageBox({
		type:'question',
		buttons:['取消','确定'],
		title:'删除确认',
		icon:null,
		message:'你确定要清除所有传输记录吗？'},response => {
			if (!response) return
			db.uploaded.remove({},{multi: true},(err,re) => {
				if (err) return console.log(err)
				uploadedTasks.length = 0

				db.downloaded.remove({},{multi: true},(err,re) => {
					if (err) return console.log(err);
					downloadedTasks.length = 0
					sendInfor()
				})
			})
	})
}

const openHandle = (e, tasks) => {
	let osType = os.platform()
	tasks.forEach(task => {
		let pathProperty = task.trsType === 'download'? 'downloadPath': 'abspath'
		let taskPath = task.trsType === 'download' ? task[pathProperty]: task[pathProperty].substring(0, task[pathProperty].lastIndexOf('\\'))
		console.log('打开目录的文件资源管理器', taskPath)
		switch (osType) {
			case 'win32':
				child_process.exec('explorer ' + taskPath, {})
				break
			case 'linux':
				child_process.exec('nautilus ' + taskPath, {})
				break
			case 'darwin':
				child_process.exec('open ' + taskPath, {})
				break
			default : 
		}
	})
}

const transferHandle = args => {
	TransferManager.addTask(args.obj)
}

var commandMap = new Map([
  ['CLEAN_RECORD', cleanRecordHandle],
  ['TRANSFER', transferHandle]
])


registerCommandHandlers(commandMap)

ipcMain.on('OPEN_TRANSMISSION', openHandle)



export default sendInfor