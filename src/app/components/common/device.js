const request = require('superagent')

import RequestManager from './reqman'

/**

  it should not emit anything in constructor, for there is no chance to 
  add listeners.

  start is necessary for adding listeners before calling start and after 
  constructor.

  emission may happen DURING calling start. So functions and observers must
  NOT think some reqs is always there. It may be null.

**/
class Device extends RequestManager {

  // constructor won't emit anything since there is no listeners yet
  // the common way to solve this problem is to use a separate method 
  // to trigger actions
  constructor(mdev) {

    super()

    this.mdev = mdev
    this.backoff = 30

    // reqs
    this.device = null
    this.boot = null
    this.storage = null
    this.users = null
    this.mkfs = null
    this.install = null
    this.firstUser = null
    this.token = null
   
    // immutable 
    this.state = {

      // static data
      mdev: this.mdev,

      // methods
      request: this.request.bind(this),
      clearRequest: this.clearRequest.bind(this),
      initWizard: this.initWizard.bind(this),
      systemStatus: this.systemStatus.bind(this),
    }
  }

  request(name, args, next) {

    let r

    switch(name) {
    case 'device':
      r = request
        .get(`http://${this.mdev.address}:3000/system/device`)
      break

    case 'boot':
      r = request
        .get(`http://${this.mdev.address}:3000/system/boot`)
      break

    case 'storage':
      r = request
        .get(`http://${this.mdev.address}:3000/system/storage?wisnuc=true`)
      break

    case 'users':
      r = request
        .get(`http://${this.mdev.address}:3721/login`)
      break

    case 'mkfs':
      r = request
        .post(`http://${this.mdev.address}:3000/system/mkfs`)
        .timeout(30000)
        .send(args)
        .set('Accept', 'application/json')
      break

    case 'install':
      r = request
        .post(`http://${this.mdev.address}:3000/system/install`)
        .timeout(30000)
        .send(args)
        .set('Accept', 'application/json')
      break

    case 'firstUser':
      r = request
        .post(`http://${this.mdev.address}:3721/init`)
        .send(args)
        .set('Accept', 'application/json')
      break

    case 'run':
      r = request
        .post(`http://${this.mdev.address}:3000/system/mir/run`)
        .timeout(30000)
        .send(args)
        .set('Accept', 'application/json')
      break

    case 'token':
      r = request
        .get(`http://${this.mdev.address}:3721/token`)
        .auth(args.uuid, args.password)
        .set('Accept', 'application/json')
      break 

    default:
      break
    }

    if (!r) return console.log(`no request handler found for ${name}`)

    this.setRequest(name, args, cb => r.end(cb), next) 
  }

  async requestAsync(name, args) {
    return Promise.promisify(this.request).bind(this)(name, args)
  }

  start() {
    this.refreshSystemState(() => console.log('init refresh done'))
  }

  refreshSystemState(next) {

    let count = 4
    let done = next 
      ? () => (!--count) && next()
      : undefined

    this.request('device', null, done)
    this.request('boot', null, done)
    this.request('storage', null, done)
    this.request('users', null, done)
  }

  async refreshSystemStateAsync() {
    return Promise.promisify(this.refreshSystemState).bind(this)()
  }

  // *  1. mkfs
  //    2. mkfs failed
  // *  3. update storage
  //    4. update storage failed
  // *  5. install
  //    6. install failed
  // *  7. refreshing boot or boot.fruitmix.state === 'starting'
  //    8. refreshing boot failed or boot.fruitmix.state === 'exited'
  // *  9. refreshing users 
  //    10. refreshing users failed
  // *  11. creating first user
  //    12. creating first user failed
  // *  13. retrieving token
  //    14. retrieving token failed
  async initWizardAsync(args) {

    let { type, target, mode, username, password } = args

    let uuid = await this.requestAsync('mkfs', { type, target, mode }) 
    console.log('device initWizard:  mkfs returns uuid', uuid)

    await this.requestAsync('storage', null)
    console.log('device initWizard: storage refreshed')

    await this.requestAsync('install', { target: uuid, username, password, install: true })
    console.log('device initWizard: install fruitmix success')

    while (true) {

      await Promise.delay(1000)
      await this.requestAsync('boot', null)

      let fruitmix = this.boot.value().fruitmix
      if (fruitmix) {
        if (fruitmix.state === 'started') {

          // this may be due to worker not started yet
          await Promise.delay(2000)

          console.log('device initWizard: fruitmix started')
          break
        }
        if (fruitmix.state === 'exited') {
          return console.log('device initWizard: fruitmix exited (unexpected), stop')
        }
        console.log('device initWizard: fruitmix starting, waiting...')
      }
      else 
        console.log('device initWizard: fruitmix is null, legal ???') // NO!!!
    }

    await this.requestAsync('firstUser', { username, password })

    let user = this.firstUser.value()
    console.log('device initWizard: first user created')

    await this.requestAsync('users', null) 
    console.log('device initWizard: users refreshed')

    await this.requestAsync('token', { uuid: user.uuid, password })
    console.log('device initWizard: token retrieved')
  }

  initWizard(args) {
    this.initWizardAsync(args).asCallback(() => {})
  } 

  // probing -> message + progress
  // systemError -> message
  // fruitmixError -> message + maint, userMaint, failLast, failMulti, failNoAlt, unknownMaintenance
  // [...] -> userbox
  // [] -> firstUser
  // uninitialized -> guide

  // idle
  // probing, systemError, fruitmixError, 
  // userMaint, failLast, faltMulti, failNoAlt, unknownMaint, unintialized (a special case for failNoAlt)
  // [] (users)
  systemStatus() {

    if (!this.device || !this.boot || !this.storage || !this.users 
        || this.device.isPending() || this.boot.isPending() 
        || this.storage.isPending() || this.users.isPending())
      return 'probing'
    else if (this.boot.isRejected() || this.storage.isRejected())
      return 'systemError'
    else {

      let bootState = this.boot.value().state

      if (bootState === 'normal') { // fruitmix booted
        if (this.users.isRejected())
          return 'fruitmixError'
        else
          return 'ready'
      }
      else { // maintenance mode

        let boot = this.boot.value()

        if (boot.bootMode === 'maintenance')
          return 'userMaint'
        else if (boot.error === 'EFAIL')
          return 'failLast'
        else if (boot.error === 'EMULTI')
          return 'failMulti'
        else if (boot.error === 'ENOALT') {
          
          let { blocks, volumes } = this.storage.value()

          // TODO new boot not compatible with old one
/**
          if (volumes.length === 0) { // no existing btrfs volume

            // all mounted file systems has no wisnuc
            let noFruitmix = 
              blocks
                .filter(blk => blk.isFileSystem && blk.isMounted)
                .every(blk => typeof blk.wisnuc === 'object' && blk.wisnuc !== null && blk.wisnuc.status === 'ENOENT')

            if (noFruitmix && this.boot.lastFileSystem === null)
              return 'uninitialized'
          } 
**/

          if (volumes.length === 0 && boot.lastFileSystem === null)
            return 'uninitialized'

          return 'failNoAlt'
        }
        else {
          return 'unknownMaint'
        }
      }
    }
  }

}

export default Device

