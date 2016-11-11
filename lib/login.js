var request = require('request')
// login api
var loginApi = {

	//get userList
	login : function login () {
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

module.exports = loginApi
