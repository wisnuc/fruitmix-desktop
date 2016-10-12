var mediaApi = {
	//getMediaData
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
					c('err : ')
					c(res.body)
					c(err)

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
					c('has err :')
					c(res.body)
					c(err)
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
					c('has err :')
					c(res.body)
					c(err)
					reject(err)
				}
			}

			request(options,callback)
		})
		return promise
	}


};

module.exports = mediaApi;