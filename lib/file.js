var fileApi = {
	//get files can be seen
	getFiles : function() {
		var files = new Promise((resolve,reject)=>{ 
			var options = {
				method: 'GET',
				url: server+'/files',
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
		return files
	},

	removeFolder : function(data) {
		try{
			let uuid = null
			let fruitmixIndex = data.findIndex((item,index)=>{
				return item.parent == ''
			})
			if (fruitmixIndex == -1) {
				throw 'can not find fruitmix'
				return 
			}else {
				rootNode = data[fruitmixIndex] 
			}

			let fruitmixuuid = data[fruitmixIndex].uuid
			data.splice(fruitmixIndex,1)
			//data/fruitmix is removed
			let driveIndex = data.findIndex((item)=>{
				return item.parent == fruitmixuuid
			})
			if (driveIndex == -1) {
				throw 'can not find drive'
				return
			}else {
				rootNode = data[driveIndex] 	
			}

			let driveuuid= data[driveIndex].uuid
			data.splice(driveIndex,1)
			let uuidindex = data.findIndex((item)=>{
				return item.parent == driveuuid
			})
			if (uuidindex == -1) {
				throw 'can not find uuid folder'
				return
			}else {
				data[uuidindex].parent = ''
				data[uuidindex].attribute.name = 'my cloud'
				rootNode = data[uuidindex] 	
			}
			c('remove folder and length is : ' + data.length )
		}catch(e){
			c('remove folder failed !')
			c(e)
		}
	},
	//get files shared to me
	classifyShareFiles : function(allFiles) {
		try{
			let userUUID = user.uuid
			allFiles.forEach((item,index)=>{
				// owner is user ?
				if (item.permission.owner[0] != userUUID ) {
					// is not user
					let result = item.permission.readlist.find((readUser)=>{
						return readUser == userUUID
					})
					if (result != undefined) {
						//file is shared to user
						item.share = true
						shareFiles.push(item)
					}else {
						//is file included in shareFolder?
						var findParent = function(i) {
							if (i.parent == '') {
								//file belong to user but is not upload by client
								return
							}
							let re = allFiles.find((p)=>{
								return i.parent == p.uuid
							})
							if (re.parent == '') {
								return
							}
							let rer = re.permission.readlist.find((parentReadItem,index)=>{
								return parentReadItem == userUUID
							})
							if (rer == undefined) {
								//find parent again
								findParent(re)
							}else {
								item.share = true
								shareFiles.push(item)
							}
						}
						findParent((item))
					}
				}
			})
		}catch(err){
			c(err)
		}
		c('screen out share and length is : ' + shareFiles.length )
	},
	//generate tree
	getTree : function(f,type) {
		let fileMap = new Map()
		f.forEach(item => {
			fileMap.set(item.uuid, item)
		})
		if (type == 'share') {
			f.forEach(item => {
				let r = fileMap.get(item.parent)
				if (r == undefined ) { item.hasParent = false}
				
			})
		}
		
		f.forEach(item => {
			if (item.type == 'file' || item.children.length == 0) {
				return
			}
			item.children.map((folderChildren,index) => {
				item.children[index] = fileMap.get(folderChildren)
			})

		})

		if (type == 'share') {
			shareMap = fileMap
		}else {
			map = fileMap
		}

		return f
	},
	
	//---------------------------------------
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
					resolve(body)
				}else {
					reject(err)
				}
			}
			request(options,callback)
		})
		return file	
	},

	getFilesSharedByMe : function() {
		var promise = new Promise((resolve,reject) => {
			var options = {
				method: 'GET',
				url: server+'/files/'+uuid,
				headers: {
					Authorization: user.type+' '+user.token
				}

			}
			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					resolve(body)
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
					console.log('success')
					resolve()
				}else {
					console.log('failed')
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
					console.log('success')
					resolve()
				}else {
					console.log('failed')
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
					c('share success')
					shareCallback(null,JSON.parse(res.body))
				}else {
					c('share failed')
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
						console.log('err')
						console.log(err)
						reject(err)
					}
				}

			request(options,callback)
		})
		return rename
	}


}

module.exports = fileApi
