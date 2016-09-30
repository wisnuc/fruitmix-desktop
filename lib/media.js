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
			c('1')
			c(hash)
			var stream = fs.createWriteStream(path.join(mediaPath,hash))
			c('2')
			request(options,callback).pipe(stream)
			c('3')
		})
		return promise
	}


};

module.exports = mediaApi;