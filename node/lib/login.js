import { ipcMain } from 'electron'
import { request, requestAsync, serverAddr } from './async'

import Debug from 'debug'
import store from '../serve/store/store'
import { requestGetAsync, tryLoginAsync, retrieveUsers } from './server'

const debug = Debug('lib:login')
// FIXME
const c = debug

// login api
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

export default loginApi

// this function handles user login from front end.
// input: username, password
// output: 
//   1. retrieve token - login
//   2. user info (me) - login .obj
//   3. update user list - login
//   4. update config (persistent) TODO
export const loginHandler = (err, username, password) => 
  (async () => {
    try {

      // { type:xxx, token:xxx }
      let token = await tryLoginAsync(username, password)
      debug('loginHandler, token', token)

      let users = await retrieveUsers(token.token)
      debug('loginHandler, users', users)

      let me = users.find(usr => usr.username === username) 
      dispatch({
        type: 'LOGGEDIN',
        obj: Object.assign(me, token) 
      })

      if (me.isAdmin) 
        dispatch({
          type: 'SERVER_UPDATE_USERS',
          data: users
        })

      debug('loginHandler, store state', store.getState())
    }
    catch (e) {
      console.log(e) 
    }
  })().asCallback(err => console.log(err))

//setIp
ipcMain.on('setServerIp',(err, ip, isCustom, isStorage)=>{

	debug('setServerIp', ip)

  store.dispatch({
    type: 'CONFIG_SET_IP',
    data: ip
  })
})

ipcMain.on('delServer',(err, i)=>{
	// let index = device.findIndex(item=>{
	// 	return item.addresses[0] == i.addresses[0]
	// })
	// device.splice(index,1)

	dispatch(action.deleteServer(i))

  store.dispatch({
    type: 'CONFIG_DELETE_CUSTOM_DEVICE',
    data: i.address
  })
})

ipcMain.on('login', (err, user, pass) => loginHandler(err, user, pass))

ipcMain.on('loginOff', evt => {
  debug('loginOff')
  dispatch({type: 'LOGIN_OFF'})
})








