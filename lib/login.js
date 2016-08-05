
// login api
var loginApi = {

	//get userList
	login : function login () {
		let login = new Promise((resolve,reject)=>{
			request(server+'/login',function(err,res,body){
				if (!err && res.statusCode == 200) {
					resolve(eval(body));
				}else {
					reject(err)
				}
			})
		});
		return login;
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
					resolve(JSON.parse(body));
				}else {
					reject(err)
				}
			});
		});
		return a;
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
			};
			function callback (err,res,body) {
				if (!err && res.statusCode == 200) {
					resolve(JSON.parse(body));
				}else {
					reject(err)
				}
			}
			request(options,callback);
		});
		return promise
	}
};

module.exports = loginApi