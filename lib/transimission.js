
// transimission api
var transimission = {
	createFolder: function(name,dir) {
		var _this = this;
		var r = request.post(server+'/files/'+dir.uuid+'?type=folder',{
			headers: {
				Authorization: user.type+' '+user.token
			},
		},function (err,res,body) {
			if (!err && res.statusCode == 200) {
				console.log('res');
				var uuid = body;
				uuid = uuid.slice(1,uuid.length-1);
				_this.modifyFolder(name,dir,uuid,true);
			}else {
				mainWindow.webContents.send('message','新建文件夹失败');
				console.log('err');
				console.log(res);
				console.log(err);
			}
		});
		var form = r.form();
		form.append('foldername',name);
	},

	modifyFolder: function(name,dir,folderuuid,send) {
		//insert uuid
		var t = (new Date()).toLocaleString();
		var folder = {
			uuid:folderuuid,
			parent: dir.uuid,
			checked: false,
			share:false,
			attribute: {
				name:name,
				size: 4096,
				changetime: t,
				createtime: t,
			},
			type: 'folder',
			children:[],
			name:name,
			owner:[''],
			readlist:[''],
			writelist:['']
		};
		//insert folder obj into map
		map.set(folderuuid,folder);
		let parentNode = map.get(dir.uuid);
		parentNode.children.push(folder)
		if (dir.uuid == currentDirectory.uuid) {
			//get children
			children = parentNode.children.map(item => Object.assign({},item,{children:null}))
			//ipc
			if (send) {
				mainWindow.webContents.send('message','新建文件夹成功');
			}
			mainWindow.webContents.send('uploadSuccess',folder,_.cloneDeep(children));
		}
	}
};

module.exports = transimission


