/* import core module */
import path from 'path'
import fs from 'fs'
import Debug from 'debug'
import { ipcMain } from 'electron'
import { EventEmitter } from 'events'
import UUID from 'node-uuid'
import request from 'request'

/* import file module */
import { serverGetAsync, serverPostAsync, serverPatchAsync, serverDeleteAsync, serverDownloadAsync } from './server'
import action from '../serve/action/action'
import store from '../serve/store/store'
import { getMainWindow } from './window'

/* init */
const debug = Debug('lib:media')
let media=[]
const getIpAddr = () => store.getState().login2.device.address

/* functions */
const parseDate = (date) => {
  if (!date) return 0
  const a = date.replace(/:|\s/g, '')
  return parseInt(a, 10)
}

const getThumb = (digest, cacheName, mediaPath, session) => {
  const qs = {
    width: 210,
    height: 210,
    autoOrient: true,
    modifier: 'caret'
  }
  serverDownloadAsync(`media/${digest}/thumbnail`, qs, mediaPath, digest + cacheName).then((data) => {
    getMainWindow().webContents.send('getThumbSuccess', session, path.join(mediaPath, `${digest}thumb210`))
  }).catch((err) => {
    // console.log(err)
    console.log(`fail download of digest:${digest} of session: ${session} err: ${err}`)
    // setTimeout(() => getThumb(digest, cacheName, mediaPath, session), 2000)
  })
}

/* getMediaData */
ipcMain.on('getMediaData', (event) => {
  let tmpTime = Date.now()
  console.log(`before getMedia ${Date.now() - tmpTime}`)
  serverGetAsync('media').then((data) => {
    media = data
    console.log(`start sort${Date.now() - tmpTime}`)
    media.sort((prev, next) => (parseDate(next.exifDateTime) - parseDate(prev.exifDateTime)) || (
      parseInt(`0x${next.digest}`, 16) - parseInt(`0x${prev.digest}`, 16)))
    console.log(`finish sort${Date.now() - tmpTime}`)
    dispatch(action.setMedia(media))
  }).catch((err) => {
    console.log(err)
  })
})

/* getMediaImage */
ipcMain.on('getMediaImage', (event, session, hash) => {
  fs.stat(path.join(mediaPath, hash), (err, data) => {
    if (err) {
      serverDownloadAsync(`media/${hash}/download`, null, mediaPath, hash).then((data) => {
        getMainWindow().webContents.send('donwloadMediaSuccess', session, path.join(mediaPath, hash))
      })
    } else {
      getMainWindow().webContents.send('donwloadMediaSuccess', session, path.join(mediaPath, hash))
    }
  })
})

/* getThumbnail */
ipcMain.on('getThumb', (event, session, digest) => {
  const cacheName = 'thumb210'
  fs.stat(path.join(mediaPath, digest + cacheName), (err, data) => {
    if (err) {
      getThumb(digest, cacheName, mediaPath, session)
    } else {
      getMainWindow().webContents.send('getThumbSuccess', session, path.join(mediaPath, `${digest}thumb210`))
    }
  })
})


class Worker extends EventEmitter {
  constructor(id) {
    this.finished = false
    this.id = id
    this.state = 'PADDING'
  }

  abort(){
    if(this.finished) return 
    this.finished = true
    if(this.request) request.abort()
    let e = new Error('request aborted')
    e.code = 'EABORT'
    this.emit('error', e)
  }

  finish(data) {
    if(this.finished) return
    this.finished = true
    this.state = 'FINISHED'
    this.emit('finish', data)
  }

  error(err) {
    if(this.finished) return 
    this.finished = true
    this.state = 'FINISHED'
    this.emit('error', err)
  }

  isRunning() {
    return this.state === 'RUNNING'
  }

  isPadding() {
    return this.state === 'PADDING'
  }

  isFinished() {
    return this.state === 'FINISHED'
  }

  run() {}

  cleanup() {}

  requestDownload(url, qs, token, downloadPath, name, callback) {
    let opts = { method: 'GET', url }
    if (qs) opts.qs = qs
    if (typeof token === 'string')
      opts.headers = { Authorization: 'JWT ' + token }
    else if (typeof token === 'object' && token !== null) {
      opts.auth = token
    }

    //TODO TMP file and rename JACK

    let stream = fs.createWriteStream(path.join(downloadPath,name))
    this.request = request(opts, (err, res) => {
      if (err) return callback(err)
      if (res.statusCode !== 200) {
        console.log(res.body)
        let e = new Error('http status code not 200')
        e.code = 'EHTTPSTATUS'
        e.status = res.statusCode
        return callback(e)
      }

      try {
        return callback(null, null)
      }
      catch (e) {
        console.log('req GET json parse err')
        console.log(e)
        let e1 = new Error('json parse error')
        e1.code === 'EJSONPARSE'
        return callback(e1)
      }
    }).pipe(stream)
  }

  serverDownloadAsync(endpoint, qs, downloadPath, name) {
    let requestDownloadAsync = Promise.promisify(this.requestDownload.bind(this))
    let ip = getIpAddr()
    let port = 3721
    let token = store.getState().login.obj.token
    return requestDownloadAsync(`http://${ip}:${port}/${endpoint}`, qs, token, downloadPath, name)
  }

}

class GetThumbTask extends Worker{
  constructor(id, session, digest, dirpath, height, width) {
    super(id)
    this.session = session
    this.digest = digest
    this.dirpath = dirpath
    this.height = height
    this.width = width
    this.cacheName = this.digest + '&height=' + this.height + '&width=' + this.width
  }

  run() {
    this.state = 'RUNNING'
    let fpath = path.join(this.dirpath, this.cacheName)
    fs.lstat(fpath, (err, stat) => {
      if(err) return this.request()
      return this.finish(fpath)
    })
  }

  request() {
    const qs = {
      width: this.width,
      height: this.height,
      autoOrient: true,
      modifier: 'caret'
    }
    this.serverDownloadAsync(`media/${this.digest}/thumbnail`, qs, this.dirpath, this.cacheName).then((data) => {
      this.finish(path.join(this.dirpath, this.cacheName))
    }).catch((err) => {
      console.log(`fail download of digest:${digest} of session: ${session} err: ${err}`)
      // setTimeout(() => getThumb(digest, cacheName, mediaPath, session), 2000)
      this.error(err)
    })
  }
}

class GetImageTask extends Worker {
  constructor(id, session, digest, dirpath){
    super(id)
    this.session = session
    this.digest = digest
    this.dirpath = dirpath
  }
  
  run() {
    this.state = 'RUNNING'
    let fpath = path.join(this.dirpath, this.digest)
    fs.lstat(fpath, (err, stat) => {
      if(err) return this.request()
      return this.finish(fpath)
    })
  }

  request() {
    serverDownloadAsync(`media/${hash}/download`, null, this.dirpath, this.digest)
    .then((data) => {
      this.finish(path.join(this.dirpath, this.digest))
    })
    .catch(e => {
      this.error(e)
    })
  }
}

class MediaFileManager {
  constructor(){
    this.thumbTaskQueue = []
    this.imageTaskQueue = []
    this.thumbTaskLimit = 20
    this.imageTaskLimit = 10
  }

  createThumbTask(id, session, digest, dirpath, height, width) {
    let task = new GetThumbTask(id, session, digest, dirpath, height, width)
    task.on('finish', data => {
      getMainWindow().webContents.send('getThumbSuccess', session, data)
      this.schedule()
    })
    task.on('error', err => {
      // undefined
      this.schedule()
    })
    this.thumbTaskQueue.push(task)
    this.schedule()
  }

  createImageTask(id, session, digest, dirpath) {
    let task = new GetImageTask(id, session, digest, dirpath)
    task.on('finish', data => {
      getMainWindow().webContents.send('donwloadMediaSuccess', session, data)
      this.schedule()
    })
    task.on('error', err => {
      // undefined
      this.schedule()
    })
    this.imageTaskQueue.push(task)
    this.schedule()
  }

  schedule() {
    let thumbDiff = this.thumbTaskLimit - this.thumbTaskQueue.filter(worker => worker.isRunning()).length
    if (thumbDiff > 0) 
      this.thumbTaskQueue.filter(worker => worker.isPadding())
        .slice(0, thumbDiff)
        .forEach(worker => worker.run())
    
    let imageDiff = this.imageTaskLimit - this.imageTaskQueue.filter(worker => worker.isRunning()).length
    if (imageDiff > 0) 
      this.imageTaskQueue.filter(worker => worker.isPadding())
        .slice(0, imageDiff)
        .forEach(worker => worker.run())
  }

  abort(id, type, callback){
    let worker
    if(type === 'thumb')
      worker = this.thumbTaskQueue.find((worker => worker.id === workerId))
    else
      worker = this.imageTaskQueue.find((worker => worker.id === workerId))
    if(worker && !worker.isFinished()){
      worker.abort()
      process.nextTick(() => callback(null, true))
    }else{
      let e = new Error('worker aborted')
      e.code = 'EABORT'
      process.nextTick(() => callback(e))
    }
  }
}

let mediaFileManager = new MediaFileManager()
let dirpath = ''
ipcMain.on('mediaShowThumb', (event, session, digest, id, height, width) => {
  mediaFileManager.createThumbTask(id, session, digest, dirpath, height, width)
})

ipcMain.on('mediaHideThumb', (event, id) => {
  mediaFileManager.abort(id, 'thumb', () => {})
})

ipcMain.on('mediaShowImage', (event, session, digest, id) => {
  mediaFileManager.createImageTask(id, session, digest, dirpath)
})

ipcMain.on('mediaHideImage', (event, id) => {
  mediaFileManager.abort(id, 'image', () => {})
})
