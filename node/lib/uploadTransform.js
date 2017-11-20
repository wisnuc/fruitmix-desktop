const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('original-fs'))
const path = require('path')
const childProcess = require('child_process')
const debug = require('debug')('node:lib:uploadTransform:')
const sanitize = require('sanitize-filename')

const Transform = require('./transform')
const { readXattr, setXattr } = require('./xattr')
const { createFoldAsync, UploadMultipleFiles, serverGetAsync, isCloud } = require('./server')
const { getMainWindow } = require('./window')
const { Tasks, sendMsg } = require('./transmissionUpdate')
const hashFileAsync = require('./filehash')

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

class Task {
  constructor(props) {
    /* props: { uuid, entries, dirUUID, driveUUID, taskType, createTime, isNew, policies } */

    this.initStatus = () => {
      Object.assign(this, props)
      this.props = props
      this.completeSize = 0
      this.lastTimeSize = 0
      this.count = 0
      this.trueCount = 0
      this.finishCount = 0
      this.finishDate = 0
      this.name = props.policies[0] && props.policies[0].checkedName || path.parse(props.entries[0]).base
      this.paused = true
      this.restTime = 0
      this.size = 0
      this.trueSize = 0
      this.speed = 0
      this.lastSpeed = 0
      this.state = 'visitless'
      this.trsType = 'upload'
      this.errors = []
      this.warnings = []
      this.startUpload = (new Date()).getTime()
    }

    this.initStatus()

    this.countSpeedFunc = () => {
      if (this.paused) {
        this.speed = 0
        this.restTime = 0
        sendMsg()
        clearInterval(this.countSpeed)
        return
      }
      const speed = Math.max(this.completeSize - this.lastTimeSize, 0)
      this.speed = Math.round((this.lastSpeed * 3 + speed) / 4)
      this.lastSpeed = this.speed
      this.averageSpeed = Math.round(this.completeSize / ((new Date()).getTime() - this.startUpload) * 1000)
      this.restTime = this.speed && (this.size - this.completeSize) / this.averageSpeed
      this.lastTimeSize = this.completeSize
      sendMsg()
    }

    this.reqHandles = []

    /* Transform must be an asynchronous function !!! */
    this.readDir = new Transform({
      name: 'readDir',
      concurrency: 4,
      transform(x, callback) {
        const read = async (entries, dirUUID, driveUUID, policies, task) => {
          for (let i = 0; i < entries.length; i++) {
            if (task.paused) break
            const entry = entries[i]
            const stat = await fs.lstatAsync(path.resolve(entry))
            const fullName = path.parse(entry).base

            if (fullName === '.DS_Store' && !stat.isDirectory()) {
              task.warnings.push(Object.assign({
                pipe: 'readDir', entry, error: { code: 'EDSSTORE' }, stat, task: task.uuid, type: 'file'
              }))
              continue
            }

            if (!stat.isFile() && !stat.isDirectory()) {
              task.warnings.push(Object.assign({
                pipe: 'readDir', entry, error: { code: 'ETYPE' }, stat, task: task.uuid
              }))
              console.log('unsupport type', entry)
              continue
            }

            const type = stat.isDirectory() ? 'directory' : 'file'
            if (fullName !== sanitize(fullName)) {
              task.warnings.push(Object.assign({
                pipe: 'readDir', entry, error: { code: 'ENAME' }, stat, task: task.uuid, type
              }))
              console.log('invalid name:', entry)
              continue
            }

            task.count += 1

            if (stat.isDirectory()) {
              /* read child */
              const children = await fs.readdirAsync(path.resolve(entry))
              const newEntries = []
              children.forEach(c => newEntries.push(path.join(entry, c)))
              await read(newEntries, dirUUID, driveUUID, policies, task)
            } else task.size += stat.size
          }
          return ({ entries, dirUUID, driveUUID, policies, task })
        }
        const { entries, dirUUID, driveUUID, policies, task } = x
        read(entries, dirUUID, driveUUID, policies, task).then(y => callback(null, y)).catch(callback)
      }
    })

    this.mkdir = new Transform({
      name: 'mkdir',
      concurrency: 4,
      transform(x, callback) {
        const read = async (entries, dirUUID, driveUUID, policies, task) => {
          const files = []
          for (let i = 0; i < entries.length; i++) {
            // if (task.paused) throw Error('task paused !')
            if (task.paused) break
            const policy = policies[i]
            const entry = entries[i]
            const stat = await fs.lstatAsync(path.resolve(entry))
            const fullName = path.parse(entry).base

            if (fullName === '.DS_Store' && !stat.isDirectory()) continue
            if (!stat.isFile() && !stat.isDirectory()) continue
            if (fullName !== sanitize(fullName)) continue

            task.trueCount += 1

            if (stat.isDirectory()) {
              /* create fold and return the uuid */
              const dirname = policy.mode === 'rename' ? policy.checkedName : fullName

              const dirEntry = await createFoldAsync(driveUUID, dirUUID, dirname, entries, policy)
              const uuid = dirEntry.uuid

              /* read child */
              const children = await fs.readdirAsync(path.resolve(entry))
              const newEntries = []
              children.forEach(c => newEntries.push(path.join(entry, c)))

              /* mode 'merge' should apply to children */
              const childPolicies = []
              childPolicies.length = newEntries.length
              childPolicies.fill({ mode: policy.mode }) // !!! fill with one object, all shared !!!
              if (policy.mode === 'rename' || policy.mode === 'replace') childPolicies.fill({ mode: 'normal' })

              if (task.paused) break
              this.push({ entries: newEntries, dirUUID: uuid, driveUUID, policies: childPolicies, task })
            } else task.trueSize += stat.size

            files.push({ entry, stat, policy })
          }
          return ({ files, dirUUID, driveUUID, task, entries })
        }
        const { entries, dirUUID, driveUUID, policies, task } = x
        read(entries, dirUUID, driveUUID, policies, task).then(y => callback(null, y)).catch(callback)
      }
    })

    this.hash = new Transform({
      name: 'hash',
      concurrency: 1,
      push(x) {
        const { files, dirUUID, driveUUID, task } = x
        debug('this.hash push', files.length)
        files.forEach((f) => {
          if (f.stat.isDirectory()) {
            this.outs.forEach(t => t.push(Object.assign({}, f, { dirUUID, driveUUID, task, type: 'directory' })))
          } else {
            this.pending.push(Object.assign({}, f, { dirUUID, driveUUID, task }))
          }
        })
        this.schedule()
        // debug('this.hash push forEach', files.length)
      },
      transform: (x, callback) => {
        const { entry, dirUUID, driveUUID, stat, policy, retry, task } = x
        if (task.paused) return
        if (task.state !== 'uploading' && task.state !== 'diffing') task.state = 'hashing'
        const hashStart = (new Date()).getTime()
        readXattr(entry, (error, attr) => {
          if (!error && attr && attr.parts && retry === undefined) {
            callback(null, { entry, dirUUID, driveUUID, parts: attr.parts, type: 'file', stat, policy, retry, task })
            return
          }

          if (stat.size < 134217728) {
            hashFileAsync(entry, stat.size, 1024 * 1024 * 1024)
              .then(parts => setXattr(entry, { parts }, (err, xattr) => {
                debug('hash finished', ((new Date()).getTime() - hashStart) / 1000)
                const p = xattr && xattr.parts
                const r = retry ? retry + 1 : retry
                callback(null, { entry, dirUUID, driveUUID, parts: p, type: 'file', stat, policy, retry: r, task })
              }))
              .catch(callback)
          } else {
            const options = {
              env: { absPath: entry, size: stat.size, partSize: 1024 * 1024 * 1024 },
              encoding: 'utf8',
              cwd: process.cwd()
            }

            const child = childProcess.fork(path.join(__dirname, './filehash'), [], options)
            child.on('message', (result) => {
              setXattr(entry, result, (err, xattr) => {
                debug('hash finished', ((new Date()).getTime() - hashStart) / 1000)
                const p = xattr && xattr.parts
                const r = retry ? retry + 1 : retry
                callback(null, { entry, dirUUID, driveUUID, parts: p, type: 'file', stat, policy, retry: r, task })
              })
            })
            child.on('error', callback)
          }
        })
      }
    })

    this.diff = new Transform({
      name: 'diff',
      concurrency: 4,
      push(x) {
        if (x.type === 'directory' || !(x.policy.mode === 'merge' || x.policy.mode === 'overwrite') && x.task.isNew && !x.retry) {
          this.outs.forEach(t => t.push([x]))
        } else {
          /* combine to one post */
          const { dirUUID, policy } = x
          const i = this.pending.findIndex(p => p[0].dirUUID === dirUUID && policy.mode === p[0].policy.mode)
          if (i > -1) {
            this.pending[i].push(x)
          } else {
            // debug('this.diff new array', x.entry, x.dirUUID, this.pending.length)
            this.pending.push([x])
          }
          this.schedule()
        }
      },

      transform: (X, callback) => {
        const diffAsync = async (local, driveUUID, dirUUID, task) => {
          const listNav = await serverGetAsync(`drives/${driveUUID}/dirs/${dirUUID}`)
          const remote = isCloud() ? listNav.data.entries : listNav.entries
          // debug('listNav diff', local.length)
          if (!remote.length) return local
          const map = new Map() // compare hash and name
          const nameMap = new Map() // only same name
          const nameSpace = [] // used to check name
          local.forEach((l) => {
            const name = l.policy.mode === 'rename' ? l.policy.checkedName : path.parse(l.entry).base
            const key = name.concat(l.parts[l.parts.length - 1].fingerprint) // local file's key: name + fingerprint
            map.set(key, l)
            nameMap.set(name, key)
            nameSpace.push(name)
          })
          // debug('diffAsync map', map, remote)
          remote.forEach((r) => {
            const rKey = r.name.concat(r.hash) // remote file's key: name + hash
            if (map.has(rKey)) {
              task.finishCount += 1
              // debug('this.diff transform find already finished', task.finishCount, r.name)
              task.completeSize += map.get(rKey).stat.size
              map.delete(rKey)
            }
            if (nameMap.has(r.name)) nameMap.delete(r.name)
            else nameSpace.push(r.name)
          })
          const result = [...map.values()] // local files that need to upload

          /* get files with same name but different hash */
          const nameValue = [...nameMap.values()]
          nameValue.forEach(key => map.delete(key))
          const mapValue = [...map.values()]
          // debug('this.diff transform', X.length, X[0].entry, mapValue)
          if (mapValue.length) {
            let mode = mapValue[0].policy.mode
            if (mode === 'merge') mode = 'rename'
            if (mode === 'overwrite') mode = 'replace'
            mapValue.forEach((l) => {
              const name = path.parse(l.entry).base // TODO mode rename but still same name ?
              const checkedName = getName(name, nameSpace)
              const remoteFile = remote.find(r => r.name === name)
              const remoteUUID = remoteFile.uuid
              const remoteHash = remoteFile.hash

              let seed = 0
              if (l.parts.length > 0) {
                const index = l.parts.findIndex(p => p.target === remoteHash)
                if (index > 0) {
                  seed = index
                  task.completeSize += index * 1024 * 1024 * 1024
                }
              }

              /* continue to upload big file */
              debug('get files with same name but different hash\n', l.entry, mode, checkedName, remoteUUID, seed, l.parts)

              l.policy = Object.assign({}, { mode, checkedName, remoteUUID, seed }) // important: assign a new object !
            })
          }
          /* task all finished */
          if (!task.paused && !result.length && task.finishCount === task.count &&
            this.readDir.isSelfStopped() && this.hash.isSelfStopped()) {
            task.finishDate = (new Date()).getTime()
            task.state = 'finished'
            clearInterval(task.countSpeed)
            task.updateStore()
            sendMsg()
          }
          return result
        }

        const { driveUUID, dirUUID, task } = X[0]
        if (task.state !== 'uploading') task.state = 'diffing'

        diffAsync(X, driveUUID, dirUUID, task).then(value => callback(null, value)).catch((e) => {
          debug('diffAsync error', e)
          callback(e)
        })
      }
    })

    this.upload = new Transform({
      name: 'upload',
      concurrency: 2,
      isBlocked: () => this.paused,
      push(X) {
        // debug('this.upload push', X.length)
        X.forEach((x) => {
          if (x.type === 'directory') {
            x.task.finishCount += 1
            this.root().emit('data', x)
          } else {
            /* combine to one post */
            const { dirUUID, policy } = x
            /* upload N file within one post */
            const i = this.pending.findIndex(p => !isCloud() && p.length < 256
              && p[0].dirUUID === dirUUID && policy.mode === p[0].policy.mode)
            if (i > -1) {
              this.pending[i].push(x)
            } else {
              this.pending.push([x])
            }
          }
        })
        // debug('this.upload forEach', X.length)
        this.schedule()
      },
      transform: (X, callback) => {
        // debug('upload transform start', X.length)

        let uploadedSum = 0
        let countSum = 0
        const Files = X.map((x) => {
          const { entry, stat, parts, policy, retry, task } = x
          const name = policy.mode === 'rename' ? policy.checkedName : path.parse(entry).base
          const readStreams = parts.map(p => fs.createReadStream(entry, { start: p.start, end: Math.max(p.end, 0), autoClose: true }))
          for (let i = 0; i < parts.length; i++) {
            const rs = readStreams[i]
            let lastTimeSize = 0
            let countReadHandle = null
            const countRead = () => {
              sendMsg()
              if (task.paused) return clearInterval(countReadHandle)
              const gap = rs.bytesRead - lastTimeSize
              task.completeSize += gap
              uploadedSum += gap
              lastTimeSize = rs.bytesRead
            }
            rs.on('open', () => {
              countReadHandle = setInterval(countRead, 200)
            })
            rs.on('end', () => {
              clearInterval(countReadHandle)
              const gap = rs.bytesRead - lastTimeSize
              task.completeSize += gap
              uploadedSum += gap
              lastTimeSize = rs.bytesRead
              if (task.paused) return
              if (i === parts.length - 1) {
                task.finishCount += 1
                countSum += 1
              }
              sendMsg()
            })
          }
          return ({ entry, stat, name, parts, readStreams, retry, policy })
        })

        const { driveUUID, dirUUID, task } = X[0]
        task.state = 'uploading'
        const handle = new UploadMultipleFiles(driveUUID, dirUUID, Files, (error) => {
          task.reqHandles.splice(task.reqHandles.indexOf(handle), 1)
          if (error) {
            debug('UploadMultipleFiles handle callbak error', error)
            task.finishCount -= countSum
            task.completeSize -= uploadedSum
            X.forEach((x) => {
              if (x.retry > -1) x.retry += 1
              else x.retry = 0
            })
          }
          callback(error, { driveUUID, dirUUID, Files, task })
        })
        task.reqHandles.push(handle)
        handle.upload()
      }
    })

    this.readDir.pipe(this.mkdir).pipe(this.hash).pipe(this.diff).pipe(this.upload)

    this.readDir.on('data', (x) => {
      const { dirUUID, task } = x
      getMainWindow().webContents.send('driveListUpdate', { uuid: dirUUID })
      // debug('this.readDir.on data', task.finishCount, task.count, this.readDir.isStopped())
      if (!task.paused && task.finishCount === task.count && this.readDir.isStopped()
        && !task.errors.length && !task.warnings.length) {
        task.finishDate = (new Date()).getTime()
        task.state = 'finished'
        clearInterval(task.countSpeed)
      }
      task.updateStore()
      sendMsg()
    })

    this.readDir.on('step', () => {
      if (this.trueSize > this.size || this.trueCount > this.count || (this.mkdir.isSelfStopped() && !this.mkdir.failed.length)) {
        this.size = this.trueSize
        this.count = this.trueCount
      }

      /* retry, if upload error && response code ∈ [400, 500) && retry times < 2 */
      for (let i = this.upload.failed.length - 1; i > -1; i--) {
        const X = this.upload.failed[i]
        const index = Array.isArray(X) && X.findIndex((x) => {
          return x.retry < 1 && (x.error && x.error.response &&
            x.error.response.findIndex(r => r.error && r.error.status < 500 && r.error.code !== 'EEXIST') > -1)
        })
        if (index > -1) {
          debug('X retry', X[0].retry, X[0].error)
          const files = []
          X.forEach(x => files.push({ entry: x.entry, stat: x.stat, policy: x.policy, retry: x.retry }))
          const { driveUUID, dirUUID, task } = X[0]
          this.hash.push({ files, driveUUID, dirUUID, task })
          this.upload.failed.splice(i, 1)
        }
      }

      const preLength = this.errors.length
      this.errors.length = 0
      const pipes = ['readDir', 'mkdir', 'hash', 'diff', 'upload']
      pipes.forEach((p) => {
        if (!this[p].failed.length) return
        this[p].failed.forEach((x) => {
          if (Array.isArray(x)) x.forEach(c => this.errors.push(Object.assign({ pipe: p }, c, { task: c.task.uuid })))
          else this.errors.push(Object.assign({ pipe: p }, x, { task: x.task.uuid }))
        })
      })
      if (this.errors.length !== preLength) this.updateStore()
      if (this.errors.length > 8 || (this.readDir.isStopped() && (this.errors.length || this.warnings.length))) {
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
    this.readDir.push({ entries: this.entries, dirUUID: this.dirUUID, driveUUID: this.driveUUID, policies: this.policies, task: this })
  }

  status() {
    return Object.assign({}, this.props, {
      completeSize: this.completeSize,
      lastTimeSize: this.lastTimeSize,
      count: this.count,
      finishCount: this.finishCount,
      finishDate: this.finishDate,
      name: this.name,
      paused: this.paused,
      restTime: this.restTime,
      size: this.size,
      speed: this.speed,
      lastSpeed: this.lastSpeed,
      state: this.state,
      warnings: this.warnings,
      errors: this.errors,
      trsType: this.trsType
    })
  }

  createStore() {
    this.countStore = 0
    if (!this.isNew) return
    global.DB.save(this.uuid, this.status(), err => err && console.log(this.name, 'createStore error: ', err))
  }

  updateStore() {
    if (!this.WIP && !this.storeUpdated) {
      this.WIP = true
      global.DB.save(this.uuid, this.status(), err => err && console.log(this.name, 'updateStore error: ', err))
      this.storeUpdated = true
      this.countStore += 1
      setTimeout(() => this && !(this.WIP = false) && this.updateStore(), 100)
    } else this.storeUpdated = false
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
    this.readDir.clear()
    this.initStatus()
    this.isNew = false
    this.run()
    sendMsg()
  }

  finish() {
    this.paused = true
    this.readDir.clear()
    this.reqHandles.forEach(h => h.abort())
    this.finishDate = (new Date()).getTime()
    this.state = 'finished'
    clearInterval(this.countSpeed)
    this.updateStore()
    sendMsg()
  }
}

const createTask = (uuid, entries, dirUUID, driveUUID, taskType, createTime, isNew, policies, preStatus) => {
  const task = new Task({ uuid, entries, dirUUID, driveUUID, taskType, createTime, isNew, policies })
  Tasks.push(task)
  task.createStore()
  // debug('createTask', preStatus)
  if (preStatus) Object.assign(task, preStatus, { isNew: false, paused: true, speed: 0, restTime: 0 })
  else task.run()
  sendMsg()
}


export { createTask }
