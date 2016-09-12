global.request = require('request')
var user = {type : 'JWT' , token : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1dWlkIjoiNWRhOTIzMDMtMzNhMS00Zjc5LThkOGYtYTdiNmJlY2RlNmMzIn0.79bUgRf9-m0KYP42_BV06yjtxaxgqYIiNdiIJIXfRMM"}
var server = "http://192.168.5.88:3721"
var c = console.log
var createFolder = function(name,dir) {
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
				c('create folder ' + name + ' success')
				c(typeof body)
				// var uuid = body;
				// uuid = uuid.slice(1,uuid.length-1);
				// _this.modifyFolder(name,dir,uuid,true);
			}else {
				c('create folder ' + name + ' failed')
				c(err)
			}
		})
	}

	createFolder('test123',{uuid:"b9aa7c34-8b86-4306-9042-396cf8fa1a9c"})