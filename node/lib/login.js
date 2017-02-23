import { ipcMain } from 'electron'
import Debug from 'debug'
import store from '../serve/store/store'
import { request, requestAsync, serverAddr } from './async'
import { requestGetAsync, tryLoginAsync, retrieveUsers } from './server'

const debug = Debug('lib:login')

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
ipcMain.on('setServerIp',(err, ip)=>{

	debug('setServerIp', ip)

  store.dispatch({
    type: 'CONFIG_SET_IP',
    data: ip
  })
})

ipcMain.on('login', (err, user, pass) => loginHandler(err, user, pass))

ipcMain.on('loginOff', evt => {
  debug('loginOff')
  dispatch({type: 'LOGIN_OFF'})
})








