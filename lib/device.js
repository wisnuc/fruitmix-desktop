
// login api
var findDeviceApi = {

	findDevice: function(data) {
		c(' ')
		if (!data.fullname) {
			return
		}
		let sam = data.fullname.toLowerCase().indexOf('samba');
		let app = data.fullname.toLowerCase().indexOf('wisnuc appstation');
		let cloud = data.fullname.toLowerCase().indexOf('owncloud');
		let appifi = data.fullname.toLowerCase().indexOf('wisnuc appifi')
		// is exist
		let deviceIndex = device.findIndex(item=>{
			return item.addresses[0] == data.addresses[0]
		})
		if (deviceIndex == -1) {
			c('ip not exist')
			if ((sam != -1) || (app != -1) || (cloud != -1) || (appifi != -1)) {
				let index = device.length;
				device.push(Object.assign({},data,{active:false,isCustom:false,fruitmix:true,admin:false}));
				request.get('http://'+data.addresses[0]+':3721/login',(err,res,body)=>{
					if (!err && res.statusCode == 200) {
						if (JSON.parse(body).length == 0) {
							device[index].admin = false;
						}else {
							device[index].admin = true;
						}
					}else {
						c('can not get users information')
						device[index].admin = false;
					}
					dispatch(action.setDevice(device))
				});
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
			}else { 
				c('find record');
				serverRecord = JSON.parse(data);
				downloadPath = serverRecord.download;
				c('download path is : ' + serverRecord.download);
				// mainWindow.webContents.send('setDownloadPath',downloadPath);
				dispatch(action.setDownloadPath(serverRecord.download))
				if (serverRecord.ip != '') {
					server = 'http://'+serverRecord.ip + ':3721'
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
				}
			}
			
		});
	}



};

module.exports = findDeviceApi