const request = require('superagent')
const EventEmitter =require('eventemitter3')

/*******************************************************************************

requesting
requested
  booted (boot state normal or alternative)
    fruimix users
    fruimix no user
    fruitmix server error
  maintenance
    shouldUseWizard (see below)
    hasDiskError (see below)
    hasOtherError (see below)

*******************************************************************************/

class ReqState {

  constructor(ctx) { this.ctx = ctx }

  // fallback
  exit() {}

  setState(nextState, ...args) {
    this.exit()
    this.ctx.state = new nextState(this.ctx, ...args)
    this.ctx.emit('updated', this, this.ctx.state)
  }

  // force transition to pending
  request() { this.setState(ReqPending) } 

  // force transition to idle
  abort() { this.setState(ReqIdle) }

  isIdle() { return false } 
  isPending() { return false }
  isFulfilled() { return false }
  isRejected() { return false }
  isFinished() { return this.isFulfilled() || this.isRejected() }
}

class ReqIdle extends ReqState {
  constructor(ctx) { super(ctx) }
  isIdle() { return true }
}

class ReqPending extends ReqState {

  constructor(ctx, handle) {
    super(ctx)
    this.handle = this.ctx.boundF((err, res) => {
      if (this.handle) {
        this.handle = null
        if (err)
          this.setState(ReqRejected, err)
        else
          this.setState(ReqFulfilled, res.body)
      }
    })
  }

  exit() { 
    if (this.handle) {
      if (typeof this.handle.abort === 'function') 
        this.handle.abort()
      this.handle = null 
    }
  }

  request() { return }
  isPending() { return true }
}

class ReqFulfilled extends ReqState {

  constructor(ctx, data) { super(ctx); this.data = data }
  value() { return this.data }
  isFulfilled() { return true } 
}

class ReqRejected extends ReqState {

  constructor(ctx, err) { super(ctx); this.err = err }
  reason() { return this.err }
  isRejected() { return true }
}

class Request extends EventEmitter {

  constructor(opts, boundF) {

    super()
    if (typeof opts === 'function') {
      this.opts = null
      this.boundF = opts
    }
    else {
      this.opts = opts
      this.boundF = boundF
    }
    this.state = new ReqIdle(this)
  }

  request() { this.state.request() }
  abort() { this.state.abort() }
  isIdle() { return this.state.isIdle() }
  isPending() { return this.state.isPending() }
  isFulfilled() { return this.state.isFulfilled() }
  value() { return this.state.value() }
  isRejected() { return this.state.isRejected() }
  reason() { return this.state.reason() }
  isFinished() { return this.state.isFinished() }
}

class Device extends EventEmitter {

  constructor(mdev) {

    super()

    this.mdev = mdev

    this.boot = new Request(callback => request.get(`http://${mdev.address}:3000/system/boot`).end(callback))
    this.storage = new Request(callback => request.get(`http://${mdev.address}:3000/system/storage?wisnuc=true`).end(callback))
    this.users = new Request(callback => request.get(`http://${mdev.address}:3721/login`).end(callback))

    this.observe('boot')
    this.observe('storage')
    this.observe('users')

    // login has uuid in opts, and token as value
    this.login = undefined

    this.backoff = 30

    this.immutable = {
      mdev: this.mdev,
      boot: this.boot.state,
      storage: this.storage.state,
      users: this.users.state,
      login: undefined,

      status: this.status.bind(this)
    }

    this.boot.request()
    this.storage.request()
    this.users.request()
  }

  observe(name) {
    this[name].on('updated', (prev, curr) => {
      this.immutable = Object.assign(this.immutable, { [name]: curr }) 
      this.emit('updated', this.immutable)
    })
  }

  abort() {
    
    this.boot.abort()
    this.storage.abort()
    this.users.abort()
    this.login && this.login.abort()

    clearTimeout(this.refreshTimer)
  }

  // idle -> whitebox
  // probing -> message + progress
  // systemError -> message
  // fruitmixError -> message + maint, userMaint, failLast, failMulti, failNoAlt, unknownMaintenance
  // [...] -> userbox
  // [] -> firstUser
  // uninitialized -> guide

  // idle
  // probing, systemError, fruitmixError, 
  // userMaintenance, failLast, faltMulti, failNoAlt, unknownMaintenance, unintialized
  // [] (users)
  status() {

    if (this.boot.isIdle() && this.storage.isIdle() && this.users.isIdle())
      return 'idle'
    else if (this.boot.isPending() || this.storage.isPending() || this.users.isPending())
      return 'probing'
    else if (this.boot.isRejected() || this.storage.isRejected())
      return 'systemError'
    else {
      let bootState = this.boot.value().state
      if (bootState === 'normal' || bootState === 'alternative') { // fruitmix booted
        if (this.users.isRejected())
          return 'fruitmixError'
        else
          return this.users.value()
      }
      else { // maintenance mode
        if (this.boot.bootMode === 'maintenance')
          return 'userMaintenance'
        else if (this.boot.error === 'EFAIL')
          return 'failLast'
        else if (this.boot.error === 'EMULTI')
          return 'failMulti'
        else if (this.boot.error === 'ENOALT') {
          
          let { blocks, volumes } = this.storage.value()
          if (volumes.length === 0) { // no existing btrfs volume

            // all mounted file systems has no wisnuc
            let noFruitmix = 
              blocks
                .filter(blk => blk.isFileSystem && blk.isMounted)
                .every(blk => typeof blk.wisnuc === 'object' && blk.wisnuc !== null && blk.wisnuc.status === 'ENOENT')

            if (noFruitmix && this.boot.lastFileSystem === null)
              return 'uninitialized'
          } 
          return 'failNoAlt'
        }
        else {
          return 'unknownMaintence'
        }
      }
    }
  }

  // as a tool function, for the user
  // may have further actions
  tryLogin(uuid, password, callback) {

    let login = new Request({uuid}, cb =>
      request.get(`http://${this.address}:3721/token`).auth(uuid, password).end(cb))

    login.on('updated', () => 
      login.isFulfilled() 
        ? callback(null, login.value())
        : login.isRejected()
          ? callback(login.reason())
          : undefined)

    login.request()
    this.login = login
  }

  clearLogin() {

    if (this.login) this.login.clear()
    this.login = undefined
  }

  refresh() {

    this.boot.clear()
    this.storage.clear()
    this.users.clear()

    this.boot.request()
    this.storage.request()
    this.storage.request()
  }


  isProbing() {

    return this.boot.isPending()
      || this.storage.isPending()
      || this.users.isPending()
  }

  shouldUseWizard() {

    /** should we assert them all? TODO
      "state": "maintenance",
      "bootMode": "normal",
      "error": "ENOALT",
      "currentFileSystem": null,
      "lastFileSystem": null
    **/

    return typeof this.boot === 'object'
      && this.boot !== null
      && this.boot.state === 'maintenance'
      && this.boot.error === 'ENOALT'
      && this.boot.lastFileSystem === null
  } 

  immutable() {
    
  }
}

export default Device

