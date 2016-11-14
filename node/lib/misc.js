import { ipcMain } from 'electron'

ipcMain.on('changeDownloadPath', e=>{
	dialog.showOpenDialog({properties: [ 'openDirectory']},function(folder) {
		if (folder == undefined)　{
			return
		}
		let folderPath = path.normalize(folder[0])
		// c(folderPath)
		downloadPath = folderPath
		// mainWindow.webContents.send('setDownloadPath',downloadPath)
		dispatch(action.setDownloadPath(downloadPath))

    store.dispatch({
      type: 'CONFIG_SET_DOWNLOAD_PATH',
      data: downloadPath
    })
	})
})

ipcMain.on('openAppifi', err => {

	fruitmixWindow = new BrowserWindow({
		frame: true,
		height: 768,
		resizable: true,
		width: 1366,
		minWidth:1024,
		minHeight:768,
		title:'WISNUC'
	})
	//window title
	fruitmixWindow.on('page-title-updated',function(event){
		event.preventDefault()
	})
	c(server)
	fruitmixWindow.loadURL(server.substring(0,server.length-4)+3001)
})

//create fruitmix
ipcMain.on('createFruitmix',(err,item)=>{
	c(item.address[0]+':'+item.port)
	fruitmixWindow = new BrowserWindow({
		frame: true,
		height: 768,
		resizable: true,
		width: 1366,
		minWidth:1024,
		minHeight:768,
		title:'WISNUC'
	})
	//window title
	fruitmixWindow.on('page-title-updated',function(event){
		event.preventDefault()
	})
	fruitmixWindow.loadURL('http://'+item.address+':3000')
})


