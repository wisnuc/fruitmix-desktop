import request from 'request'
import store from '../serve/store/store'
import { getMainWindow } from './window'

class Transfer {
	constructor() {
		this.list = []
		this.finishList = []
		this.handle = null
		this.ip = ''
		this.server = ''
		this.tokenObj = {}
	}

	addTask(obj) {
		this.list.push(obj)
		this.schedule()
	}

	schedule() {
		if (this.list.length == 0) return
		this.initArgs()
		this.getTransfer().then(data => {
			console.log('--------------------------')
			console.log('当前队列一共 ' + this.list.length + ' 个任务')
			for (let i = this.list.length -1; i>=0; i--) {
				console.log(' ')
				console.log('正在调度任务' + this.list[i].id)
				let index = data.findIndex(task => task.id == this.list[i].id)

				if (index != -1) {
					if (data[index].state == 'FINISHED') {
						console.log('发现任务 ' + this.list[i].id + ' 完成')
						this.refresh(this.list[i])
						this.finishList.push(this.list.splice(i,1)[0])

					}else if (data[index].state == 'RUNNING') {
						console.log('发现任务 ' + this.list[i].id + ' 正在处理')
					}else {
						console.log('发现任务 ' + this.list[i].id + ' ' + data[index].state)	
						this.finishList.push(this.list.splice(i,1)[0])
					}
				}
			}
			console.log('剩余 ' + this.list.length + '个任务')
			if (this.list.length !== 0) setTimeout(this.schedule.bind(this),1000)
		}).catch(err => console.log(err))
	}

	refresh(obj) {
		console.log(obj)
		let text = obj.type == 'move'? '移动': '拷贝'
		if (obj.dst.type == 'fruitmix') {
			getMainWindow().webContents.send('driveListUpdate', Object.assign({},obj.directory,{message: text + '成功'}))
		}else {
			getMainWindow().webContents.send('physicalListUpdate', Object.assign({}, obj.dst, {message: text + '成功'}))
		}	

		if (obj.type == 'move') {
			if (obj.src.type == 'fruitmix') {
				getMainWindow().webContents.send('driveListUpdate', Object.assign({},obj.directory,{message: text + '成功'}))
			}else {
				getMainWindow().webContents.send('physicalListUpdate', Object.assign({}, obj.src, {message: text + '成功'}))
			}
		}
	}

	getTransfer() {
		return new Promise((resolve, reject) => {
			let options = {
	      url: this.server + '/files/transfer',
	      method:'get',
	      headers: {
	        Authorization: this.tokenObj.type + ' ' + this.tokenObj.token,
	        'Content-Type': 'application/json'
	      }
	    }

	    request(options, (err, res, body) => {
	    	if (err || res.statusCode !== 200) reject(err)
	    	else resolve(JSON.parse(res.body))
	    })
		})
	}

	initArgs() {
		this.ip = store.getState().login2.device.mdev.address
	  this.server = 'http://' + store.getState().login2.device.mdev.address + ':3721'
	  this.tokenObj = store.getState().login2.device.token.data
	}
}

export default new Transfer()