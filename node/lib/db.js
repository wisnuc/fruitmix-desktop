const fs = require('fs')
const path = require('path')
const uuid = require('uuid')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')

/**
a custom db to store transmisson data
@param {path} path to store the db
*/

class db {
  constructor (dir) {
    this.dir = path.resolve(dir)
    this.store = {}
    this.WIP = {}
    this.next = {}

    this.write = (id) => {
      this.WIP[id] = true
      this.next[id] = false
      const { data, cb } = this.store[id]
      const tmp = path.join(this.dir, `${uuid.v4()}~`)
      const target = path.join(this.dir, id)
      fs.writeFile(tmp, JSON.stringify(data), (err) => {
        if (err) cb(err)
        else {
          fs.rename(tmp, target, (error) => {
            this.WIP[id] = false
            cb(error)
            if (this.next[id]) this.write(id)
          })
        }
      })
    }
  }

  initialize (cb) {
    mkdirp(this.dir, cb)
  }

  save (id, data, cb) {
    this.store[id] = { data, cb }
    if (!this.WIP[id]) this.write(id)
    else this.next[id] = true
  }

  load (id, cb) {
    fs.readFile(path.join(this.dir, id), (err, data) => {
      let parsedData
      try {
        parsedData = JSON.parse(data)
      } catch (e) {
        cb(e)
        return
      }
      cb(err, parsedData)
    })
  }

  loadAll (cb) {
    fs.readdir(this.dir, (err, dir) => {
      if (err) cb(err)
      else {
        const list = []
        if (!dir.length) cb(null, list)
        else {
          let count = dir.length
          const newDir = dir.filter((id) => {
            if (id.length === 36) return true
            this.remove(id, e => console.log('remove error data', id, 'error', e))
            return false
          })

          newDir.forEach(id => this.load(id, (error, data) => {
            if (error) this.remove(id, e => console.log('remove error data', id, 'error', e))
            else list.push(data)
            count -= 1
            if (count === 0) cb(null, list)
          }))
        }
      }
    })
  }

  remove (id, cb) {
    rimraf(path.join(this.dir, id), cb)
  }

  clear (cb) {
    rimraf(this.dir, cb)
  }
}

module.exports = db
