const path = require('path')
const fs = require('fs')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')

/**
a custom db to store transmisson data
@param {path} path to store the db
*/

class db {
  constructor(dir) {
    this.dir = path.resolve(dir)
    this.initialize(err => err && console.log('initialize db error', err))
  }

  initialize(cb) {
    mkdirp(this.dir, cb)
  }

  save(id, data, cb) {
    fs.writeFile(path.join(this.dir, id), JSON.stringify(data), cb)
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
        if (error) {
          this.remove(id, e => console.log('remove error data', id, 'error', e))
        } else {
          list.push(data)
          count -= 1
          if (count === 0) cb(null, list)
        }
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
