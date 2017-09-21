import fs from 'fs'
import path from 'path'
import Debug from 'debug'
import UUID from 'node-uuid'
import request from 'request'
import store from './store'

Promise.promisifyAll(fs) // babel would transform Promise to bluebird

const debug = Debug('node:lib:server')
const getIpAddr = () => store.getState().login.device.mdev.address
const getToken = () => store.getState().login.device.token.data.token
const getTmpPath = () => store.getState().config.tmpPath
const getTmpTransPath = () => store.getState().config.tmpTransPath

/* init request */
let server
let Authorization
const initArgs = () => {
  server = `http://${store.getState().login.device.mdev.address}:3000`
  const tokenObj = store.getState().login.device.token.data
  Authorization = tokenObj.type ? `${tokenObj.type} ${tokenObj.token}` : tokenObj.token
}

/**
get json data from server

@param {string} string
@param {Object} qs
*/

export const serverGet = (endpoint, callback) => {
  initArgs()
  const options = { method: 'GET', headers: { Authorization }, url: `${server}/${endpoint}` }
  request.get(options, (err, res) => {
    if (err) return callback(err)
    if (res.statusCode !== 200) {
      const e = new Error('http status code not 200')
      e.code = 'EHTTPSTATUS'
      e.status = res.statusCode
      e.url = url
      return callback(e)
    }
    try {
      const data = JSON.parse(res.body)
      return callback(null, data)
    } catch (e) {
      const e = new Error('json parse error')
      e.code === 'EJSONPARSE'
      return callback(e)
    }
  })
}

export const serverGetAsync = Promise.promisify(serverGet)

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
      debug(res.body)
      const e = new Error('http status code not 200')
      e.code = 'EHTTPSTATUS'
      e.status = res.statusCode
      return callback(e)
    }

    try {
      fs.renameSync(tmpPath, dst)
      return callback(null, null)
    } catch (e) {
      debug('req GET json parse err')
      debug(e)
      const e1 = new Error('json parse error')
      e1.code = 'EJSONPARSE'
      return callback(e1)
    }
  }).pipe(stream)
}

export const requestDownloadAsync = Promise.promisify(requestDownload)

export const serverDownloadAsync = (endpoint, qs, downloadPath, name) => {
  const ip = getIpAddr()
  const port = 3000
  const token = getToken()
  return requestDownloadAsync(`http://${ip}:${port}/${endpoint}`, qs, token, downloadPath, name)
}


/**
Upload multiple files in one request.post

@param {string} driveUUID
@param {string} dirUUID
@param {Object[]} Files
@param {string} Files[].name
@param {Object[]} Files[].parts
@param {string} Files[].parts[].start
@param {string} Files[].parts[].end
@param {string} Files[].parts[].sha
@param {string} Files[].parts[].fingerpringt
@param {Object[]} Files[].readStreams
@param {Object} Files[].policy
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

    const op = { url: `${server}/drives/${this.driveUUID}/dirs/${this.dirUUID}/entries`, headers: { Authorization } }

    this.handle = request.post(op, (err, res) => {
      if (err) this.finish(err)
      else if (res && res.statusCode === 200) this.finish(null)
      else this.finish(JSON.parse(res.body))
    })

    const form = this.handle.form()

    this.Files.forEach((file) => {
      const { name, parts, readStreams, policy } = file
      for (let i = 0; i < parts.length; i++) {
        const rs = readStreams[i]
        const part = parts[i]
        let formDataOptions = {
          size: part.end ? part.end - part.start + 1 : 0,
          sha256: part.sha
        }
        if (part.start) {
          formDataOptions = Object.assign(formDataOptions, { append: part.fingerprint })
        } else if (policy && policy.mode === 'replace') {
          form.append(name, JSON.stringify({ op: 'remove', uuid: policy.remoteUUID }))
          // Object.assign(formDataOptions, { overwrite: policy.remoteUUID })
        }
        form.append(name, rs, JSON.stringify(formDataOptions))
      }
    })
  }

  finish(error) {
    if (this.finished) return
    this.finished = true
    this.callback(error)
  }

  abort() {
    if (this.handle) this.handle.abort()
  }
}

/**
download a entire file or part of file

@param {string} driveUUID
@param {string} dirUUID
@param {string} entryUUID
@param {string} fileName
@param {number} size
@param {number} seek
@param {Object} stream
@param {function} callback
*/

export class DownloadFile {
  constructor(driveUUID, dirUUID, entryUUID, fileName, size, seek, stream, callback) {
    this.driveUUID = driveUUID
    this.dirUUID = dirUUID
    this.entryUUID = entryUUID
    this.fileName = fileName
    this.seek = seek || 0
    this.size = size
    this.stream = stream
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
        Range: this.size ? `bytes=${this.seek}-` : undefined
      },
      qs: this.dirUUID === 'media' ? { alt: 'data' } : { name: this.fileName }
    }

    this.handle = request(options)

    this.handle.on('error', error => this.finish(error))

    this.handle.pipe(this.stream)
  }

  abort() {
    if (this.finished) return
    debug('download abort', this.fileName)
    this.finish(null)
    if (this.handle) this.handle.abort()
  }

  finish(error) {
    if (this.finished) return
    this.callback(error)
    this.finished = true
  }
}

/* return a new file name */
const getName = (name, nameSpace) => {
  let checkedName = name
  const extension = name.replace(/^.*\./, '')
  for (let i = 1; nameSpace.includes(checkedName); i++) {
    if (!extension || extension === name) {
      checkedName = `${name}(${i})`
    } else {
      const pureName = name.match(/^.*\./)[0]
      checkedName = `${pureName.slice(0, pureName.length - 1)}(${i}).${extension}`
    }
  }
  return checkedName
}

/**
createFold

@param {string} driveUUID
@param {string} dirUUID
@param {string} dirname
@param {Object[]} localEntries
@param {string} localEntries[].entry
@param {Object} policy
@param {string} policy.mode
@param {function} callback
*/

export const createFold = (driveUUID, dirUUID, dirname, localEntries, policy, callback) => {
  initArgs()

  const parents = true // mkdirp

  const op = { url: `${server}/drives/${driveUUID}/dirs/${dirUUID}/entries`, headers: { Authorization } }

  const handle = request.post(op, (error, res) => {
    if (error) {
      debug('createFold error', error, res)
      callback(error)
    } else if (res && res.statusCode === 200) {
      /* callback the created dir entry */
      callback(null, JSON.parse(res.body).entries.find(e => e.name === dirname))
    } else if (res && res.statusCode === 403 && (policy.mode === 'overwrite' || policy.mode === 'merge')) {
      /* when a file with the same name in remote, retry if given policy of overwrite or merge */
      serverGetAsync(`drives/${driveUUID}/dirs/${dirUUID}`)
        .then((listNav) => {
          const entries = listNav.entries
          const index = entries.findIndex(e => e.name === dirname)
          if (index > -1) {
            const nameSpace = [...entries.map(e => e.name), localEntries.map(e => e.replace(/^.*\//, ''))]
            const mode = policy.mode === 'overwrite' ? 'replace' : 'rename'
            const checkedName = policy.mode === 'overwrite' ? dirname : getName(dirname, nameSpace)
            const remoteUUID = entries[index].uuid
            debug('retry createFold', dirname, mode, checkedName, remoteUUID)
            createFold(driveUUID, dirUUID, checkedName, localEntries, { mode, checkedName, remoteUUID }, callback)
          } else callback(JSON.parse(res.body))
        })
        .catch(e => callback(e))
    } else callback(JSON.parse(res.body)) // response code not 200 and no policy
  })

  const form = handle.form()
  if (policy && policy.mode === 'replace') form.append(dirname, JSON.stringify({ op: 'remove', uuid: policy.remoteUUID }))
  form.append(dirname, JSON.stringify({ op: 'mkdir', parents }))
}

export const createFoldAsync = Promise.promisify(createFold)

/**
download tmp File

@param {string} driveUUID
@param {string} dirUUID
@param {string} entryUUID
@param {string} fileName
@param {string} downloadPath
@param {function} callback
*/

export const downloadFile = (driveUUID, dirUUID, entryUUID, fileName, downloadPath, callback) => {
  initArgs()
  const filePath = downloadPath ? path.join(downloadPath, fileName) : path.join(getTmpPath(), `${entryUUID}AND${fileName}`)
  fs.access(filePath, (error) => {
    if (error) {
      debug('no cache download file', fileName)
      const tmpPath = path.join(getTmpTransPath(), entryUUID)
      const options = {
        method: 'GET',
        url: dirUUID === 'media' ? `${server}/media/${entryUUID}`
        : `${server}/drives/${driveUUID}/dirs/${dirUUID}/entries/${entryUUID}`,
        headers: { Authorization },
        qs: { name: fileName }
      }

      const stream = fs.createWriteStream(tmpPath)
      stream.on('error', err => callback(err))
      stream.on('finish', () => {
        fs.rename(tmpPath, filePath, (err) => {
          if (err) return callback(err)
          return callback(null, filePath)
        })
      })
      const handle = request(options).on('error', err => callback(err))
      handle.pipe(stream)
    } else callback(null, filePath)
  })
}
