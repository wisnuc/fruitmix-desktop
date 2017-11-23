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
  constructor(dir) {
    this.dir = path.resolve(dir)
  }

  initialize(cb) {
    mkdirp(this.dir, cb)
  }

  save(id, data, cb) {
    const tmp = path.join(this.dir, `${uuid.v4()}~`)
    const target = path.join(this.dir, id)
    fs.writeFile(tmp, JSON.stringify(data), (err) => {
      if (err) cb(err)
      else fs.rename(tmp, target, cb)
    })
  }

  load(id, cb) {
    fs.readFile(path.join(this.dir, id), (err, data) => {
      let parsedData
      try {
        parsedData = JSON.parse(data)
      } catch (e) {
        return cb(e)
      }
      cb(err, parsedData)
    })
  }

  loadAll(cb) {
    fs.readdir(this.dir, (err, dir) => {
      if (err) return cb(err)
      const list = []
      if (!dir.length) return cb(null, list)
      let count = dir.length
      dir.forEach(id => this.load(id, (error, data) => {
        if (error || id.length !== 36) this.remove(id, e => console.log('remove error data', id, 'error', e))
        else list.push(data)
        count -= 1
        if (count === 0) cb(null, list)
      }))
    })
  }

  remove(id, cb) {
    rimraf(path.join(this.dir, id), cb)
  }

  clear(cb) {
    rimraf(this.dir, cb)
  }
}

module.exports = db
