import { getMainWindow } from './window'
import { userTasks as uploadingTasks, finishTasks as uploadedTasks} from './newUpload'
import { userTasks as downloadingTasks, finishTasks as downloadedTasks} from './newDownload'

let lock = false

const sendInfor = urgent => {
	let concatUserTasks = [].concat(uploadingTasks, downloadingTasks)
	let concatFinishTasks = [].concat(uploadedTasks, downloadedTasks)
	let userTasks = quickSort(concatUserTasks)
	let finishTasks = quickSort(concatFinishTasks)
	getMainWindow().webContents.send(
  	'UPDATE_TRANSMISSION', 
  	'UPDATE_UPLOAD', 
  	userTasks.map(item => item.getSummary()), 
  	finishTasks.map(i => i.getSummary?i.getSummary():i)
  )
}

const quickSort = arr => {
	if (arr.length < 1) return arr
	let pivotIndex = Math.floor(arr.length / 2)
	let pivot = arr.splice(pivotIndex,1)[0]
	let left = []
	let right = []
	for (let i = 0; i < arr.length; i++) {
		if (arr[i].createTime < pivot.createTime) left.push(arr[i])
		else right.push(arr[i])
	}
	
	return quickSort(left).concat([pivot], quickSort(right))
}

export default sendInfor