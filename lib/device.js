
// login api
var findDeviceApi = {

	findDevice: function(data) {
		if (!data.fullname) {
			return
		}
		let fru = data.fullname.toLowerCase().indexOf('fruitmix');
		let app = data.fullname.toLowerCase().indexOf('wisnuc appstation');
		if (fru == -1 && app == -1) {
			return
		}
		// is exist
		let deviceIndex = device.findIndex(item=>{
			return item.addresses[0] == data.addresses[0];
		});
		if (deviceIndex == -1) {
			c('ip not exist');
			//not exist
			if (fru != -1) {
				c('type is fruitmix');
				let index = device.length;
				device.push(Object.assign({},data,{active:false,isCustom:false,fruitmix:true,admin:false}));
				//fruitmix server
				request.get('http://'+data.addresses[0]+'/login',(err,res,body)=>{
					if (!err && res.statusCode == 200) {
						if (JSON.parse(body).length == 0) {
							device[index].admin = false;
						}else {
							device[index].admin = true;
						}
					}else {
						c('can not get users information');
						device[index].admin = false;
					}
					// mainWindow.webContents.send('device',device);
					dispatch(action.setDevice(device))
					c('------------------------------------------1');
				});
			}else if(app != -1){
				c('type is wisnuc');
				device.push(Object.assign({},data,{active:false,isCustom:false,fruitmix:false,admin:false}));
				// mainWindow.webContents.send('device',device);
				dispatch(action.setDevice(device))
				c('------------------------------------------2');
			}
		}else {
			// c('ip exist');
			//exist
			if (device[deviceIndex].fullname == data.fullname) {
				return
			}else {
				c('ip has change');
				device[deviceIndex].fullname = data.fullname
				let f = fru==-1?false:true;
				if (!f) {
					device[deviceIndex].fruitmix = false;
					// mainWindow.webContents.send('device',device);
					dispatch(action.setDevice(device))
					c('ip ' + data.addresses[0] + 'fruitmix close');
				}else {
					device[deviceIndex].fruitmix = true;
					setTimeout(function(){
						request.get('http://'+data.addresses[0]+'/login',(err,res,body)=>{
							c(res,err)
							if (!err && res.statusCode == 200) {
								if (JSON.parse(body).length == 0) {
									device[deviceIndex].admin = false;
								}else {
									device[deviceIndex].admin = true;
								}
							}else {
								device[deviceIndex].admin = false
							}
							// mainWindow.webContents.send('device',device);
							dispatch(action.setDevice(device))
							c('ip ' + data.addresses[0] + 'fruitmix open');
						});	
					},2000);
				}
			}
		}
	},

	getRecord: function() {
		c(' ');
		//have device used recently
		fs.readFile(path.join(process.cwd(),'server'),{encoding: 'utf8'},(err,data)=>{
			if (err) {
				c('not find server record');
				serverRecord = {ip:'',savePassword:false,autoLogin:false,username:null,password:null,customDevice:[],download: downloadPath};
				let j = JSON.stringify(serverRecord);
				fs.writeFile(path.join(process.cwd(),'server'),j,(err,data)=>{

				});
				dispatch(action.setDevice(device))
				// mainWindow.webContents.send('device',device);
			}else { 
				c('find record');
				serverRecord = JSON.parse(data);
				downloadPath = serverRecord.download;
				c('download path is : ' + serverRecord.download);
				// mainWindow.webContents.send('setDownloadPath',downloadPath);
				dispatch(action.setDownloadPath(serverRecord.download))
				if (serverRecord.ip != '') {
					server = 'http://'+serverRecord.ip;
					c('server ip is : ' + server);
					// mainWindow.webContents.send('setDeviceUsedRecently',serverRecord.ip);
					dispatch(action.setDeviceUsedRecently(serverRecord.ip))
				}
				if (serverRecord.customDevice.length !=0) {
					device.concat(serverRecord.customDevice);
					for (let item of serverRecord.customDevice) {
						device.push(item);
					}
					dispatch(action.setDevice(device))
					// mainWindow.webContents.send('device',device);
				}
			}
			
		});
	}



};

module.exports = findDeviceApi