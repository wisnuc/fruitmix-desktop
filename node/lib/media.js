/* import core module */
import fs from 'fs'
import path from 'path'
import UUID from 'node-uuid'
import { ipcMain } from 'electron'
import { EventEmitter } from 'events'

/* import file module */
import store from './store'
import { DownloadFile } from './server'
import { getMainWindow } from './window'

/* init */
const getTmpTransPath = () => store.getState().config.tmpTransPath

class Worker extends EventEmitter {
  constructor(id) {
    super()
    this.finished = false
    this.id = id
    this.state = 'PENDDING'

    this.serverDownload = (endpoint, qs, downloadPath, name, callback) => {
      const tmpPath = path.join(getTmpTransPath(), UUID.v4())
      const dst = path.join(downloadPath, name)

      const stream = fs.createWriteStream(tmpPath)
      stream.on('error', (error) => {
        console.log(error)
        const e = new Error('write image error')
        e.text = error
        this.finished = true
        this.state = 'FINISHED'
        return callback(e)
      })

      stream.on('finish', () => {
        if (this.finished) return null
        fs.rename(tmpPath, dst, (error) => {
          if (error) {
            console.log(error)
            const e = new Error('move image error')
            e.text = error
            return callback(e)
          }
          return callback(null)
        })
      })

      this.requestHandler = new DownloadFile(endpoint, qs, name, 0, 0, stream, (error) => {
        if (error) callback(error)
        this.requestHandler = null
      })
      this.requestHandler.download()
    }

    this.serverDownloadAsync = Promise.promisify(this.serverDownload)
  }

  abort() {
    if (this.finished) return
    this.state = 'FINISHED'
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
    return this.state === 'PENDDING'
  }

  isFinished() {
    return this.state === 'FINISHED'
  }

  run() {}

  cleanup() {}
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
      if (err || !stat.size) return this.request()
      return this.finish(fpath)
    })
  }

  request() {
    const qs = {
      alt: 'thumbnail',
      width: this.width,
      height: this.height,
      autoOrient: true,
      modifier: 'caret'
    }
    this.serverDownloadAsync(`media/${this.digest}`, qs, this.dirpath, this.cacheName).then((data) => {
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
    const qs = { alt: 'data' }
    this.serverDownloadAsync(`media/${this.digest}`, qs, this.dirpath, this.digest)
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
const getThumbPath = () => store.getState().config.thumbPath
const getImagePath = () => store.getState().config.imagePath

ipcMain.on('mediaShowThumb', (event, session, digest, height, width) => {
  mediaFileManager.createThumbTask(session, digest, getThumbPath(), height, width)
})

ipcMain.on('mediaHideThumb', (event, session) => {
  mediaFileManager.abort(session, 'thumb', () => {})
})

ipcMain.on('mediaShowImage', (event, session, digest) => {
  mediaFileManager.createImageTask(session, digest, getImagePath())
})

ipcMain.on('mediaHideImage', (event, session) => {
  mediaFileManager.abort(session, 'image', () => {})
})
