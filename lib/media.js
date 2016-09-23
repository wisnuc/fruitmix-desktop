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


};

module.exports = mediaApi;