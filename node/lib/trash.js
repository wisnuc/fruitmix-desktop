var upload = {
	createFolder: function(name,dir) {
		var _this = this
		var options = {
			url:server+'/files/'+dir.uuid,
			method:'post',
			headers: {
				Authorization: user.type+' '+user.token,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name:name
			})
		}
		request(options,function (err,res,body) {
			if (!err && res.statusCode == 200) {

			}else {

			}
		})
	},

	uploadFile: function(file) {
		var _this = this;
		let body = 0;
		
		let transform = new stream.Transform({
			transform: function(chunk, encoding, next) {
				body+=chunk.length;
				this.push(chunk)
				next();
			}
		})
		
		let hash = crypto.createHash('sha256')
		hash.setEncoding('hex')
		let fileStream = fs.createReadStream(file.path)

		fileStream.on('end',() => {
			hash.end()
			let sha = hash.read()

			var tempStream = fs.createReadStream(file.path).pipe(transform);
			tempStream.path = file.path

			var options = {
				url:server+'/files/'+file.parent,
				method:'post',
				headers: {
					Authorization: user.type+' '+user.token
				},
				formData : {
					'sha256' : sha,
					'file' : tempStream
				}

			}
			request(options,function (err,res,body) {
				if (!err && res.statusCode == 200) {
					file.uuid = JSON.parse(body).uuid
				}else {
					c('create folder failed')
				}
			})
		})

		fileStream.pipe(hash)	
	},
}

var download = {
	download: function(item) {
		var _this = this
		var options = {
			method: 'GET',
			url: server+'/files/'+item.uuid,
			headers: {
				Authorization: user.type+' '+user.token
			}
		}
		function callback (err,res,body) {
			if (!err && res.statusCode == 200) {
				
			}else {
				fs.unlink(path.join(downloadPath,item.name),err=>{
					c('删除下载失败文件成功')
				})
			}
		}
		var stream = fs.createWriteStream(path.join(downloadPath,item.name))

		request(options,callback).on('data',function(d){
			body += d.length
		}).pipe(stream)
	},
}

var mediaApi = {
	getMediaData : function () {
		var media = new Promise((resolve,reject)=>{ 
			var options = {
				method: 'GET',
				url: server+'/media',
				headers: {
					Authorization: user.type+' '+user.token
				}

			};
			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					resolve(JSON.parse(body));
				}else {
					reject(err);
				}
			}
			request(options,callback);
		});
		return media;
	},

	downloadMediaImage : function(hash) {
		var promise = new Promise((resolve,reject)=>{
			var options = {
				method: 'GET',
				url: server+'/media/'+hash+'/download',
				headers: {
					Authorization: user.type+' '+user.token
				}
			}
			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					resolve()
				}else {
					reject()
				}
			}
			var stream = fs.createWriteStream(path.join(mediaPath,hash))
			request(options,callback).pipe(stream)
		})
		return promise
	},

	getMediaShare : function() {
		var promise = new Promise((resolve,reject) => {
			var options = {
				method : 'GET',
				url : server + '/mediaShare',
				headers : {
					Authorization: user.type+' '+user.token	
				}
			}

			function callback(err,res,body) {
				if (!err && res.statusCode == 200) {
					resolve(JSON.parse(body))
				}else {
					reject()
				}
			}

			request(options,callback)
		})

		return promise
	},

	createMediaShare : function(medias, users, album) {
		var promise = new Promise((resolve, reject) => {
			var b
			if (album) {
				b = JSON.stringify({
					viewers : users,
					contents : medias,
					album : album
				})
			}else {
				b = JSON.stringify({
					viewers : users,
					contents : medias
				})
			}
			var options = {
				method : 'post',
				url : server + '/mediaShare',
				headers : {
					Authorization: user.type+' '+user.token,
					'Content-Type': 'application/json'
				},
				body: b
			}

			function callback(err,res,body) {
				if (!err && res.statusCode == 200) {
					resolve(JSON.parse(body))
				}else {
					reject(err)
				}
			}
			request(options,callback)
		})
		return promise
	}
}

var loginApi = {
	//get userList
	login : function () {
		let login = new Promise((resolve,reject)=>{
			request(server+'/login',function(err,res,body){
				if (!err && res.statusCode == 200) {
					resolve(eval(body))
				}else {
					reject(err)
				}
			})
		})
		return login
	},
	//get token
	getToken : function (uuid,password) {
		let a = new Promise((resolve,reject)=>{
			request.get(server+'/token',{
				'auth': {
				    'user': uuid,
				    'pass': password,
				    'sendImmediately': false
				  }
			},function(err,res,body) {
				if (!err && res.statusCode == 200) {
					resolve(JSON.parse(body))
				}else {
					reject(err)
				}
			})
		})
		return a
	},
	//get all usersDetail
	getAllUser : function () {
		var promise = new Promise((resolve,reject)=>{
			var options = {
				method: 'GET',
				url: server+'/users',
				headers: {
					Authorization: user.type+' '+user.token
				}
			}
			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					var users = JSON.parse(body)
					users.forEach(item => {
						item.checked == false
					})
					resolve(users)
				}else {
					reject(err)
				}
			}
			request(options,callback)
		})
		return promise
	},

	createNewUser : function(username, password) {
		var promise = new Promise((resolve,reject) => {
			var options = {
				method : 'post',
				url : server + '/users',
				headers : {
					Authorization : user.type + ' ' + user.token,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username : username,
					password : password
				})
			}

			var callback = function(err, res, body) {
				if (!err && res.statusCode == 200) {
					resolve(JSON.parse(res.body))
				}else {
					c(res)
					reject(err)
				}
			}
			request(options, callback)
		})
		return promise
	},

	deleteUser : function(uuid) {
		var promise = new Promise((resolve,reject) => {
			var options = {
				method : 'delete',
				url : server + '/users',
				headers : {
					Authorization : user.type + ' ' + user.token,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					uuid : uuid
				})
			}

			var callback = function(err, res, body) {
				if (!err && res.statusCode == 200) {
					c('success')
					c(body)
					resolve(JSON.parse(res.body))
				}else {
					c('err')
					c(res)
					reject(err)
				}
			}
			request(options, callback)
		})
		return promise
	},

	userInit : function(serveIP, username, password) {
		var promise = new Promise((resolve,reject) => {
			var options = {
				method : 'post',
				url : serveIP + '/init',
				headers : {
					Authorization : user.type + ' ' + user.token,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username : username,
					password : password
				})
			}

			var callback = function(err, res, body) {
				if (!err && res.statusCode == 200) {
					c('success')
					c(body)
					resolve(JSON.parse(res.body))
				}else {
					c('err')
					c(res)
					reject(err)
				}
			}
			request(options, callback)
		})
		return promise	
	}
}

var fileApi = {
	getDrive : function() {
		var drive = new Promise((resolve,reject) => {
				var options = {
					method: 'GET',
					url: server+'/drives',
					headers: {
						Authorization: user.type+' '+user.token
					}

				}
				function callback (err,res,body) {
					if (!err && res.statusCode == 200) {
						resolve(JSON.parse(body))
					}else {
						reject(err)
					}
				}
				request(options,callback)
		})
		return drive
	},

	getFile : function(uuid) {
		var file = new Promise((resolve,reject) => {
			var options = {
				method: 'GET',
				url: server+'/files/'+uuid,
				headers: {
					Authorization: user.type+' '+user.token
				}

			}
			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					resolve(JSON.parse(body))
				}else {
					reject(err)
				}
			}
			request(options,callback)
		})
		return file	
	},

	getFilesSharedWithMe : function() {
		var promise = new Promise((resolve,reject) => {
			var options = {
				method: 'GET',
				url: server+'/share/sharedWithMe',
				headers: {
					Authorization: user.type+' '+user.token
				}

			}
			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					resolve(JSON.parse(body))
				}else {
					reject(err)
				}
			}
			request(options,callback)
		})
		return promise	
	},

	getFilesSharedWithOthers : function() {
		var promise = new Promise((resolve,reject) => {
			var options = {
				method: 'GET',
				url: server+'/share/sharedWithOthers',
				headers: {
					Authorization: user.type+' '+user.token
				}

			}
			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					resolve(JSON.parse(body))
				}else {
					reject(err)
				}
			}
			request(options,callback)
		})
		return promise	
	},

	deleteFile : function(objUUID,dirUUID) {
		let promise = new Promise((resolve,reject)=>{
			var options = {
				method: 'delete',
				url: server+'/files/' + dirUUID + '/' + objUUID,
				headers: {
					Authorization: user.type+' '+user.token
				}

			}

			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					resolve()
				}else {
					reject()
				}
			}

			request(options,callback)

		})
		return promise
	},

	rename : function(uuid,name) {
		var promise = new Promise((resolve, reject) => {
			var options = {
				method: 'delete',
				url: server+'/files/' + dirUUID + '/' + objUUID,
				headers: {
					Authorization: user.type+' '+user.token
				}

			}

			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					resolve()
				}else {
					reject()
				}
			}

			request(options,callback)
		})
		return promise
	},

	share : function(uuid,users,shareCallback) {
		var options = {
				method : 'patch',
				url : server + '/files/' + currentDirectory.uuid +'/' + uuid,
				headers : {
					Authorization : user.type + ' ' + user.token,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ writelist: users, readlist: users })
			}

			var callback = function(err, res, body) {
				if (!err && res.statusCode == 200) {
					shareCallback(null,JSON.parse(res.body))
				}else {
					shareCallback('err',null)
				}
			}
		request(options, callback)
	},

	rename : function(uuid,name,oldName) {
		let rename = new Promise((resolve,reject)=>{
			var options = {
				method: 'patch',
				url: server+'/files/'+ currentDirectory.uuid + '/' + uuid,
				headers: {
						Authorization: user.type+' '+user.token
					},
				form: {name:name}
			}

			function callback (err,res,body) {
				console.log(res)
					if (!err && res.statusCode == 200) {
						console.log('res')
					}else {
						reject(err)
					}
				}

			request(options,callback)
		})
		return rename
	}
}