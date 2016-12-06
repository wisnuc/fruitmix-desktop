import { ipcMain } from 'electron'

import Debug from 'debug'
const debug = Debug('lib:system')
const c = debug

import { getMainWindow } from './window'

function mir(address,target,init,mkfs) {

	console.log(target)

	var promise = new Promise((resolve,reject) => {
		let options = {
			method: 'post',
			url:' http://' + address +':3000/system/mir',
			headers : {
					'Content-Type': 'application/json'
				},
			body: JSON.stringify({
				target:target,
				init,
				mkfs
			})
		}
		let callback = (err,res,body) => {
			if (!err && res.statusCode == 200) {
				c('success : ')
				c(res.body)
				resolve(body)
			}else {
				c('failed : ')
				console.log(res.body)
				reject(res.body)
			}
		}
		request(options,callback)
	})

	return promise
}
//system api-----------------------------------------
ipcMain.on('runVolume',(err, address, target, init, mkfs) => {
	c(address)
	c(target)
	c(init)
	c(mkfs)
	mir(address,target).then(data => {
		
	}).catch(err => {
		
	})
})

ipcMain.on('installVolume', (err,address,target,init,mkfs,time) => {

	c(address)
	c(target)
	c(init)
	c(mkfs)
	c(time)

  const mainWindow = getMainWindow()

	mir(address,target,init,mkfs).then(data => {

		mainWindow.webContents.send('mirFinish-'+time,'success')

	}).catch(err => {

		mainWindow.webContents.send('mirFinish-'+time,'failed')
		mainWindow.webContents.send('message',err)

	})
})


