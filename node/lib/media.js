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
const media = []
// const getIpAddr = '192.168.5.65'
const getIpAddr = () => store.getState().login2.device.mdev.address

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
    console.log(`fail download of digest:${digest} of session: ${session} err: ${err}`)
  })
}

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
    super()
    this.finished = false
    this.id = id
    this.state = 'PADDING'
  }

  abort() {
    if (this.finished) return
    this.finished = true
    if (this.requestHandler) this.requestHandler.abort()
    const e = new Error('request aborted')
    e.code = 'EABORT'
    this.emit('error', e)
  }

  finish(data) {
    if (this.finished) return
    this.finished = true
    this.state = 'FINISHED'
    this.emit('finish', data)
  }

  error(err) {
    if (this.finished) return
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
    const opts = { method: 'GET', url }
    if (qs) opts.qs = qs
    if (typeof token === 'string') { opts.headers = { Authorization: `JWT ${token}` } } else if (typeof token === 'object' && token !== null) {
      opts.auth = token
    }

    // TODO TMP file and rename JACK

    const tmpPath = path.join(global.tmpPath, UUID.v4())
    const dst = path.join(downloadPath, name)
    const stream = fs.createWriteStream(path.join(tmpPath))
    this.requestHandler = request(opts)
      .on('error', err => {
        return callback(err)
      })
      .on('response', res => {
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
      })
    // (err, res) => {
    //   if (err) return callback(err)
    //   if (res.statusCode !== 200) {
    //     console.log(res.body)
    //     const e = new Error('http status code not 200')
    //     e.code = 'EHTTPSTATUS'
    //     e.status = res.statusCode
    //     return callback(e)
    //   }

    //   try {
    //     fs.renameSync(tmpPath, dst)
    //     return callback(null, null)
    //   } catch (e) {
    //     console.log('req GET json parse err')
    //     console.log(e)
    //     const e1 = new Error('json parse error')
    //     e1.code === 'EJSONPARSE'
    //     return callback(e1)
    //   }
    this.requestHandler.pipe(stream)
  }

  serverDownloadAsync(endpoint, qs, downloadPath, name) {
    const requestDownloadAsync = Promise.promisify(this.requestDownload.bind(this))
    const ip = getIpAddr()
    const port = 3721
    const token = store.getState().login2.device.token.data.token
    return requestDownloadAsync(`http://${ip}:${port}/${endpoint}`, qs, token, downloadPath, name)
  }

}

class GetThumbTask extends Worker {
  constructor(session, digest, dirpath, height, width) {
    super(session)
    this.session = session
    this.digest = digest
    this.dirpath = dirpath
    this.height = height
    this.width = width
    this.cacheName = `${this.digest}&height=${this.height}&width=${this.width}`
  }

  run() {
    this.state = 'RUNNING'
    const fpath = path.join(this.dirpath, this.cacheName)
    fs.lstat(fpath, (err, stat) => {
      if (err) return this.request()
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
      console.log(`fail download of digest:${this.digest} of session: ${this.session} err: ${err}`)
      // setTimeout(() => getThumb(digest, cacheName, mediaPath, session), 2000)
      this.error(err)
    })
  }
}

class GetImageTask extends Worker {
  constructor(session, digest, dirpath) {
    super(session)
    this.session = session
    this.digest = digest
    this.dirpath = dirpath
  }

  run() {
    this.state = 'RUNNING'
    const fpath = path.join(this.dirpath, this.digest)
    fs.lstat(fpath, (err, stat) => {
      if (err) return this.request()
      return this.finish(fpath)
    })
  }

  request() {
    serverDownloadAsync(`media/${hash}/download`, null, this.dirpath, this.digest)
    .then((data) => {
      this.finish(path.join(this.dirpath, this.digest))
    })
    .catch((e) => {
      this.error(e)
    })
  }
}

class MediaFileManager {
  constructor() {
    this.thumbTaskQueue = []
    this.imageTaskQueue = []
    this.thumbTaskLimit = 20
    this.imageTaskLimit = 10
  }

  createThumbTask(session, digest, dirpath, height, width) {
    const task = new GetThumbTask(session, digest, dirpath, height, width)
    task.on('finish', (data) => {
      getMainWindow().webContents.send('getThumbSuccess', session, data)
      this.schedule()
    })
    task.on('error', (err) => {
      // undefined
      this.schedule()
    })
    this.thumbTaskQueue.push(task)
    this.schedule()
  }

  createImageTask(session, digest, dirpath) {
    const task = new GetImageTask(session, digest, dirpath)
    task.on('finish', (data) => {
      getMainWindow().webContents.send('donwloadMediaSuccess', session, data)
      this.schedule()
    })
    task.on('error', (err) => {
      // undefined
      this.schedule()
    })
    this.imageTaskQueue.push(task)
    this.schedule()
  }

  schedule() {
    const thumbDiff = this.thumbTaskLimit - this.thumbTaskQueue.filter(worker => worker.isRunning()).length
    if (thumbDiff > 0) {
      this.thumbTaskQueue.filter(worker => worker.isPadding())
        .slice(0, thumbDiff)
        .forEach(worker => worker.run())
    }

    const imageDiff = this.imageTaskLimit - this.imageTaskQueue.filter(worker => worker.isRunning()).length
    if (imageDiff > 0) {
      this.imageTaskQueue.filter(worker => worker.isPadding())
        .slice(0, imageDiff)
        .forEach(worker => worker.run())
    }
  }

  abort(id, type, callback) {
    let worker
    if (type === 'thumb') { worker = this.thumbTaskQueue.find((worker => worker.id === id)) } else { worker = this.imageTaskQueue.find((worker => worker.id === id)) }
    if (worker && !worker.isFinished()) {
      worker.abort()
      process.nextTick(() => callback(null, true))
    } else {
      const e = new Error('worker aborted')
      e.code = 'EABORT'
      process.nextTick(() => callback(e))
    }
  }
}

const mediaFileManager = new MediaFileManager()
const dirpath = mediaPath
ipcMain.on('mediaShowThumb', (event, session, digest, height, width) => {
  mediaFileManager.createThumbTask(session, digest, dirpath, height, width)
})

ipcMain.on('mediaHideThumb', (event, session) => {
  mediaFileManager.abort(session, 'thumb', () => {})
})

ipcMain.on('mediaShowImage', (event, session, digest) => {
  mediaFileManager.createImageTask(session, digest, dirpath)
})

ipcMain.on('mediaHideImage', (event, session) => {
  mediaFileManager.abort(session, 'image', () => {})
})
