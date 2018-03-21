const fs = require('fs')
const path = require('path')
const UUID = require('uuid')
const Promise = require('bluebird')

const mkdirpAsync = Promise.promisify(require('mkdirp'))

// state: IDLE, PENDING, WIP
//
//                       NEWREQ                          TIMEOUT                   SUCCESS                              FAIL
// IDLE: nothing      -> PENDING with NEWREQ
// PENDING: req       -> re-TIMER and req with NEWREQ    -> WIP with req as req
// WIP: req & next    -> next = NEWREQ                                             next ? -> PENDING with next as req   next ? -> PENDING with next as req
//                                                                                      : -> IDLE                            : -> PENDING with req as req

class State {
  constructor (ctx) {
    this.ctx = ctx
  }

  setState (NextState, ...args) {
    this.exit()
    this.ctx.state = new NextState(this.ctx, ...args)
  }

  exit () {}
}

class Idle extends State {
  save (data) {
    this.setState(Pending, data)
  }
}

class Pending extends State {
  constructor (ctx, data) {
    super(ctx)
    this.save(data)
  }

  save (data) {
    clearTimeout(this.timer)
    this.data = data
    this.timer = setTimeout(() => {
      this.setState(Working, this.data)
    }, this.ctx.delay)
  }

  exit () {
    clearTimeout(this.timer)
  }
}

class Working extends State {
  constructor (ctx, data) {
    super(ctx)
    this.data = data

    const tmpfile = path.join(this.ctx.tmpdir, UUID.v4())
    fs.writeFile(tmpfile, JSON.stringify(this.data), (err) => {
      if (err) this.error(err)
      else {
        fs.rename(tmpfile, this.ctx.target, (e) => {
          if (e) this.error(e)
          else this.success()
        })
      }
    })
  }

  error (e) {
    console.log('error writing persistent file', e)

    if (this.next) { this.setState(Pending, this.next) } else { this.setState(Pending, this.data) }
  }

  success () {
    if (this.next) { this.setState(Pending, this.next) } else { this.setState(Idle) }
  }

  save (data) {
    // console.log('Working save', data)
    this.next = data
  }
}

class Persistence {
  constructor (target, tmpdir, delay) {
    this.target = target
    this.tmpdir = tmpdir
    this.delay = delay || 50
    this.state = new Idle(this)
  }

  save (data) {
    this.state.save(data)
  }
}

const createPersistenceAsync = async (target, tmpdir, delay) => {
  const targetDir = path.dirname(target)
  await mkdirpAsync(targetDir)
  await mkdirpAsync(tmpdir)
  return new Persistence(target, tmpdir, delay)
}

module.exports = createPersistenceAsync
