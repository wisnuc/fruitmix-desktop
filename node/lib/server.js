import Debug from 'debug'
import request from 'request'
import fs from 'fs'
import path from 'path'
import util from 'util'
import crypto from 'crypto'
import UUID from 'node-uuid'
import store from '../serve/store/store'

Promise.promisifyAll(fs) // babel would transform Promise to bluebird

const debug = Debug('lib:server')
const getIpAddr = () => store.getState().login.device.mdev.address
const getToken = () => store.getState().login.device.token.data.token
const getTmpPath = () => store.getState().config.tmpPath
const getTmpTransPath = () => store.getState().config.tmpTransPath

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

  const tmpPath = path.join(getTmpPath(), UUID.v4())
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

export const retrieveUsers = async (token) => {
  const ip = getIpAddr()
  const port = 3000

  return requestGetAsync(`http://${ip}:${port}/users`, null, token)
}

export const serverGetAsync = async (endpoint, qs) => {
  debug('serverGetAsync', endpoint, qs)

  const ip = getIpAddr()
  const port = 3000
  const token = getToken()
  return requestGetAsync(`http://${ip}:${port}/${endpoint}`, qs, token)
}

export const serverDeleteAsync = async (endpoint) => {
  const ip = getIpAddr()
  const port = 3000
  const token = getToken()
  return requestDeleteAsync(`http://${ip}:${port}/${endpoint}`, token)
}

export const serverPostAsync = async (endpoint, body) => {
  const ip = getIpAddr()
  const port = 3000
  const token = getToken()
  return requestPostAsync(`http://${ip}:${port}/${endpoint}`, token, body)
}

export const serverPatchAsync = async (endpoint, body) => {
  const ip = getIpAddr()
  const port = 3000
  const token = getToken()
  return requestPatchAsync(`http://${ip}:${port}/${endpoint}`, token, body)
}

export const serverDownloadAsync = (endpoint, qs, downloadPath, name) => {
  const ip = getIpAddr()
  const port = 3000
  const token = getToken()
  return requestDownloadAsync(`http://${ip}:${port}/${endpoint}`, qs, token, downloadPath, name)
}


/** *********************************************************
new api TODO
 ***********************************************************/

/* init request */
let server
let tokenObj
let Authorization
const initArgs = () => {
  server = `http://${store.getState().login.device.mdev.address}:3000`
  tokenObj = store.getState().login.device.token.data
  Authorization = `${tokenObj.type} ${tokenObj.token}`
}

/**
Upload a single file using request formData

@param {string} driveUUID
@param {string} dirUUID
@param {string} name
@param {object} part
@param {string} part.start
@param {string} part.end
@param {string} part.sha
@param {string} part.fingerpringt
@param {object} readStream
@param {function} callback
*/

export const uploadFileWithStream = (driveUUID, dirUUID, name, part, readStream, callback) => {
  initArgs()
  let formDataOptions = {
    size: part.end ? part.end - part.start + 1 : 0,
    sha256: part.sha
  }
  if (part.start) formDataOptions = Object.assign(formDataOptions, { append: part.fingerprint })

  const op = {
    url: `${server}/drives/${driveUUID}/dirs/${dirUUID}/entries`,
    headers: { Authorization },
    formData: {
      [name]: {
        value: readStream,
        options: JSON.stringify(formDataOptions)
      }
    }
  }
  request.post(op, (error, data) => {
    if (error) {
      console.log('error', error)
    } else if (callback) callback()
  })
}

export const uploadFileWithStreamAsync = Promise.promisify(uploadFileWithStream)

/**
Upload multiple files in one request.post

@param {string} driveUUID
@param {string} dirUUID
@param {Object[]} Files
@param {string} Files[].name
@param {Object} Files[].parts
@param {Object} Files[].readStream
@param {function} callback
*/

export class UploadMultipleFiles {
  constructor(driveUUID, dirUUID, Files, callback) {
    this.driveUUID = driveUUID
    this.dirUUID = dirUUID
    this.Files = Files
    this.callback = callback
    this.handle = null
  }

  upload() {
    initArgs()

    this.handle = request.post({ url: `${server}/drives/${this.driveUUID}/dirs/${this.dirUUID}/entries`, headers: { Authorization } })

    this.handle.on('end', (error, response) => {
      if (error) return this.callback(error)
      if (response && response.statusCode !== 200) return this.callback(`Respose not 200 but ${response.statusCode}`)
      return this.callback(null)
    })

    const form = this.handle.form()

    this.Files.forEach((file) => {
      const { name, parts, readStreams } = file
      for (let i = 0; i < parts.length; i++) {
        const rs = readStreams[i]
        const part = parts[i]
        let formDataOptions = {
          size: part.end ? part.end - part.start + 1 : 0,
          sha256: part.sha
        }
        if (part.start) formDataOptions = Object.assign(formDataOptions, { append: part.fingerprint })
        form.append(name, rs, JSON.stringify(formDataOptions))
      }
    })
  }

  abort() {
    if (this.handle) this.handle.abort()
  }
}

export class DownloadFile {
  constructor(driveUUID, dirUUID, entryUUID, fileName, newName, downloadPath, callback) {
    this.driveUUID = driveUUID
    this.dirUUID = dirUUID
    this.entryUUID = entryUUID
    this.fileName = fileName
    this.newName = newName
    this.downloadPath = downloadPath
    this.callback = callback
    this.handle = null
  }

  download() {
    initArgs()
    const options = {
      method: 'GET',
      url: this.dirUUID === 'media'
      ? `${server}/media/${this.entryUUID}`
      : `${server}/drives/${this.driveUUID}/dirs/${this.dirUUID}/entries/${this.entryUUID}`,

      headers: {
        Authorization,
        // Range: wrapper.size ? `bytes=${this.wrapper.seek}-` : undefined
      },
      qs: this.dirUUID === 'media' ? { alt: 'data' } : { name: this.fileName }
    }

      /*
    const streamOptions = {
      flags: this.wrapper.seek === 0 ? 'w' : 'r+',
      start: this.wrapper.seek,
      defaultEncoding: 'utf8',
      fd: null,
      mode: 0o666,
      autoClose: true
    }
    */

    const absPath = path.join(this.downloadPath, this.newName)
    const stream = fs.createWriteStream(absPath)
    // const stream = fs.createWriteStream(this.tmpDownloadPath, streamOptions)

    stream.on('error', err => console.log('stream error trigger', err))

    stream.on('drain', () => {
      /*
      const gap = stream.bytesWritten - this.wrapper.lastTimeSize
      this.wrapper.seek += gap
      this.wrapper.manager.completeSize += gap
      this.wrapper.lastTimeSize = stream.bytesWritten
      wrapper.manager.updateStore()
      */
    })

    stream.on('finish', () => {
      /*
      const gap = stream.bytesWritten - this.wrapper.lastTimeSize
      this.wrapper.seek += gap
      this.wrapper.manager.completeSize += gap
      this.wrapper.lastTimeSize = stream.bytesWritten

      console.log(`一段文件写入结束 当前seek位置为 ：${this.wrapper.seek}, 共${this.wrapper.size}`)

      this.wrapper.lastTimeSize = 0
      if (this.wrapper.seek >= this.wrapper.size) this.rename(this.tmpDownloadPath)
      */
    })

    this.handle = request(options)
    this.handle.on('end', (error, response, body) => {
      if (error) return this.callback(error)
      if (response && response.statusCode && (response.statusCode !== 200 && response.statusCode !== 206)) {
        return this.callback(Error('response code not 200'))
      }
      return this.callback(null)
    })

    this.handle.pipe(stream)
  }

  abort() {
    if (this.handle) this.handle.abort()
  }
}

/**
createFold

@param {string} driveUUID
@param {string} dirUUID
@param {string} dirname
@param {function} callback
*/

export const createFold = (driveUUID, dirUUID, dirname, callback) => {
  initArgs()
  const op = {
    url: `${server}/drives/${driveUUID}/dirs/${dirUUID}/entries`,
    headers: { Authorization },
    formData: {
      [dirname]: JSON.stringify({ op: 'mkdir' })
    }
  }

  const op2 = {
    url: `${server}/drives/${driveUUID}/dirs/${dirUUID}`,
    headers: { Authorization }
  }

  /*
  console.log(`>>>>>>>>>>>create Fold`)
  console.log(op)
  console.log('<<<<<<<<<<< start')
  */
  request.post(op, (error) => {
    if (error) {
      console.log('error', error)
      if (callback) callback(error)
    } else {
      request.get(op2, (err, data) => {
        if (err) {
          if (callback) callback(err)
          console.log('error', data)
        } else {
          // console.log(`create Fold ${dirname} success`)
          if (callback) callback(err, JSON.parse(data.body).entries)
          return JSON.parse(data.body).entries
        }
      })
    }
  })
}

export const createFoldAsync = Promise.promisify(createFold)

/**
downloadFile

@param {string} driveUUID
@param {string} dirUUID
@param {string} entryUUID
@param {string} fileName
@param {string} downloadPath
@param {function} callback
*/

export const downloadFile = async (driveUUID, dirUUID, entryUUID, fileName, downloadPath, callback) => {
  initArgs()
  const filePath = path.join(getTmpPath(), `${entryUUID}AND${fileName}`)
  fs.access(filePath, (error) => {
    if (!error) {
      console.log('find file', fileName)
      return callback(null, filePath)
    }
    console.log('no file', fileName)
    const tmpPath = downloadPath || path.join(getTmpTransPath(), entryUUID)
    const options = {
      method: 'GET',
      url: `${server}/drives/${driveUUID}/dirs/${dirUUID}/entries/${entryUUID}`,
      headers: { Authorization },
      qs: { name: fileName }
    }

    const stream = fs.createWriteStream(tmpPath)
    stream.on('finish', () => {
      // if (!downloadPath) // TODO rename
      fs.rename(tmpPath, filePath, (err) => {
        if (err) return callback(err)
        return callback(null, filePath)
      })
    })
    const handle = request(options).on('error', err => callback(err))
    handle.pipe(stream)
  })
}
