const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const mkdirp = Promise.promisify(require('mkdirp'))
const path = require('path')
const childProcess = require('child_process')
const debug = require('debug')('node:lib:uploadTransform:')
const request = require('request')

const Transform = require('./transform')
const { readXattr, setXattr } = require('./xattr')
const { serverGetAsync, DownloadFile } = require('./server')
const { getMainWindow } = require('./window')
const { Tasks, sendMsg } = require('./transmissionUpdate')

/* return a new file name */
const getName = async (name, dirPath, entries) => {
  const list = await fs.readdirAsync(dirPath)
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
      this.completeSize = 0
      this.lastTimeSize = 0
      this.count = 0
      this.finishCount = 0
      this.finishDate = 0
      this.paused = false
      this.restTime = 0
      this.size = 0
      this.speed = 0
      this.lastSpeed = 0
      this.state = 'visitless'
      this.trsType = 'download'
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
      transform(x, callback) {
        const read = async (entries, downloadPath, dirUUID, driveUUID, task) => {
          for (let i = 0; i < entries.length; i++) {
            if (task.paused) throw Error('task paused !')
            const entry = entries[i]
            task.count += 1
            if (!entry.newName) entry.newName = await getName(entry.name, downloadPath, entries)
            entry.downloadPath = path.join(downloadPath, entry.newName)
            entry.timeStamp = (new Date()).getTime()
            if (entry.type === 'directory') {
              /* mkdir */
              await mkdirp(entry.downloadPath)

              /* read children in entries.children or get from remote */
              if (!entries.children) {
                const listNav = await serverGetAsync(`drives/${driveUUID}/dirs/${entry.uuid}`)
                entries.children = listNav.entries
              }

              this.push({ entries: entries.children, downloadPath: entry.downloadPath, dirUUID: entry.uuid, driveUUID, task })
            } else {
              entry.tmpPath = path.join(downloadPath, `${entry.newName}.download`)
              /* download start from entry.seek */
              entry.seek = entry.seek || 0
              /* when entry.seek > 0 && entry.seek !== partDownloadFile's size, reDownload file */
              if (entry.seek) {
                try {
                  const stat = await fs.lstatAsync(entry.tmpPath)
                  if (stat.size !== entry.seek) entry.seek = 0
                } catch (e) {
                  if (e.code === 'ENOENT') entry.seek = 0
                  else throw new Error(`read pre-download file error: ${e}`)
                }
              }
              entry.lastTimeSize = 0
              task.size += entry.size
              task.completeSize = entry.seek
            }
          }
          return ({ entries, downloadPath, dirUUID, driveUUID, task })
        }

        const { entries, downloadPath, dirUUID, driveUUID, task } = x
        if (task.state !== 'downloading') task.state = 'diffing'
        read(entries, downloadPath, dirUUID, driveUUID, task).then(y => callback(null, y)).catch(e => callback(e))
      }
    })

    this.download = new Transform({
      name: 'download',
      concurrency: 1,
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
        // debug('download transform start', x.entry.name)
        const { entry, downloadPath, dirUUID, driveUUID, task } = x
        task.state = 'downloading'
        debug('transform', entry.seek)
        const stream = fs.createWriteStream(entry.tmpPath, { flags: entry.seek ? 'r+' : 'w', start: entry.seek })
        stream.on('error', err => callback(err))

        stream.on('drain', () => {
          const gap = stream.bytesWritten - entry.lastTimeSize
          entry.seek += gap
          task.completeSize += gap
          entry.lastTimeSize = stream.bytesWritten
        })

        stream.on('finish', () => {
          entry.timeStamp = (new Date()).getTime()
          debug('stream on finish', entry.timeStamp)
          const gap = stream.bytesWritten - entry.lastTimeSize
          entry.seek += gap
          task.completeSize += gap
          debug(`一段文件写入结束 当前seek位置为 ：${entry.seek}, 共${entry.size}`)
          entry.lastTimeSize = 0
          if (entry.seek === entry.size) callback(null, { entry, downloadPath, dirUUID, driveUUID, task })
        })

        const handle = new DownloadFile(driveUUID, dirUUID, entry.uuid, entry.name, entry.size, entry.seek, stream, (error) => {
          this.reqHandles.splice(this.reqHandles.indexOf(handle), 1)
          if (error) debug('DownloadFile error', error)
        })
        this.reqHandles.push(handle)
        handle.download()
      }
    })

    this.rename = new Transform({
      name: 'rename',
      concurrency: 4,
      transform: (x, callback) => {
        // debug('rename transform start', x.entry.name)
        const { entry, downloadPath, dirUUID, driveUUID, task } = x
        fs.rename(entry.tmpPath, entry.downloadPath, (error) => {
          callback(error, { entry, downloadPath, dirUUID, driveUUID, task })
        })
      }
    })

    this.readRemote.pipe(this.download).pipe(this.rename)

    this.readRemote.on('data', (x) => {
      const { task, entry } = x
      task.finishCount += 1
      debug('Download finished:', entry.newName)
      entry.finished = true
      if (task.count === task.finishCount) {
        task.state = 'finished'
        task.finishDate = (new Date()).getTime()
      }
      sendMsg()
    })

    this.readRemote.on('step', () => {
      // debug('===================================')
      // this.readDir.print()
    })
  }

  run() {
    this.countSpeed = setInterval(this.countSpeedFunc, 1000)
    this.readRemote.push({ entries: this.entries, downloadPath: this.downloadPath, dirUUID: this.dirUUID, driveUUID: this.driveUUID, task: this })
  }

  status() {
    const { uuid, downloadPath, entries, dirUUID, driveUUID, taskType, createTime, isNew, completeSize, lastTimeSize, count,
      finishCount, finishDate, name, paused, restTime, size, speed, lastSpeed, state, trsType } = this
    return ({ uuid,
      downloadPath,
      entries,
      dirUUID,
      driveUUID,
      taskType,
      createTime,
      isNew,
      completeSize,
      lastTimeSize,
      count,
      finishCount,
      finishDate,
      name,
      paused,
      restTime,
      size,
      speed,
      lastSpeed,
      state,
      trsType })
  }

  pause() {
    if (this.paused) return
    this.paused = true
    this.readRemote.clear()
    this.download.clear()
    this.reqHandles.forEach(h => h.abort())
    clearInterval(this.countSpeed)
    sendMsg()
  }

  resume() {
    this.initStatus()
    this.isNew = false
    this.run()
    sendMsg()
  }
}

const createTask = (uuid, entries, name, dirUUID, driveUUID, taskType, createTime, isNew, downloadPath) => {
  debug('createTask', name)
  const task = new Task({ uuid, entries, name, dirUUID, driveUUID, taskType, createTime, isNew, downloadPath })
  Tasks.push(task)
  task.run()
  sendMsg()
}

export { createTask }
