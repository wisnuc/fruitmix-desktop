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
    fs.readFile(path.join(this.dir, id), (err, data) => cb(err, JSON.parse(data)))
  }

  loadAll(cb) {
    fs.readdir(this.dir, (err, dir) => {
      if (err) return cb(err)
      const list = []
      if (!dir.length) return cb(null, list)
      let count = dir.length
      dir.forEach(id => this.load(id, (error, data) => {
        if (error) return console.log('load db data error: ', error)
        list.push(data)
        count -= 1
        if (count === 0) cb(null, list)
      }))
    })
  }

  remove(id, cb) {
    fs.unlink(path.join(this.dir, id), cb)
  }

  clear(cb) {
    rimraf(this.dir, cb)
  }
}

module.exports = db
