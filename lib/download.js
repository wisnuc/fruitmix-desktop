
// transimission api
var transmission = {

	dealDownloadQueue: function() {
		if (downloadQueue.length == 0) {
			return
		}else {
			if (downloadQueue[0].index == downloadQueue[0].length && downloadNow.length == 0) {
				mainWindow.webContents.send('message',downloadQueue[0].success+' 个文件下载成功 '+downloadQueue[0].failed+' 个文件下载失败')
				console.log('a upload task over')
				downloadQueue.shift()
				this.dealDownloadQueue()
			}else {
				if (downloadNow.length < 3) {
					let gap = 3 - downloadNow.length
					for (let i = 0; i < gap; i++) {
						let index = downloadQueue[0].index
						if (index > downloadQueue[0].length-1) {
							return
						}
						downloadNow.push(downloadQueue[0].data[index])
						this.download(downloadQueue[0].data[index])
						downloadQueue[0].index++
					}
				}
			}
		}
	},

	download: function(item) {
		var _this = this
		var body = 0
		let countStatus
		if (item.size > 10000000) {
			countStatus = setInterval(()=>{
				let status = body/item.attribute.size
				mainWindow.webContents.send('refreshStatusOfDownload',item.uuid+item.downloadTime,status)
				c(item.name+ ' ======== ' + status)
			},1000)
		}
		var options = {
			method: 'GET',
			url: server+'/files/'+item.uuid,
			headers: {
				Authorization: user.type+' '+user.token
			}
		}

		function callback (err,res,body) {
			clearInterval(countStatus)
			if (!err && res.statusCode == 200) {
				console.log('res')
				mainWindow.webContents.send('refreshStatusOfDownload',item.uuid+item.downloadTime,1)
				downloadQueue[0].success += 1
				let index = downloadNow.findIndex(i=>i.uuid == item.uuid)
				downloadNow.splice(index,1)
				if (downloadNow.length == 0) {
					_this.dealDownloadQueue()
				}
			}else {
				console.log('err')
				console.log(err)
				downloadQueue[0].failed += 1
				mainWindow.webContents.send('refreshStatusOfDownload',item.uuid+item.downloadTime,1.01)
				let index = downloadNow.findIndex(item3=>item3.uuid == item.uuid)
				downloadNow.splice(index,1)
				fs.unlink(path.join(downloadPath,item.name),err=>{
					c('删除下载失败文件成功')
				})
				if (downloadNow.length == 0) {
					_this.dealDownloadQueue()
				}
			}
		}
		var stream = fs.createWriteStream(path.join(downloadPath,item.name))

		// fs.readfile()

		request(options,callback).on('data',function(d){
			body += d.length
		}).pipe(stream)
	},

	getTreeCount: function(tree) {
		let count = 0
		loopTree(tree,downloadPath)
		function loopTree(tree) {
			count++
			tree.times = 0
			if (tree.children.length == 0) {
				return
			}else {
				tree.children.forEach(item=>{
					loopTree(item)
				})
			}
		}
		return count
	},

	downloadFolder: function(folder) {
		var _this = this
		try{
			looptree(folder.data,()=>{
				console.log('finish')
				let obj = downloadFolderNow.shift()
				dealwithQueue()
				mainWindow.webContents.send('message','文件夹 '+folder.data.name+'下载完成')
				mainWindow.webContents.send('refreshDownloadStatusOfFolder',folder.key,'已完成')
			},()=>{
				c('not finish')
				let obj = downloadFolderNow.shift()
				dealwithQueue()
				mainWindow.webContents.send('message','文件夹 '+folder.data.name+'下载失败')
				mainWindow.webContents.send('refreshDownloadStatusOfFolder',folder.key,'下载失败')
			})
			let s = setInterval(()=>{
				mainWindow.webContents.send('refreshDownloadStatusOfFolder',folder.key,folder.success+' / '+folder.count)
			},1000)
			
			ipcMain.on('loginOff',function() {
				clearInterval(s)
			})
			function dealwithQueue() {
				downloadFolderQueue.shift()
				if (downloadFolderQueue.length > 0) {
					downloadFolderNow.push(downloadFolderQueue[0])
					downloadFolder(downloadFolderNow[0])		
				}
				clearInterval(s)
			}
			function looptree(tree,callback,failedCallback) {
				try{
					if (tree.type == 'file') {
						c(tree.name+' is file')
						_this.downloadFolderFile(tree.uuid,tree.path).then(()=>{
							folder.success++

							callback()
						}).catch(err=>{
							failedCallback()
						})
					}else {
						c(tree.name+' is folder')
						fs.mkdir(tree.path,err=>{
							if (err) {
								c(tree.path)
								console.log('folder failed')
								failedCallback()
							}else {
								console.log('folder success')
								folder.success++
								let count = tree.children.length
								let index = 0
								let success = function () {
									index++
									if (index == count) {
										callback()
									}else {
										looptree(tree.children[index],success,failed)		
									}
								}
								let failed = function () {
									if (!tree.children[index].times) {
										return		
									}
									tree.children[index].time++
									if (tree.children[index].times>5) {
										index++
										folder.children[index].times++
										callback()
									}else {
										looptree(tree.children[index],success,failed)
									}
								}
								if (count == 0) {
									callback()
								}
								looptree(tree.children[index],success,failed)
							}
						})
					}
				}catch(e){}
			}
		}catch(e){
			c(e)
		}
	},

	downloadFolderFile: function(uuid,path) {
		var promise = new Promise((resolve,reject)=>{
			var options = {
				method: 'GET',
				url: server+'/files/'+uuid,
				headers: {
					Authorization: user.type+' '+user.token
				}
			}
			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					console.log('file res')
					resolve()
				}else {
					console.log('file err')
					reject()
				}
			}
			var stream = fs.createWriteStream(path)

			request(options,callback).pipe(stream)
		})
		return promise
	}

}

module.exports = transmission