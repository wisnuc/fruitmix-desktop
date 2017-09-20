const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const mkdirp = Promise.promisify(require('mkdirp'))
const path = require('path')
const childProcess = require('child_process')
const debug = require('debug')('node:lib:downloadTransform:')
const request = require('request')

const Transform = require('./transform')
const { readXattr, setXattr } = require('./xattr')
const { serverGetAsync, DownloadFile } = require('./server')
const { getMainWindow } = require('./window')
const { Tasks, sendMsg } = require('./transmissionUpdate')

/* return a new file name */
const getName = async (name, dirPath, entries) => {
  const list = await fs.readdirAsync(dirPath)
  if (!list.includes(name)) return name
  const nameSpace = entries.map(e => e.name)
  nameSpace.push(...list)
  let newName = name
  const extension = name.replace(/^.*\./, '')
  for (let i = 1; nameSpace.includes(newName) || nameSpace.includes(`${newName}.download`); i++) {
    if (!extension || extension === name) {
      newName = `${name}(${i})`
    } else {
      const pureName = name.match(/^.*\./)[0]
      newName = `${pureName.slice(0, pureName.length - 1)}(${i}).${extension}`
    }
  }
  return newName
}

class Task {
  constructor(props) {
    /* props: { uuid, downloadPath, name, entries, dirUUID, driveUUID, taskType, createTime, isNew } */

    this.initStatus = () => {
      Object.assign(this, props)
      this.props = props
      this.completeSize = 0
      this.lastTimeSize = 0
      this.count = 0
      this.finishCount = 0
      this.finishDate = 0
      this.paused = true
      this.restTime = 0
      this.size = 0
      this.speed = 0
      this.lastSpeed = 0
      this.state = 'visitless'
      this.trsType = 'download'
      this.errors = []
    }

    this.initStatus()

    this.countSpeedFunc = () => {
      if (this.paused) {
        this.speed = 0
        this.restTime = 0
        return
      }
      const speed = this.completeSize - this.lastTimeSize
      this.speed = (this.lastSpeed + speed) / 2
      this.lastSpeed = speed
      this.restTime = this.speed && (this.size - this.completeSize) / this.speed
      this.lastTimeSize = this.completeSize
      sendMsg()
    }

    this.reqHandles = []

    /* Transform must be an asynchronous function !!! */
    this.readRemote = new Transform({
      name: 'readRemote',
      concurrency: 4,
      isBlocked: () => this.paused,
      transform(x, callback) {
        const read = async (entries, downloadPath, dirUUID, driveUUID, task) => {
          for (let i = 0; i < entries.length; i++) {
            if (task.paused) throw Error('task paused !')
            const entry = entries[i]
            task.count += 1
            entry.newName = entry.newName || entry.name
            entry.downloadPath = path.join(downloadPath, entry.newName)
            entry.tmpPath = path.join(downloadPath, `${entry.newName}.download`)
            if (entry.type === 'directory') {
              /* mkdir */
              await mkdirp(entry.downloadPath)

              /* get children from remote */
              const listNav = await serverGetAsync(`drives/${driveUUID}/dirs/${entry.uuid}`)
              const children = listNav.entries

              this.push({ entries: children, downloadPath: entry.downloadPath, dirUUID: entry.uuid, driveUUID, task })
            } else {
              task.size += entry.size
              entry.lastTimeSize = 0
              entry.seek = 0
            }
          }
          return ({ entries, downloadPath, dirUUID, driveUUID, task })
        }

        const { entries, downloadPath, dirUUID, driveUUID, task } = x
        if (task.state !== 'downloading') task.state = 'diffing'
        read(entries, downloadPath, dirUUID, driveUUID, task).then(y => callback(null, y)).catch(e => callback(e))
      }
    })

    this.diff = new Transform({
      name: 'diff',
      concurrency: 1,
      isBlocked: () => this.paused,
      push(X) {
        const { entries, downloadPath, dirUUID, driveUUID, task } = X
        if (task.isNew) {
          this.outs.forEach(t => t.push(X))
        } else {
          const dirEntry = []
          const fileEntry = []
          entries.forEach((entry) => {
            if (entry.type === 'directory') dirEntry.push(entry)
            else fileEntry.push(entry)
          })
          if (dirEntry.length) this.outs.forEach(t => t.push({ entries: dirEntry, downloadPath, dirUUID, driveUUID, task }))
          if (fileEntry.length) this.pending.push({ entries: fileEntry, downloadPath, dirUUID, driveUUID, task })
        }
        this.schedule()
      },
      transform: (x, callback) => {
        const diffAsync = async (entries, downloadPath, dirUUID, driveUUID, task) => {
          debug('diff async', entries.length, downloadPath, dirUUID, driveUUID)
          const localFiles = await fs.readdirAsync(downloadPath)
          for (let i = 0; i < entries.length; i++) {
            const entry = entries[i]
            if (localFiles.includes(entry.newName)) {
              task.completeSize += entry.size
              entry.finished = true
            } else if (localFiles.includes(`${entry.newName}.download`)) {
              const stat = await fs.lstatAsync(entry.tmpPath)
              entry.seek = stat.size
              task.completeSize += entry.seek
            }
          }
          return ({ entries, downloadPath, dirUUID, driveUUID, task })
        }
        const { entries, downloadPath, dirUUID, driveUUID, task } = x
        diffAsync(entries, downloadPath, dirUUID, driveUUID, task).then(y => callback(null, y)).catch(e => callback(e))
      }
    })

    this.download = new Transform({
      name: 'download',
      concurrency: 1,
      isBlocked: () => this.paused,
      push(X) {
        const { entries, downloadPath, dirUUID, driveUUID, task } = X
        entries.forEach((entry) => {
          if (entry.type === 'directory' || entry.finished) {
            this.root().emit('data', { entry, downloadPath, dirUUID, driveUUID, task })
          } else {
            this.pending.push({ entry, downloadPath, dirUUID, driveUUID, task })
          }
        })
        this.schedule()
      },
      transform: (x, callback) => {
        debug('download transform start', x.entry.name)
        const { entry, downloadPath, dirUUID, driveUUID, task } = x
        task.state = 'downloading'
        // debug('download transform entry.seek', entry.seek)
        const stream = fs.createWriteStream(entry.tmpPath, { flags: entry.seek ? 'r+' : 'w', start: entry.seek })
        stream.on('error', err => callback(err))

        stream.on('drain', () => {
          const gap = stream.bytesWritten - entry.lastTimeSize
          entry.seek += gap
          task.completeSize += gap
          entry.lastTimeSize = stream.bytesWritten
        })

        stream.on('finish', () => {
          const gap = stream.bytesWritten - entry.lastTimeSize
          entry.seek += gap
          task.completeSize += gap
          entry.lastTimeSize = 0
          task.updateStore()
          if (entry.seek === entry.size) callback(null, { entry, downloadPath, dirUUID, driveUUID, task })
          if (!task.paused && entry.seek !== entry.size) callback({ code: 'ECONNEND' })
        })

        const handle = new DownloadFile(driveUUID, dirUUID, entry.uuid, entry.name, entry.size, entry.seek, stream, (error) => {
          this.reqHandles.splice(this.reqHandles.indexOf(handle), 1)
          if (error) callback(error)
        })
        this.reqHandles.push(handle)
        handle.download()
      }
    })

    this.rename = new Transform({
      name: 'rename',
      concurrency: 4,
      isBlocked: () => this.paused,
      transform: (x, callback) => {
        // debug('rename transform start', x.entry.name)
        const { entry, downloadPath, dirUUID, driveUUID, task } = x
        fs.rename(entry.tmpPath, entry.downloadPath, (error) => {
          callback(error, { entry, downloadPath, dirUUID, driveUUID, task })
        })
      }
    })

    this.readRemote.pipe(this.diff).pipe(this.download).pipe(this.rename)

    this.readRemote.on('data', (x) => {
      const { task, entry } = x
      task.finishCount += 1
      debug('Download finished:', entry.newName)
      entry.finished = true
      if (task.count === task.finishCount) {
        task.state = 'finished'
        clearInterval(task.countSpeed)
        task.finishDate = (new Date()).getTime()
        task.compactStore()
      }
      task.updateStore()
      sendMsg()
    })

    this.readRemote.on('step', () => {
      const preLength = this.errors.length
      this.errors.length = 0
      const pipes = ['readRemote', 'diff', 'download', 'rename']
      pipes.forEach((p) => {
        if (!this[p].failed.length) return
        this[p].failed.forEach((x) => {
          if (Array.isArray(x)) {
            x.forEach(c => this.errors.push(Object.assign({ pipe: p }, c, { task: c.task.uuid, type: c.entry && c.entry.type })))
          } else this.errors.push(Object.assign({ pipe: p }, x, { task: x.task.uuid, type: x.entry && x.entry.type }))
        })
      })
      if (this.errors.length !== preLength) this.updateStore()
      if (this.errors.length > 15 || (this.readRemote.isStopped() && this.errors.length)) {
        debug('errorCount', this.errors.length)
        this.paused = true
        clearInterval(this.countSpeed)
        this.state = 'failed'
        this.updateStore()
        sendMsg()
      }
    })
  }

  run() {
    this.paused = false
    this.countSpeed = setInterval(this.countSpeedFunc, 1000)
    this.readRemote.push({ entries: this.entries, downloadPath: this.downloadPath, dirUUID: this.dirUUID, driveUUID: this.driveUUID, task: this })
  }

  status() {
    return Object.assign({}, this.props, {
      completeSize: this.completeSize,
      lastTimeSize: this.lastTimeSize,
      count: this.count,
      finishCount: this.finishCount,
      finishDate: this.finishDate,
      paused: this.paused,
      restTime: this.restTime,
      size: this.size,
      speed: this.speed,
      lastSpeed: this.lastSpeed,
      state: this.state,
      errors: this.errors,
      trsType: this.trsType
    })
  }

  createStore() {
    if (!this.isNew) return
    const data = Object.assign({}, { _id: this.uuid }, this.status())
    global.db.task.insert(data, err => err && debug(this.name, 'createStore error: ', err))
  }

  updateStore() {
    global.db.task.update({ _id: this.uuid }, { $set: this.status() }, {}, err => err && debug(this.name, 'updateStore error: ', err))
  }

  compactStore() {
    /* it's necessary to compact the data file to avoid size of db growing too large */
    global.db.task.persistence.compactDatafile()
  }

  pause() {
    if (this.paused) return
    this.paused = true
    this.reqHandles.forEach(h => h.abort())
    clearInterval(this.countSpeed)
    this.updateStore()
    sendMsg()
  }

  resume() {
    this.readRemote.clear()
    this.initStatus()
    this.isNew = false
    this.run()
    sendMsg()
  }
}

const createTask = (uuid, entries, name, dirUUID, driveUUID, taskType, createTime, isNew, downloadPath, preStatus) => {
  const task = new Task({ uuid, entries, name, dirUUID, driveUUID, taskType, createTime, isNew, downloadPath })
  Tasks.push(task)
  task.createStore()
  if (preStatus) Object.assign(task, preStatus, { isNew: false, paused: true, speed: 0, restTime: 0 })
  else task.run()
  sendMsg()
}

export { createTask }
