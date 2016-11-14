import { ipcMain } from 'electron'
import Debug from 'debug'

const debug = Debug('lib:migration')
const c = debug

// data move api -----------------------------------------

//data move
ipcMain.on('getMoveData', () => {
	c('begin get move data : ')
	getMoveDataApi().then( data => {
		c('get move data success')
		var tempArr = []
		data.forEach(item => {
			if (item.children && item.children.length!=0) {
				tempArr.push(item)
			}
		})
		mainWindow.webContents.send('setMoveData',tempArr)
	}).catch(err => {
		c(err)
		c('get move data error !')
	})
})

function getMoveDataApi() {
		let login = new Promise((resolve,reject)=>{
			request(server+'/winsun',function(err,res,body){
				if (!err && res.statusCode == 200) {
					resolve(eval(body))
				}else {
					c(res.body)
					c(err)
					reject(err)
				}
			})
		})
		return login
}

ipcMain.on('move-data',(err,path) => {
	mainWindow.webContents.send('message','正在移动...')
	moveDataApi(path).then( ()=>{
		mainWindow.webContents.send('message','数据迁移成功')
		getMoveDataApi().then( data => {
			c('get move data success')
			var tempArr = []
			data.forEach(item => {
				if (item.children && item.children.length!=0) {
					tempArr.push(item)
				}
			})
			mainWindow.webContents.send('setMoveData',tempArr)
		}).catch(err => {
			c('get move data error !')
			mainWindow.webContents.send('message','数据迁移失败')
		})		

	}).catch( e=>{
		c('failed')
	})
})

function moveDataApi(path) {
	var a = rootNode.uuid
	var promise = new Promise((resolve,reject) => {
			var options = {
				method : 'post',
				url : server + '/winsun',
				headers : {
					Authorization : user.type + ' ' + user.token,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					src : path,
					dst : rootNode.uuid
				})
			}

			var callback = function(err, res, body) {
				if (!err && res.statusCode == 200) {
					c(res.body)
					resolve()
				}else {
					reject(err)
				}
			}
			request(options, callback)
		})
		return promise
}

