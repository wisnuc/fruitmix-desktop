const path = require('path')
const Promise = require('bluebird')
const rimraf = require('rimraf')
const UUID = require('uuid')
const request = require('superagent')
const { ipcMain } = require('electron')
const fs = Promise.promisifyAll(require('fs'))

const store = require('./store')

const getTmpPath = () => store.getState().config.tmpPath
const getTmpTransPath = () => store.getState().config.tmpTransPath

const cloudAddress = 'http://www.siyouqun.com:80'

const clearTmpTrans = () => {
  rimraf(`${getTmpTransPath()}/*`, e => e && console.error('clearTmpTrans error', e))
}

/* init request */
let stationID = null
let address = null
let token = null
let cloud = false

ipcMain.on('LOGIN', (event, device, user) => {
  address = device.mdev.address
  token = device.token.data.token
  cloud = !!device.mdev.isCloud
  const info = device.info
  if (info && info.data) stationID = info.data.id
})

const isCloud = () => cloud

/* adapter of cloud api */
const reqCloud = (ep, data, type) => {
  const url = `${address}/c/v1/stations/${stationID}/json`
  const url2 = `${address}/c/v1/stations/${stationID}/pipe`
  const resource = Buffer.from(`/${ep}`).toString('base64')
  if (type === 'GET') return request.get(url).set('Authorization', token).query({ resource, method: type })
  if (type === 'DOWNLOAD') return request.get(url2).set('Authorization', token).query({ resource, method: 'GET' })
  return request.post(url).set('Authorization', token).send(Object.assign({ resource, method: type }, data))
}

const aget = (ep) => {
  if (cloud) return reqCloud(ep, null, 'GET')
  return request
    .get(`http://${address}:3000/${ep}`)
    .set('Authorization', `JWT ${token}`)
}

const adownload = (ep, bToken) => {
  if (cloud) return reqCloud(ep, null, 'DOWNLOAD')
  const newToken = bToken ? `JWT ${bToken} ${token}` : `JWT ${token}`
  return request
    .get(`http://${address}:3000/${ep}`)
    .set('Authorization', newToken)
}

/* download box resouces via cloud */
const cdownload = (ep, station) => {
  const { stationId, wxToken, boxUUID } = station
  const url = `${cloudAddress}/c/v1/boxes/${boxUUID}/stations/${stationId}/pipe`
  const resource = Buffer.from(`/${ep}`).toString('base64')
  return request.get(url).set('Authorization', wxToken).query({ resource, method: 'GET' })
}

/* request box local token, callback error or bToken */
let storedToken = null
const getBToken = (guid, callback) => {
  if (storedToken && storedToken.guid === guid && (new Date().getTime() - storedToken.ctime < 6000000)) {
    setImmediate(() => callback(null, storedToken.token))
  } else {
    const r = aget('cloudToken').query({ guid })
    r.end((err, res) => {
      if (err) console.error('getBToken error', err)
      if (err) callback(err, null)
      else if (!res || !res.body || !res.body.token) {
        const error = new Error('no token')
        callback(error, null)
      } else {
        storedToken = { guid, token: res.body.token, ctime: new Date().getTime() }
        callback(null, res.body.token)
      }
    })
  }
}

const apost = (ep, data) => {
  if (cloud) return reqCloud(ep, data, 'POST')
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

const serverGet = (endpoint, callback) => {
  aget(endpoint).end((err, res) => {
    if (err) return callback(Object.assign({}, err, { response: err.response && err.response.body }))
    if (res.status !== 200 && res.status !== 206) {
      const e = new Error('http status code not 200')
      e.code = res.code
      e.status = res.status
      return callback(e)
    }
    const data = res.body
    return callback(null, data)
  })
}

const serverGetAsync = Promise.promisify(serverGet)

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

class UploadMultipleFiles {
  constructor (driveUUID, dirUUID, Files, callback) {
    this.driveUUID = driveUUID
    this.dirUUID = dirUUID
    this.Files = Files
    this.callback = callback
    this.handle = null
  }

  localUpload () {
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
      if (err) this.finish(err)
      else if (res && res.statusCode === 200) this.finish(null)
      else this.finish(res.body)
    })
  }

  cloudUpload () {
    if (this.finished) return
    const ep = `drives/${this.driveUUID}/dirs/${this.dirUUID}/entries`
    const file = this.Files[0]

    const { name, parts, readStreams } = file
    const rs = readStreams[0]
    const part = parts[0]

    const url = `${address}/c/v1/stations/${stationID}/pipe`
    const resource = Buffer.from(`/${ep}`).toString('base64')

    const option = {
      op: 'newfile',
      resource,
      method: 'POST',
      toName: name,
      size: part.end ? part.end - part.start + 1 : 0,
      sha256: part.sha
    }
    this.handle = request.post(url).set('Authorization', token).field('manifest', JSON.stringify(option)).attach(name, rs)

    this.handle.on('error', (err) => {
      this.finish(err)
    })

    this.handle.end((err, res) => {
      if (err) this.finish(err)
      else if (res && res.statusCode === 200) this.finish(null)
      else this.finish(res.body)
    })
  }

  remove () {
    const ep = `drives/${this.driveUUID}/dirs/${this.dirUUID}/entries`
    const file = this.Files[0]
    const { name, policy } = file
    const url = `${address}/c/v1/stations/${stationID}/json`
    const resource = Buffer.from(`/${ep}`).toString('base64')
    this.handle = request.post(url).set('Authorization', token)
      .send({ resource, method: 'POST', toName: name, uuid: policy.remoteUUID, op: 'remove' })
      .end((err) => {
        this.handle = null
        if (err) this.finish(err)
        else this.cloudUpload()
      })
  }

  upload () {
    if (cloud && this.Files[0].policy && this.Files[0].policy.mode === 'replace') this.remove()
    else if (cloud) this.cloudUpload()
    else this.localUpload()
  }

  finish (error) {
    if (this.finished) return
    if (error) {
      error.response = error.response && error.response.body
    }
    this.finished = true
    this.callback(error)
  }

  abort () {
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

class DownloadFile {
  constructor (endpoint, qs, fileName, size, seek, stream, station, callback) {
    this.endpoint = endpoint
    this.qs = qs
    this.fileName = fileName
    this.seek = seek || 0
    this.size = size
    this.stream = stream
    this.station = station
    this.callback = callback
    this.handle = null
  }

  normalDownload () {
    this.handle = this.station ? cdownload(this.endpoint, this.station) : adownload(this.endpoint)
    if (this.size && this.size === this.seek) return setImmediate(() => this.finish(null))
    if (this.size) this.handle.set('Range', `bytes=${this.seek}-`)
    this.handle
      .query(this.qs)
      .on('error', error => this.finish(error))
      .on('response', (res) => {
        if (res.status !== 200 && res.status !== 206) {
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
    return null
  }

  forceLocalDownload () {
    const { guid, isMedia } = this.station
    getBToken(guid, (err, bToken) => {
      if (err) {
        console.error('getBToken error', err)
        this.normalDownload() // retry download via cloud
      } else {
        /* access box file need bToken, however box media does not !!! */
        this.handle = adownload(this.endpoint, isMedia ? null : bToken)
        if (this.size && this.size === this.seek) return setImmediate(() => this.finish(null))
        if (this.size) this.handle.set('Range', `bytes=${this.seek}-`)
        this.handle
          .query(this.qs)
          .on('error', error => this.finish(error))
          .on('response', (res) => {
            if (res.status !== 200 && res.status !== 206) {
              console.error('download http status code not 200', res.error)
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
        return null
      }
      return null
    })
  }

  download () {
    const localable = !cloud && stationID && this.station && stationID === this.station.stationId
    if (localable) this.forceLocalDownload()
    else this.normalDownload()
  }

  abort () {
    if (this.finished) return
    this.finish(null)
    if (this.handle) this.handle.abort()
  }

  finish (error) {
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

const createFold = (driveUUID, dirUUID, dirname, localEntries, policy, callback) => {
  const parents = true // mkdirp
  const ep = `drives/${driveUUID}/dirs/${dirUUID}/entries`
  let handle = null
  if (cloud) {
    const url = `${address}/c/v1/stations/${stationID}/json`
    const resource = Buffer.from(`/${ep}`).toString('base64')
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
      console.error('createFold error', error.response && error.response.body, driveUUID, dirUUID, dirname, policy)
      if (policy.mode === 'overwrite' || policy.mode === 'merge') {
        /* when a file with the same name in remote, retry if given policy of overwrite or merge */
        serverGetAsync(`drives/${driveUUID}/dirs/${dirUUID}`)
          .then((listNav) => {
            const entries = cloud ? listNav.data.entries : listNav.entries
            const index = entries.findIndex(e => e.name === dirname)
            if (index > -1) {
              const nameSpace = [...entries.map(e => e.name), localEntries.map(e => path.parse(e).base)]
              const mode = policy.mode === 'overwrite' ? 'replace' : 'rename'
              const checkedName = policy.mode === 'overwrite' ? dirname : getName(dirname, nameSpace)
              const remoteUUID = entries[index].uuid
              createFold(driveUUID, dirUUID, checkedName, localEntries, { mode, checkedName, remoteUUID }, callback)
            } else callback(res.body)
          })
          .catch(e => callback(Object.assign({}, e, { response: e.response && e.response.body })))
      } else if (!policy.retry) {
        console.log('retry create folder', dirname, error.response && error.response.body)
        createFold(driveUUID, dirUUID, dirname, localEntries, Object.assign({ retry: true }, policy), callback)
      } else callback(Object.assign({}, error, { response: error.response && error.response.body }))
    } else if (res && res.statusCode === 200) {
      /* mode === 'replace' && stationID: need to retry creatFold */
      if (cloud && policy && policy.mode === 'replace') createFold(driveUUID, dirUUID, dirname, localEntries, { mode: 'normal' }, callback)
      /* callback the created dir entry */
      else callback(null, cloud ? res.body.data : res.body[res.body.length - 1].data)
    } else {
      callback(res.body) // response code not 200 and no policy
    }
  })
}

const createFoldAsync = Promise.promisify(createFold)

/**
download tmp File

@param {string} driveUUID
@param {string} dirUUID
@param {string} entryUUID
@param {string} fileName
@param {string} downloadPath
@param {function} callback

file type: [media, boxFiles, driveFiles]
*/

const downloadReq = (ep, fileName, filePath, station, bToken, callback) => {
  const tmpPath = path.join(getTmpTransPath(), UUID.v4())
  const stream = fs.createWriteStream(tmpPath)
  stream.on('error', err => callback(err))
  stream.on('finish', () => {
    fs.rename(tmpPath, filePath, (err) => {
      if (err) return callback(err)
      return callback(null, filePath)
    })
  })

  const handle = bToken ? adownload(ep, bToken) : station ? cdownload(ep, station) : adownload(ep)

  handle.query({ name: fileName })
    .on('error', err => callback(Object.assign({}, err, { response: err.response && err.response.body })))
    .on('response', (res) => {
      if (res.status !== 200 && res.status !== 206) {
        console.error('download http status code not 200', res.error)
        const e = new Error()
        e.message = res.error
        e.code = res.code
        e.status = res.status
        handle.abort()
        callback(e)
      }
    })

  handle.pipe(stream)
}

const downloadFile = (entry, downloadPath, callback) => {
  const { driveUUID, dirUUID, entryUUID, fileName, station } = entry
  const filePath = downloadPath ? path.join(downloadPath, fileName)
    : path.join(getTmpPath(), `${entryUUID.slice(0, 64)}AND${fileName}`)

  /* check local file cache */
  fs.access(filePath, (error) => {
    if (error) {
      const ep = dirUUID === 'media' ? `media/${entryUUID}`
        : dirUUID === 'boxFiles' ? `boxes/${station.boxUUID}/files/${entryUUID.slice(0, 64)}`
          : `drives/${driveUUID}/dirs/${dirUUID}/entries/${entryUUID}`

      /* check whether boxFile and localable */
      const localable = !cloud && stationID && station && stationID === station.stationId
      if (localable) {
        /* get box token */
        getBToken(station.guid, (err, bToken) => {
          if (err) {
            console.error('getBToken error', err)
            downloadReq(ep, fileName, filePath, station, null, callback)
          } else downloadReq(ep, fileName, filePath, station, bToken, callback)
        })
      } else downloadReq(ep, fileName, filePath, station, null, callback)
    } else callback(null, filePath)
  })
}

const uploadTorrent = (dirUUID, rs, part, callback) => {
  if (cloud) {
    const ep = 'download/torrent'
    const url = `${address}/c/v1/stations/${stationID}/pipe`
    const resource = Buffer.from(`/${ep}`).toString('base64')
    const option = { resource, dirUUID, sha256: part.sha, method: 'POST', size: part.end ? part.end - part.start + 1 : 0 }
    request.post(url).set('Authorization', token).field('manifest', JSON.stringify(option)).attach('torrent', rs)
      .end(callback)
  } else {
    apost('download/torrent').field('dirUUID', dirUUID).attach('torrent', rs).end(callback)
  }
}

const uploadTorrentAsync = Promise.promisify(uploadTorrent)

const boxUploadCloud = (files, args, callback) => {
  const { comment, type, box } = args
  const boxUUID = box.uuid
  const { stationId, wxToken } = box
  const list = files.map(f => ({ filename: f.filename, size: f.size, sha256: f.sha256 }))
  const ep = `boxes/${boxUUID}/tweets`
  const url = `${cloudAddress}/c/v1/boxes/${boxUUID}/stations/${stationId}/pipe`
  const resource = Buffer.from(`/${ep}`).toString('base64')
  const { filename, size, sha256, entry } = files[0]
  const option = { type, list, comment, resource, method: 'POST' }

  const r = request
    .post(url)
    .set('Authorization', wxToken)
    .field('manifest', JSON.stringify(option))
    .attach(filename, entry, JSON.stringify({ size, sha256 }))

  r.end(callback)
}

const boxUploadLocal = (files, bToken, args, callback) => {
  const { comment, type, box } = args
  const boxUUID = box.uuid
  const list = files.map(f => ({ filename: f.filename, size: f.size, sha256: f.sha256 }))
  const url = `http://${address}:3000/boxes/${boxUUID}/tweets`
  const r = request
    .post(url)
    .set('Authorization', `JWT ${bToken} ${token}`)
    .field('list', JSON.stringify({ comment, type, list }))
  for (let i = 0; i < files.length; i++) {
    const { filename, size, sha256, entry } = files[i]
    r.attach(filename, entry, JSON.stringify({ size, sha256 }))
  }
  r.end(callback)
}

const boxUploadAsync = async (files, args) => {
  const { box } = args
  const { stationId, guid } = box
  let bToken = null
  if (!cloud && stationID && stationID === stationId) {
    try {
      bToken = (await Promise.promisify(getBToken)(guid))
    } catch (e) {
      console.error('req bToken error', e)
      bToken = null
    }
  }
  let res = null
  if (bToken) res = (await Promise.promisify(boxUploadLocal)(files, bToken, args)).body
  else res = (await Promise.promisify(boxUploadCloud)(files, args)).body.data
  return res
}

module.exports = {
  clearTmpTrans,
  isCloud,
  serverGet,
  serverGetAsync,
  UploadMultipleFiles,
  DownloadFile,
  createFold,
  createFoldAsync,
  downloadReq,
  downloadFile,
  uploadTorrent,
  uploadTorrentAsync,
  boxUploadAsync
}
