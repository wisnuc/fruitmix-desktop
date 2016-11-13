import Debug from 'debug'
import request from 'request'

const debug = Debug('lib:server')

import store from '../serve/store/store'

// TODO token can also be auth, or not provided 
export const requestGet = (url, token, callback) => {

  // auth-less
  if (typeof token === 'function') {
    callback = token
    token = null
  }

  let opts = { method: 'GET', url }
  if (typeof token === 'string')
    opts.headers = { Authorization: 'JWT ' + token }
  else if (typeof token === 'object' && token !== null) {
    opts.auth = token
  }

  debug('requestGet, opts', opts)

  request.get(opts, (err, res) => {
    if (err) return callback(err)
    if (res.statusCode !== 200) {
      let e = new Error('http status code not 200')
      e.code = 'EHTTPSTATUS'
      e.status = res.statusCode
      return callback(e)
    }

    try {
      let obj = JSON.parse(res.body)
      return callback(null, obj)
    }
    catch (e) {
      console.log('req GET json parse err')
      console.log(e)
      let e1 = new Error('json parse error')
      e1.code === 'EJSONPARSE'
      return callback(e1)
    }
  })
}

export const requestGetAsync = Promise.promisify(requestGet)

export const updateLoginUsersAsync = async () => {

  let ip = store.getState().config.ip
  let port = 3721

  let lusers = await requestGetAsync(`http://${ip}:${port}/login`)

  debug('update login users', lusers)

  store.dispatch({
    type: 'SERVER_UPDATE_LOGIN_USERS',
    data: lusers
  })
}

export const tryLoginAsync = async (username, password) => {

  debug('tryLoginAsync', username, password)

  await updateLoginUsersAsync()

  // TODO invalid state
  let ip = store.getState().config.ip
  let port = 3721
  let loginUsers = store.getState().server.loginUsers
  let userUUID = loginUsers.find(usr => usr.username === username).uuid

  debug('requesting token', userUUID, password)

  let tok = await requestGetAsync(`http://${ip}:${port}/token`, {
    username: userUUID, password
  })

  debug('tryLoginAsync, token', tok)
  return tok
}

export const retrieveUsers = async (token) => {
  
  let ip = store.getState().config.ip
  let port = 3721

  return requestGetAsync(`http://${ip}:${port}/users`, token)
}


