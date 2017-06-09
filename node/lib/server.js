import Debug from 'debug'
import request from 'request'
import fs from 'fs'
import path from 'path'
import util from 'util'

const debug = Debug('lib:server')
import UUID from 'node-uuid'

import store from '../serve/store/store'

const getIpAddr = () => store.getState().login.device.mdev.address
const getToken = () => store.getState().login.device.token.data.token

// TODO token can also be auth, or not provided
const requestGet = (url, qs, token, callback) => {
  // auth-less
  if (typeof token === 'function') {
    callback = token
    token = null
  }

  const opts = { method: 'GET', url }
  if (qs) opts.qs = qs
  if (typeof token === 'string') { opts.headers = { Authorization: `JWT ${token}` } } else if (typeof token === 'object' && token !== null) {
    opts.auth = token
  }

  debug('requestGet, opts', opts)

  request.get(opts, (err, res) => {
    if (err) return callback(err)
    if (res.statusCode !== 200) {
      const e = new Error('http status code not 200')
      e.code = 'EHTTPSTATUS'
      e.status = res.statusCode
      e.url = url
      return callback(e)
    }

    try {
      const obj = JSON.parse(res.body)
      return callback(null, obj)
    } catch (e) {
      console.log('req GET json parse err')
      console.log(e)
      const e1 = new Error('json parse error')
      e1.code === 'EJSONPARSE'
      return callback(e1)
    }
  })
}

export const requestGetAsync = Promise.promisify(requestGet)

const requestDownload = (url, qs, token, downloadPath, name, callback) => {
  const opts = { method: 'GET', url }
  if (qs) opts.qs = qs
  if (typeof token === 'string') { opts.headers = { Authorization: `JWT ${token}` } } else if (typeof token === 'object' && token !== null) {
    opts.auth = token
  }

  const tmpPath = path.join(global.tmpPath, UUID.v4())
  const dst = path.join(downloadPath, name)

  const stream = fs.createWriteStream(tmpPath)
  request(opts, (err, res) => {
    if (err) return callback(err)
    if (res.statusCode !== 200) {
      console.log(res.body)
      const e = new Error('http status code not 200')
      e.code = 'EHTTPSTATUS'
      e.status = res.statusCode
      return callback(e)
    }

    try {
      fs.renameSync(tmpPath, dst)
      return callback(null, null)
    } catch (e) {
      console.log('req GET json parse err')
      console.log(e)
      const e1 = new Error('json parse error')
      e1.code === 'EJSONPARSE'
      return callback(e1)
    }
  }).pipe(stream)
}

export const requestDownloadAsync = Promise.promisify(requestDownload)

const requestPost = (url, token, body, callback) => {
  const opts = { method: 'POST', url, body: JSON.stringify(body) }
  opts.headers = {
    Authorization: `JWT ${token}`,
    'Content-Type': 'application/json'
  }

  debug('requestPost', opts)
  request(opts, (err, res) => {
    if (err) return callback(err)
    if (res.statusCode !== 200) {
      const e = new Error('http status code not 200')
      e.code = 'EHTTPSTATUS'
      e.status = res.statusCode
      return callback(e)
    }
    callback(null, res.body)
  })
}

const requestPostAsync = Promise.promisify(requestPost)

const requestPatch = (url, token, body, callback) => {
  const opts = { method: 'PATCH', url, body: JSON.stringify(body) }
  opts.headers = {
    Authorization: `JWT ${token}`,
    'Content-Type': 'application/json'
  }

  debug('requestPatch', opts)

  request(opts, (err, res) => {
    if (err) return callback(err)
    if (res.statusCode !== 200) {
      const e = new Error('http status code node 200')
      e.code = 'EHTTPSTATUS'
      e.status = res.statusCode
      return callback(e)
    }
    callback(null, res.body)
  })
}

const requestPatchAsync = Promise.promisify(requestPatch)

const requestDelete = (url, token, callback) => {
  const opts = { method: 'DELETE', url }
  opts.headers = { Authorization: `JWT ${token}` }

  debug('requestDelete, opts', opts)

  request(opts, (err, res) => {
    if (err) return callback(err)
    if (res.statusCode !== 200) {
      console.log('a delete error ~~~~~~~~~~~~')
      const e = new Error('http status code not 200')
      e.code = 'EHTTPSTATUS'
      e.status = res.statusCode
      return callback(e)
    }
    console.log('a delete finish ~~~~~~~~~~~~')
    callback(null)
  })
}

const requestDeleteAsync = Promise.promisify(requestDelete)

const updateUsersAsync = async () => {
  const ip = getIpAddr()
  const port = 3721

  const users = await requestGetAsync(`http://${ip}:${port}/login`, null)

  debug('update users', users)

  store.dispatch({
    type: 'SERVER_UPDATE_USERS',
    data: users
  })
}

// TODO username should be UUID
export const tryLoginAsync = async (username, password) => {
  debug('tryLoginAsync', username, password)

  await updateUsersAsync()

  // TODO invalid state
  const ip = getIpAddr()
  const port = 3721
  const users = store.getState().server.users
  const userUUID = users.find(usr => usr.username === username).uuid

  debug('requesting token', userUUID, password)

  const tok = await requestGetAsync(`http://${ip}:${port}/token`, null, {
    username: userUUID, password
  })

  debug('tryLoginAsync, token', tok)
  return tok
}

export const retrieveUsers = async (token) => {
  const ip = getIpAddr()
  const port = 3721

  return requestGetAsync(`http://${ip}:${port}/users`, null, token)
}

export const serverGetAsync = async (endpoint, qs) => {
  debug('serverGetAsync', endpoint, qs)

  const ip = getIpAddr()
  const port = 3721
  const token = getToken()
  return requestGetAsync(`http://${ip}:${port}/${endpoint}`, qs, token)
}

export const serverDeleteAsync = async (endpoint) => {
  const ip = getIpAddr()
  const port = 3721
  const token = getToken()
  return requestDeleteAsync(`http://${ip}:${port}/${endpoint}`, token)
}

export const serverPostAsync = async (endpoint, body) => {
  const ip = getIpAddr()
  const port = 3721
  const token = getToken()
  return requestPostAsync(`http://${ip}:${port}/${endpoint}`, token, body)
}

export const serverPatchAsync = async (endpoint, body) => {
  const ip = getIpAddr()
  const port = 3721
  const token = getToken()
  return requestPatchAsync(`http://${ip}:${port}/${endpoint}`, token, body)
}

export const serverDownloadAsync = (endpoint, qs, downloadPath, name) => {
  const ip = getIpAddr()
  const port = 3721
  const token = getToken()
  return requestDownloadAsync(`http://${ip}:${port}/${endpoint}`, qs, token, downloadPath, name)
}
