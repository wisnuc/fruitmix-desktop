import { ipcMain } from 'electron'
import registerCommandHandlers from './command'
import { serverGetAsync, serverPostAsync, serverPatchAsync, serverDeleteAsync } from './server'
// create user
ipcMain.on('create-new-user', function(err, u, p) {
	loginApi.createNewUser(u,p).then(()=>{
		console.log('register success')
		mainWindow.webContents.send('message','注册新用户成功')
		loginApi.getAllUser().then(users=>{
			user.allUser = users
      dispatch(action.loggedin(user)) // TODO ? why
			//mainWindow.webContents.send('addUser',user)
		})

		loginApi.login().then(data=> {
			data.forEach(item => {
				item.checked = false
			})
			user.users = data
			dispatch(action.loggedin(user)) // TODO ? why
		})
		
	}).catch((e)=>{
		c(e)
		mainWindow.webContents.send('message','注册新用户失败')
	})
})

ipcMain.on('userInit',(err,s,u,p,i)=>{
	c(' ')
	loginApi.userInit(s,u,p).then( () => {
		c('管理员注册成功')
		mainWindow.webContents.send('message','管理员注册成功')
	}).catch(err => {
		c(err)
		c('管理员注册失败')
		mainWindow.webContents.send('message','管理员注册失败')
	})
	return
	var options = {
		form: {username:u,password:p}
	}
	function callback (err,res,body) {
		if (!err && res.statusCode == 200) {
			console.log('res')
			c(i)
			mainWindow.webContents.send('message','管理员注册成功')
			let index = device.findIndex(item=>{
				return item.addresses[0] == i.addresses[0]
			})
			mainWindow.webContents.send('message',index)
			if (index != -1) {
				device[index].admin = true
				// mainWindow.webContents.send('device',device)
				dispatch(action.setDevice(device))
			}
		}else {
			console.log('err')
		}
	}
	request.post(s+'/init',options,callback)
})

//delete user 
ipcMain.on('deleteUser',(err,uuid)=>{
	c(uuid)
	loginApi.deleteUser(uuid).then(() => {

	}).catch(err => {
		mainWindow.webContents.send('message','删除用户失败，接口貌似还不OK')
	})
})

