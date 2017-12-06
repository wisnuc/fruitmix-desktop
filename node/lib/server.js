import fs from 'fs'
import path from 'path'
import Debug from 'debug'
import rimraf from 'rimraf'
import UUID from 'uuid'
import request from 'superagent'
import { ipcMain } from 'electron'
import store from './store'

Promise.promisifyAll(fs) // babel would transform Promise to bluebird

const debug = Debug('node:lib:server')
const getTmpPath = () => store.getState().config.tmpPath
const getTmpTransPath = () => store.getState().config.tmpTransPath

export const clearTmpTrans = () => {
  // console.log('clearTmpTrans', `${getTmpTransPath()}/*`)
  rimraf(`${getTmpTransPath()}/*`, e => e && console.log('clearTmpTrans error', e))
}

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
  // debug('reqCloud', type, ep)
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
  // debug('serverGet', endpoint)
  aget(endpoint).end((err, res) => {
    if (err) return callback(Object.assign({}, err, { response: err.response && err.response.body }))
    if (res.statusCode !== 200 && res.statusCode !== 206) {
      const e = new Error('http status code not 200')
      e.code = res.code
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
        if (policy && policy.seed !== 0 && policy.seed > i) continue // big file, upload from part[seed]
        const rs = readStreams[i]
        const part = parts[i]
        let formDataOptions = {
          size: part.end - part.start + 1,
          sha256: part.sha
        }
        if (part.start) {
          formDataOptions = Object.assign(formDataOptions, { append: part.target })
        } else if (policy && policy.mode === 'replace') {
          this.handle.field(name, JSON.stringify({ op: 'remove', uuid: policy.remoteUUID }))
        }
        this.handle.attach(name, rs, JSON.stringify(formDataOptions))
      }
    })

    this.handle.on('error', (err) => {
      this.finish(err)
    })

    this.handle.end((err, res) => {
      // debug('localUpload this.handle.end', err, res && res.body)
      if (err) this.finish(err)
      else if (res && res.statusCode === 200) this.finish(null)
      else this.finish(res.body)
    })
  }

  cloudUpload() {
    if (this.finished) return
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

    // debug('cloudUpload', name, policy)
    this.handle.on('error', (err) => {
      this.finish(err)
    })

    this.handle.end((err, res) => {
      if (err) this.finish(err)
      else if (res && res.statusCode === 200) this.finish(null)
      else this.finish(res.body)
    })
  }

  remove() {
    const ep = `drives/${this.driveUUID}/dirs/${this.dirUUID}/entries`
    const file = this.Files[0]
    const { name, policy } = file
    const url = `${address}/c/v1/stations/${stationID}/json`
    const resource = new Buffer(`/${ep}`).toString('base64')
    this.handle = request.post(url).set('Authorization', token)
      .send({ resource, method: 'POST', toName: name, uuid: policy.remoteUUID, op: 'remove' })
      .end((err, res) => {
        debug('remove !!!!', err, res && res.body)
        this.handle = null
        if (err) this.finish(err)
        else this.cloudUpload()
        // else setImmediate(() => this.cloudUpload())
      })
  }

  upload() {
    if (stationID && this.Files[0].policy && this.Files[0].policy.mode === 'replace') this.remove()
    else if (stationID) this.cloudUpload()
    else this.localUpload()
  }

  finish(error) {
    // debug('cloudUpload error', error)
    if (this.finished) return
    if (error) {
      debug('upload error', error.response && error.response.body)
      error.response = error.response && error.response.body
    }
    this.finished = true
    this.callback(error)
  }

  abort() {
    this.finished = true
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
    if (this.size && this.size === this.seek) return setImmediate(() => this.finish(null))
    if (this.size) this.handle.set('Range', `bytes=${this.seek}-`)
    this.handle
      .query(this.qs)
      .on('error', error => this.finish(error))
      .on('response', (res) => {
        if (res.status !== 200 && res.status !== 206) {
          debug('download http status code not 200', res.error)
          const e = new Error()
          e.message = res.error
          e.code = res.code
          e.status = res.status
          this.handle.abort()
          this.finish(e)
        }
        res.on('end', () => this.finish(null))
      })
    this.handle.pipe(this.stream)
  }

  abort() {
    if (this.finished) return
    this.finish(null)
    if (this.handle) this.handle.abort()
  }

  finish(error) {
    if (this.finished) return
    if (error) {
      error.response = error.response && error.response.body
    }
    this.callback(error)
    this.finished = true
  }
}

/* return a new file name */
const getName = (name, nameSpace) => {
  let checkedName = name
  const extension = path.parse(name).ext
  for (let i = 1; nameSpace.includes(checkedName); i++) {
    if (!extension || extension === name) {
      checkedName = `${name}(${i})`
    } else {
      checkedName = `${path.parse(name).name}(${i})${extension}`
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

normal mode:
createFold -> callback

merge mode:
createFold -> if error -> rename -> retry createFold -> callback

overwrite mode:
createFold -> if error -> remove -> retry createFold -> callback

TODO: fix this callback hell
*/

export const createFold = (driveUUID, dirUUID, dirname, localEntries, policy, callback) => {
  const parents = true // mkdirp
  const ep = `drives/${driveUUID}/dirs/${dirUUID}/entries`
  let handle = null
  if (stationID) {
    const url = `${address}/c/v1/stations/${stationID}/json`
    const resource = new Buffer(`/${ep}`).toString('base64')
    handle = request.post(url).set('Authorization', token)
    if (policy && policy.mode === 'replace') handle.send(Object.assign({ resource, method: 'POST', op: 'remove', toName: dirname, uuid: policy.remoteUUID }))
    else handle.send(Object.assign({ resource, method: 'POST', op: 'mkdir', toName: dirname }))
  } else {
    handle = apost(ep)
    if (policy && policy.mode === 'replace') handle.field(dirname, JSON.stringify({ op: 'remove', uuid: policy.remoteUUID }))
    handle.field(dirname, JSON.stringify({ op: 'mkdir', parents }))
  }

  handle.end((error, res) => {
    if (error) {
      debug('createFold error', error.response && error.response.body, driveUUID, dirUUID, dirname, policy)
      if (policy.mode === 'overwrite' || policy.mode === 'merge') {
        /* when a file with the same name in remote, retry if given policy of overwrite or merge */
        serverGetAsync(`drives/${driveUUID}/dirs/${dirUUID}`)
          .then((listNav) => {
            const entries = stationID ? listNav.data.entries : listNav.entries
            // debug('retry creat fold entries', entries)
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
          .catch(e => callback(Object.assign({}, e, { response: e.response && e.response.body })))
      } else if(!policy.retry) {
        console.log('retry create folder', dirname, error.response && error.response.body)
        createFold(driveUUID, dirUUID, dirname, localEntries, Object.assign({ retry: true }, policy), callback)
      } else callback(Object.assign({}, error, { response: error.response && error.response.body }))
    } else if (res && res.statusCode === 200) {
      // debug('createFold handle.end res.statusCode 200', res.body)
      /* mode === 'replace' && stationID: need to retry creatFold */
      if (stationID && policy && policy.mode === 'replace') createFold(driveUUID, dirUUID, dirname, localEntries, { mode: 'normal' }, callback)
      /* callback the created dir entry */
      else callback(null, stationID ? res.body.data : res.body[res.body.length - 1].data)
    } else {
      debug('createFold no error but res not 200', res.body)
      callback(res.body) // response code not 200 and no policy
    }
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
        .on('error', err => callback(Object.assign({}, err, { response: err.response && err.response.body })))
      handle.pipe(stream)
    } else callback(null, filePath)
  })
}
