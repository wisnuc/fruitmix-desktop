
// transimission api
var transmission = {

	dealDownloadQueue: function() {
		if (downloadQueue.length == 0) {
			return
		}else {
			if (downloadQueue[0].index == downloadQueue[0].length && downloadNow.length == 0) {
				mainWindow.webContents.send('message',downloadQueue[0].success+' 个文件下载成功 '+downloadQueue[0].failed+' 个文件下载失败');
				console.log('a upload task over');
				downloadQueue.shift()
				this.dealDownloadQueue();
			}else {
				if (downloadNow.length < 3) {
					let gap = 3 - downloadNow.length;
					for (let i = 0; i < gap; i++) {
						let index = downloadQueue[0].index;
						if (index > downloadQueue[0].length-1) {
							return
						}
						downloadNow.push(downloadQueue[0].data[index]);
						this.download(downloadQueue[0].data[index]);
						downloadQueue[0].index++;
					}
				}
			}
		}
	},

	download: function(item) {
		var _this = this;
		var body = 0;
		let countStatus;
		if (item.attribute.size > 10000000) {
			countStatus = setInterval(()=>{
				let status = body/item.attribute.size;
				mainWindow.webContents.send('refreshStatusOfDownload',item.uuid+item.downloadTime,status);
				c(item.name+ ' ======== ' + status);
			},1000);
		}
		var options = {
			method: 'GET',
			url: server+'/files/'+item.uuid+'?type=media',
			headers: {
				Authorization: user.type+' '+user.token
			}
		};

		function callback (err,res,body) {
			clearInterval(countStatus);
			if (!err && res.statusCode == 200) {
				console.log('res');
				downloadQueue[0].success += 1;
				mainWindow.webContents.send('refreshStatusOfDownload',item.uuid+item.downloadTime,1);
				var uuid = body;
				console.log(uuid);
				let index = downloadNow.findIndex(i=>i.uuid == item.uuid);
				downloadNow.splice(index,1);
				if (downloadNow.length == 0) {
					_this.dealDownloadQueue();
				}
			}else {
				console.log('err');
				console.log(err);
				downloadQueue[0].failed += 1;
				mainWindow.webContents.send('refreshStatusOfDownload',item.uuid+item.downloadTime,1.01);
				let index = downloadNow.findIndex(item3=>item3.uuid == item.uuid);
				downloadNow.splice(index,1);
				fs.unlink(path.join(downloadPath,item.attribute.name),err=>{
					c('删除下载失败文件成功');
				});
				if (downloadNow.length == 0) {
					_this.dealDownloadQueue();
				}
			}
		}
		var stream = fs.createWriteStream(path.join(downloadPath,item.attribute.name));

		request(options,callback).on('data',function(d){
			body += d.length;
		}).pipe(stream);
	},

	
};

module.exports = transmission