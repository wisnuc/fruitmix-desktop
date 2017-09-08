import store from '../serve/store/store'
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
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
const getName = async (currName, dirUUID, driveUUID) => currName // TODO

const getDownloadPath = () => store.getState().config.downloadPath

class Task {
  constructor(props) {
    /* props: { uuid, downloadPath, entries, dirUUID, driveUUID, taskType, createTime, isNew } */

    this.initStatus = () => {
      Object.assign(this, props)
      this.completeSize = 0
      this.lastTimeSize = 0
      this.count = 0
      this.finishCount = 0
      this.finishDate = 0
      this.name = props.entries[0].name
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

    this.diff = new Transform({
      name: 'diff',
      concurrency: 4,
      push(x) {
        if (x.type === 'directory' || x.task.isNew) {
          this.outs.forEach(t => t.push([x]))
        } else {
          /* combine to one post */
          const { dirUUID } = x
          const i = this.pending.findIndex(p => p[0].dirUUID === dirUUID)
          if (i > -1) {
            this.pending[i].push(x)
          } else {
            this.pending.push([x])
          }
          this.schedule()
        }
      },

      transform: (X, callback) => {
        debug('this.diff transform', X.length)
        const diffAsync = async (local, driveUUID, dirUUID, task) => {
          const listNav = await serverGetAsync(`drives/${driveUUID}/dirs/${dirUUID}`)
          const remote = listNav.entries
          if (!remote.length) return local
          const map = new Map()
          local.forEach(l => map.set(l.entry.replace(/^.*\//, ''), l))
          remote.forEach((r) => {
            if (map.has(r.name)) {
              task.finishCount += 1
              debug('this.diff transform find already finished', task.finishCount, r.name)
              task.completeSize += map.get(r.name).stat.size
              map.delete(r.name)
            }
          })
          return [...map.values()]
        }

        const { driveUUID, dirUUID, task } = X[0]
        if (task.state !== 'uploading') task.state = 'diffing'

        diffAsync(X, driveUUID, dirUUID, task).then(value => callback(null, value)).catch(callback)
      }
    })

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
            if (entry.type === 'directory') {
              /* mkdir */
              entry.newName = await getName(entry.name, dirUUID, driveUUID)
              const newPath = path.join(downloadPath, entry.newName)

              await fs.mkdirAsync(newPath)

              /* read remote child */
              const listNav = await serverGetAsync(`drives/${driveUUID}/dirs/${entry.uuid}`)
              const children = listNav.entries

              this.push({ entries: children, downloadPath: newPath, dirUUID: entry.uuid, driveUUID, task })
            } else {
              task.size += entry.size
            }
          }
          return ({ entries, downloadPath, dirUUID, driveUUID, task })
        }
        const { entries, downloadPath, dirUUID, driveUUID, task } = x
        read(entries, downloadPath, dirUUID, driveUUID, task).then(y => callback(null, y)).catch(e => callback(e))
      }
    })

    this.download = new Transform({
      name: 'download',
      concurrency: 1,
      push(X) {
        const { entries, downloadPath, dirUUID, driveUUID, task } = X
        entries.forEach((entry) => {
          if (entry.type === 'directory') {
            task.finishCount += 1
            this.root().emit('data', { entry, downloadPath, dirUUID, driveUUID, task })
          } else {
            this.pending.push({ entry, downloadPath, dirUUID, driveUUID, task })
          }
        })
        this.schedule()
      },
      transform: (x, callback) => {
        debug('download transform start', x.entry)
        const { entry, downloadPath, dirUUID, driveUUID, task } = x
        task.state = 'downloading'
        entry.newName = entry.name
        const handle = new DownloadFile(driveUUID, dirUUID, entry.uuid, entry.name, entry.newName, downloadPath, (error) => {
          this.reqHandles.splice(this.reqHandles.indexOf(handle), 1)
          if (!error) {
            task.finishCount += 1
            if (task.count === task.finishCount) {
              task.state = 'finished'
              task.finishDate = (new Date()).getTime()
            }
          }
          callback(error, { entry, downloadPath, dirUUID, driveUUID, task })
        })
        this.reqHandles.push(handle)
        handle.download()
      }
    })

    this.readRemote.pipe(this.download)

    this.readRemote.on('data', (x) => {
      const { task, entry } = x
      debug('Download finished:', entry.newName)
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

const createTask = (uuid, entries, dirUUID, driveUUID, taskType, createTime, isNew, absPath) => {
  const downloadPath = absPath || getDownloadPath()
  const task = new Task({ uuid, entries, dirUUID, driveUUID, taskType, createTime, isNew, downloadPath })
  Tasks.push(task)
  task.run()
  sendMsg()
}

export { createTask }
