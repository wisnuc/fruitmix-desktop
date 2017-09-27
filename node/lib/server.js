import fs from 'fs'
import path from 'path'
import Debug from 'debug'
import UUID from 'node-uuid'
import request from 'superagent'
import { ipcMain } from 'electron'
import store from './store'

Promise.promisifyAll(fs) // babel would transform Promise to bluebird

const debug = Debug('node:lib:server')
const getTmpPath = () => store.getState().config.tmpPath
const getTmpTransPath = () => store.getState().config.tmpTransPath

/* init request */
let stationID = null
let address = null
let token = null

ipcMain.on('LOGIN', (event, device, user) => {
  address = device.mdev.address
  token = device.token.data.token
  stationID = device.token.data.stationID
  debug('Got device, address, token, stationID: ', address, stationID)
})

export const isCloud = () => !!stationID

const reqCloud = (ep, data, type) => {
  const url = `${address}/c/v1/stations/${stationID}/json`
  const url2 = `${address}/c/v1/stations/${stationID}/pipe`
  const resource = new Buffer(`/${ep}`).toString('base64')
  debug('reqCloud', type, ep)
  if (type === 'GET') return request.get(url).set('Authorization', token).query({ resource, method: type })
  if (type === 'DOWNLOAD') return request.get(url2).set('Authorization', token).query({ resource, method: 'GET' })
  return request.post(url).set('Authorization', token).send(Object.assign({ resource, method: type }, data))
}

const aget = (ep) => {
  if (stationID) return reqCloud(ep, null, 'GET')
  return request
    .get(`http://${address}:3000/${ep}`)
    .set('Authorization', `JWT ${token}`)
}

const adownload = (ep) => {
  if (stationID) return reqCloud(ep, null, 'DOWNLOAD')
  return request
    .get(`http://${address}:3000/${ep}`)
    .set('Authorization', `JWT ${token}`)
}

const awriteDir = (ep, data, type) => {
  const url = `${address}/c/v1/stations/${stationID}/json`
  const resource = new Buffer(`/${ep}`).toString('base64')
  if (type === 'mkdir') return request.post(url).set('Authorization', token)
    .send({ resource, method: 'POST', toName: data.name, op: 'mkdir' })
  if (type === 'remove') return request.post(url).set('Authorization', token)
    .send({ resource, method: 'POST', toName: data.name, uuid: data.uuid, op: 'remove' })
}

const apost = (ep, data) => {
  if (stationID) return reqCloud(ep, data, 'POST')
  const r = request
    .post(`http://${address}:3000/${ep}`)
    .set('Authorization', `JWT ${token}`)

  return typeof data === 'object'
    ? r.send(data)
    : r
}

/**
get json data from server
@param {string} endpoint
@param {function} callback
*/

export const serverGet = (endpoint, callback) => {
  aget(endpoint).end((err, res) => {
    if (err) return callback(Object.assign({}, err, { response: null }))
    if (res.statusCode !== 200 && res.statusCode !== 206) {
      const e = new Error('http status code not 200')
      e.code = 'EHTTPSTATUS'
      e.status = res.statusCode
      return callback(e)
    }
    const data = res.body
    return callback(null, data)
  })
}

export const serverGetAsync = Promise.promisify(serverGet)

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

  localUpload() {
    this.handle = apost(`drives/${this.driveUUID}/dirs/${this.dirUUID}/entries`)
    
    this.Files.forEach((file) => {
      const { name, parts, readStreams, policy } = file
      for (let i = 0; i < parts.length; i++) {
        const rs = readStreams[i]
        const part = parts[i]
        let formDataOptions = {
          size: part.end ? part.end - part.start + 1 : 0,
          sha256: part.sha
        }
        try {
          if (part.start) {
            formDataOptions = Object.assign(formDataOptions, { append: part.fingerprint })
          } else if (policy && policy.mode === 'replace') {
            this.handle.field(name, JSON.stringify({ op: 'remove', uuid: policy.remoteUUID }))
          }
          this.handle.attach(name, rs, JSON.stringify(formDataOptions))
        } catch (e) {
          debug('upload this.Files.forEach error', e)
        }
      }
    })
    this.handle.on('error', (err) => {
      debug('this.handle.on error', err)
      this.finish(err)
    })

    this.handle.end((err, res) => {
      if (err) this.finish(err)
      else if (res && res.statusCode === 200) this.finish(null)
      else this.finish(res.body)
    })
  }

  cloudUpload() {
    const ep = `drives/${this.driveUUID}/dirs/${this.dirUUID}/entries`
    const file = this.Files[0]
    
    const { name, parts, readStreams, policy } = file
    const rs = readStreams[0]
    const part = parts[0]

    const url = `${address}/c/v1/stations/${stationID}/pipe`
    const resource = new Buffer(`/${ep}`).toString('base64')

    const option = {
      op: 'newfile',
      resource,
      method: 'POST',
      toName: name,
      size: part.end ? part.end - part.start + 1 : 0,
      sha256: part.sha
    }
    this.handle = request.post(url).set('Authorization', token).field('manifest', JSON.stringify(option)).attach(name, rs)
    /*
    if (policy && policy.mode === 'replace') {
      this.handle.field(name, JSON.stringify({ op: 'remove', uuid: policy.remoteUUID }))
    }
    */
    
    this.handle.on('error', (err) => {
      debug('this.handle.on error', err)
      this.finish(err)
    })

    this.handle.end((err, res) => {
      if (err) this.finish(err)
      else if (res && res.statusCode === 200) this.finish(null)
      else this.finish(res.body)
    })
  }

  upload() {
    if (stationID) this.cloudUpload()
    else this.localUpload()
  }

  finish(error) {
    if (this.finished) return
    if (error) {
      debug('upload finish, error:', error, error.code)
      error.code = error.code || (error.status >= 500 ? 'ESERVER' : 'EOTHER')
      error.response = null
    }
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
  constructor(endpoint, qs, fileName, size, seek, stream, callback) {
    this.endpoint = endpoint
    this.qs = qs
    this.fileName = fileName
    this.seek = seek || 0
    this.size = size
    this.stream = stream
    this.callback = callback
    this.handle = null
  }

  download() {
    this.handle = adownload(this.endpoint)
    if (this.size) this.handle.set('Range', `bytes=${this.seek}-`)
    this.handle
      .query(this.qs)
      .on('error', error => this.finish(error))
      .on('response', (res) => {
        if (res.status !== 200 && res.status !== 206) {
          const e = new Error('http status code not 200')
          e.code = 'EHTTPSTATUS'
          e.status = res.status
          this.finish(e)
        }
        res.on('end', () => this.finish(null))
      })
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
    if (error) {
      debug('download finish, error:', error)
      error.code = error.code || (error.status >= 500 ? 'ESERVER' : 'EOTHER')
      error.response = null
    }
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
  const parents = true // mkdirp
  const ep = `drives/${driveUUID}/dirs/${dirUUID}/entries`
  let handle = null
  if (stationID) {
    const url = `${address}/c/v1/stations/${stationID}/json`
    const resource = new Buffer(`/${ep}`).toString('base64')
    handle = request.post(url).set('Authorization', token).send(Object.assign({ resource, method: 'POST', op: 'mkdir', toName: dirname }))
  } else {
    handle = apost(ep)
    if (policy && policy.mode === 'replace') handle.field(dirname, JSON.stringify({ op: 'remove', uuid: policy.remoteUUID }))
    handle.field(dirname, JSON.stringify({ op: 'mkdir', parents }))
  }
 
  handle.end((error, res) => {
    if (error) {
      debug('createFold error', error.response && error.response.body)
      callback(Object.assign({}, error, { response: null }))
    } else if (res && res.statusCode === 200) {
      /* callback the created dir entry */
      debug('createFold', res.body)
      callback(null, stationID ? res.body.data : res.body[0].data)
      // callback(null, res.body.entries.find(e => e.name === dirname))
    } else if (res && res.statusCode === 403 && (policy.mode === 'overwrite' || policy.mode === 'merge')) {
      /* when a file with the same name in remote, retry if given policy of overwrite or merge */
      serverGetAsync(`drives/${driveUUID}/dirs/${dirUUID}`)
        .then((listNav) => {
          const entries = stationID ? listNav.data.entries : listNav.entries
          const index = entries.findIndex(e => e.name === dirname)
          if (index > -1) {
            const nameSpace = [...entries.map(e => e.name), localEntries.map(e => path.parse(e).base)]
            const mode = policy.mode === 'overwrite' ? 'replace' : 'rename'
            const checkedName = policy.mode === 'overwrite' ? dirname : getName(dirname, nameSpace)
            const remoteUUID = entries[index].uuid
            debug('retry createFold', dirname, mode, checkedName, remoteUUID)
            createFold(driveUUID, dirUUID, checkedName, localEntries, { mode, checkedName, remoteUUID }, callback)
          } else callback(res.body)
        })
        .catch(e => callback(Object.assign({}, e, { response: null })))
    } else callback(res.body) // response code not 200 and no policy
  })
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
  const filePath = downloadPath ? path.join(downloadPath, fileName) : path.join(getTmpPath(), `${entryUUID}AND${fileName}`)
  fs.access(filePath, (error) => {
    if (error) {
      debug('no cache download file', fileName)
      const tmpPath = path.join(getTmpTransPath(), UUID.v4())
      const stream = fs.createWriteStream(tmpPath)
      stream.on('error', err => callback(err))
      stream.on('finish', () => {
        fs.rename(tmpPath, filePath, (err) => {
          if (err) return callback(err)
          return callback(null, filePath)
        })
      })

      const handle = adownload(dirUUID === 'media' ? `media/${entryUUID}` : `drives/${driveUUID}/dirs/${dirUUID}/entries/${entryUUID}`)
        .query({ name: fileName })
        .on('error', err => callback(Object.assign({}, err, { response: null })))
      handle.pipe(stream)
    } else callback(null, filePath)
  })
}
