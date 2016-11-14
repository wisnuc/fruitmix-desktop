import { request, requestAsync, serverAddr } from './async'

import Debug from 'debug'
import store from '../serve/store/store'
import { requestGetAsync,
  tryLoginAsync, retrieveUsers } from './server'

const debug = Debug('lib:login')

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

/**
{ uuid: 'db0b4645-6339-4f68-810a-2a10ca76867a',
  username: 'admin',
  avatar: null,
  unixUID: 2000,
  token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1dWlkIjoiZGIwYjQ2NDUtNjMzOS00ZjY4LTgxMGEtMmExMGNhNzY4NjdhIn0.y2nX2rFzdypPX2d3u3fBHtR8TAStvlSj3XPj10s5p4g',
  type: 'JWT',
  users: 
   [ { uuid: 'db0b4645-6339-4f68-810a-2a10ca76867a',
       username: 'admin',
       avatar: null,
       unixUID: 2000,
       checked: false,
       color: '#00bcd4' },
     { uuid: '345c87e1-7b79-40d8-b0a8-83a2f1a07a04',
       username: '1',
       avatar: null,
       unixUID: 2001,
       checked: false,
       color: '#00bcd4' },
     { uuid: '99aeffe6-4fb1-410e-80dd-02b2a97fb9f2',
       username: '我和你',
       avatar: null,
       unixUID: 2002,
       checked: false,
       color: '#8BC34C' },
     { uuid: 'd781c358-cfe7-4423-b687-5c31cae1f4c7',
       username: '心连心',
       avatar: null,
       unixUID: 2003,
       checked: false,
       color: '#FFC107' },
     { uuid: '39a2be62-ea9a-4e16-95af-77c82ec38a66',
       username: '同住地球村',
       avatar: null,
       unixUID: 2004,
       checked: false,
       color: '#FFC107' } ],
  allUser: 
   [ { type: 'local',
       uuid: 'db0b4645-6339-4f68-810a-2a10ca76867a',
       username: 'admin',
       avatar: null,
       email: null,
       isAdmin: true,
       isFirstUser: true,
       home: '1dff495e-dd38-4a3b-807b-b3977071c190',
       library: 'd09457bd-7c5e-442e-b934-1fbaa37ac9e5',
       unixUID: 2000 },
     { type: 'local',
       uuid: '345c87e1-7b79-40d8-b0a8-83a2f1a07a04',
       username: '1',
       avatar: null,
       email: null,
       isAdmin: false,
       isFirstUser: false,
       home: 'f0073ecf-75a2-4ce2-9dfe-d469426e678c',
       library: '3745fb14-e794-41f8-bcd4-4599ae6e53af',
       unixUID: 2001 },
     { type: 'local',
       uuid: '99aeffe6-4fb1-410e-80dd-02b2a97fb9f2',
       username: '我和你',
       avatar: null,
       email: null,
       isAdmin: false,
       isFirstUser: false,
       home: '5cc42eaa-b6ac-49fb-b449-02f7074132ca',
       library: 'd0732d8b-5c1a-4816-a9ef-b61555185d2d',
       unixUID: 2002 },
     { type: 'local',
       uuid: 'd781c358-cfe7-4423-b687-5c31cae1f4c7',
       username: '心连心',
       avatar: null,
       email: null,
       isAdmin: false,
       isFirstUser: false,
       home: '6dae565d-0389-429c-92e3-f2e7fce106a6',
       library: '749fa4e6-c24f-4afc-a03b-4dcfd3fa69d8',
       unixUID: 2003 },
     { type: 'local',
       uuid: '39a2be62-ea9a-4e16-95af-77c82ec38a66',
       username: '同住地球村',
       avatar: null,
       email: null,
       isAdmin: false,
       isFirstUser: false,
       home: '8dce26bf-a37c-498f-a8d9-f566bc477d5e',
       library: '1aa9a034-e82c-4e98-8814-ee8043905574',
       unixUID: 2004 } ] }
**/

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


















