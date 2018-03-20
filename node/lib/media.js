const fs = require('fs')
const path = require('path')
const UUID = require('uuid')
const Promise = require('bluebird')
const { ipcMain } = require('electron')
const { EventEmitter } = require('events')
const store = require('./store')
const { DownloadFile } = require('./server')
const { getMainWindow } = require('./window')

/* init */
const getThumbPath = () => store.getState().config.thumbPath
const getImagePath = () => store.getState().config.imagePath
const getTmpTransPath = () => store.getState().config.tmpTransPath

class Worker extends EventEmitter {
  constructor (id) {
    super()
    this.finished = false
    this.id = id
    this.state = 'PENDDING'

    this.serverDownload = (endpoint, qs, downloadPath, name, station, callback) => {
      const tmpPath = path.join(getTmpTransPath(), UUID.v4())
      const dst = path.join(downloadPath, name)

      const stream = fs.createWriteStream(tmpPath)
      stream.on('error', (error) => {
        const e = new Error('write image error')
        e.text = error
        return callback(e)
      })

      stream.on('finish', () => {
        if (this.finished) return
        fs.rename(tmpPath, dst, (error) => {
          if (error) {
            const e = new Error('move image error')
            e.text = error
            callback(e)
          } else callback(null)
        })
      })

      this.stream = stream

      this.requestHandler = new DownloadFile(endpoint, qs, name, 0, 0, stream, station, (error) => {
        if (error) callback(error)
        this.requestHandler = null
        this.stream = null
      })
      this.requestHandler.download()
    }

    this.serverDownloadAsync = Promise.promisify(this.serverDownload)
  }

  abort () {
    if (this.finished) return
    this.state = 'FINISHED'
    this.finished = true
    if (this.stream) {
      this.stream.end()
    }
    if (this.requestHandler) this.requestHandler.abort()

    const e = new Error('request aborted')
    e.code = 'EABORT'
    this.emit('error', e)
  }

  finish (data) {
    if (this.finished) return
    this.finished = true
    this.state = 'FINISHED'
    this.emit('finish', data)
  }

  error (err) {
    if (this.finished) return
    this.finished = true
    this.state = 'FINISHED'
    this.emit('error', err)
  }

  isRunning () {
    return this.state === 'RUNNING'
  }

  isPendding () {
    return this.state === 'PENDDING'
  }

  isFinished () {
    return this.state === 'FINISHED'
  }

  run () {}

  cleanup () {}
}

class GetThumbTask extends Worker {
  constructor (session, digest, dirpath, height, width, station) {
    super(session)
    this.session = session
    this.digest = digest
    this.dirpath = dirpath
    this.height = height
    this.width = width
    this.station = station
    this.cacheName = `${this.digest}&height=${this.height}&width=${this.width}`
  }

  run () {
    this.state = 'RUNNING'
    const fpath = path.join(this.dirpath, this.cacheName)
    fs.lstat(fpath, (err, stat) => { // aborted when lstat ???
      if (err || !stat.size) return this.request()
      return this.finish(fpath)
    })
  }

  request () {
    if (this.state !== 'RUNNING') return
    const qs = {
      alt: 'thumbnail',
      autoOrient: true,
      modifier: 'caret',
      width: this.width,
      height: this.height,
      boxUUID: this.station && this.station.boxUUID
    }
    this.serverDownloadAsync(`media/${this.digest}`, qs, this.dirpath, this.cacheName, this.station).then((data) => {
      this.finish(path.join(this.dirpath, this.cacheName))
    }).catch((err) => {
      // console.log(`Download media error: \n${err}\n`)
      // setTimeout(() => getThumb(digest, cacheName, mediaPath, session), 2000)
      this.error(err)
    })
  }
}

class GetImageTask extends Worker {
  constructor (session, digest, dirpath, station) {
    super(session)
    this.session = session
    this.digest = digest
    this.dirpath = dirpath
    this.station = station
  }

  run () {
    this.state = 'RUNNING'
    const fpath = path.join(this.dirpath, this.digest)
    fs.lstat(fpath, (err, stat) => {
      if (err) return this.request()
      return this.finish(fpath)
    })
  }

  request () {
    if (this.state !== 'RUNNING') return
    const qs = { alt: 'data', boxUUID: this.station && this.station.boxUUID }
    this.serverDownloadAsync(`media/${this.digest}`, qs, this.dirpath, this.digest, this.station)
      .then((data) => {
        this.finish(path.join(this.dirpath, this.digest))
      })
      .catch((e) => {
        this.error(e)
      })
  }
}

class MediaFileManager {
  constructor () {
    this.thumbTaskQueue = []
    this.imageTaskQueue = []
    this.thumbTaskLimit = 20
    this.imageTaskLimit = 10
  }

  createThumbTask (session, digest, dirpath, height, width, station) {
    const task = new GetThumbTask(session, digest, dirpath, height, width, station)
    task.on('finish', (data) => {
      getMainWindow().webContents.send('getThumbSuccess', session, data)
      this.schedule()
    })
    task.on('error', (err) => {
      console.error(`createThumbTask error: \n${err}`)
      this.schedule()
    })
    this.thumbTaskQueue.push(task)
    this.schedule()
  }

  createImageTask (session, digest, dirpath, station) {
    const task = new GetImageTask(session, digest, dirpath, station)
    task.on('finish', (data) => {
      getMainWindow().webContents.send('donwloadMediaSuccess', session, data)
      this.schedule()
    })
    task.on('error', (err) => {
      console.error(`createImageTask error: \n${err}`)
      this.schedule()
    })
    this.imageTaskQueue.push(task)
    this.schedule()
  }

  schedule () {
    const thumbDiff = this.thumbTaskLimit - this.thumbTaskQueue.filter(worker => worker.isRunning()).length
    if (thumbDiff > 0) {
      this.thumbTaskQueue.filter(worker => worker.isPendding())
        .slice(0, thumbDiff)
        .forEach(worker => worker.run())
    }

    const imageDiff = this.imageTaskLimit - this.imageTaskQueue.filter(worker => worker.isRunning()).length
    if (imageDiff > 0) {
      this.imageTaskQueue.filter(worker => worker.isPendding())
        .slice(0, imageDiff)
        .forEach(worker => worker.run())
    }
  }

  abort (id, type, callback) {
    let worker
    if (type === 'thumb') {
      worker = this.thumbTaskQueue.find(w => w.id === id)
    } else {
      worker = this.imageTaskQueue.find(w => w.id === id)
    }
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

ipcMain.on('mediaShowThumb', (event, session, digest, height, width, station) => {
  mediaFileManager.createThumbTask(session, digest, getThumbPath(), height, width, station)
})

ipcMain.on('mediaHideThumb', (event, session) => {
  mediaFileManager.abort(session, 'thumb', () => {})
})

ipcMain.on('mediaShowImage', (event, session, digest, station) => {
  mediaFileManager.createImageTask(session, digest, getImagePath(), station)
})

ipcMain.on('mediaHideImage', (event, session) => {
  mediaFileManager.abort(session, 'image', () => {})
})
