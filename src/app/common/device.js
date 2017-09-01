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
      mkFileSystem: this.mkFileSystem.bind(this),
      reInstall: this.reInstall.bind(this),
      refreshSystemState: this.refreshSystemState.bind(this),
      manualBoot: this.manualBoot.bind(this),
      addFirstUser: this.addFirstUser.bind(this)
    }
  }

  request(name, args, next) {
    let r

    switch (name) {
      case 'device':
        r = request
        .get(`http://${this.mdev.address}:3000/control/system`)
        break

      case 'boot':
        r = request
        .get(`http://${this.mdev.address}:3000/boot`)
        break

      case 'storage':
        r = request
        .get(`http://${this.mdev.address}:3000/storage`)
        break

      case 'power':
        r = request
        .patch(`http://${this.mdev.address}:3000/boot`)
        .timeout(30000)
        .send(args)
        .set('Accept', 'application/json')
        break

      case 'timedate':
        r = request
        .get(`http://${this.mdev.address}:3000/control/timedate`)
        break

      case 'net':
        r = request
        .get(`http://${this.mdev.address}:3000/control/net/interfaces`)
        break

      case 'fan':
        r = request
        .get(`http://${this.mdev.address}:3000/control/fan`)
        break

      case 'setFanScale':
        r = request
        .post(`http://${this.mdev.address}:3000/control/fan`)
        .timeout(30000)
        .send(args)
        .set('Accept', 'application/json')
        break

      case 'ipaliasing':
        r = request
        .get(`http://${this.mdev.address}:3000/control/net/ipaliasing`)
        break

      case 'setIpaliasing':
        r = request
        .post(`http://${this.mdev.address}:3000/control/net/ipaliasing`)
        .timeout(30000)
        .send(args)
        .set('Accept', 'application/json')
        break

      case 'users':
        r = request
        .get(`http://${this.mdev.address}:3000/users`)
        break

      case 'mkfs':
        r = request
        .post(`http://${this.mdev.address}:3000/storage/volumes`)
        .timeout(30000)
        .send(args)
        .set('Accept', 'application/json')
        break

      case 'install':
        r = request
        .patch(`http://${this.mdev.address}:3000/boot`)
        .timeout(30000)
        .send(args)
        .set('Accept', 'application/json')
        break

      case 'forceBoot':
        r = request
        .patch(`http://${this.mdev.address}:3000/boot`)
        .timeout(30000)
        .send(args)
        .set('Accept', 'application/json')
        break

      case 'firstUser':
        r = request
        .post(`http://${this.mdev.address}:3000/users`)
        .send(args)
        .set('Accept', 'application/json')
        break

      case 'run':
        r = request
        .post(`http://${this.mdev.address}:3000/system/run`)
        .timeout(30000)
        .send(args)
        .set('Accept', 'application/json')
        break

      case 'token':
        r = request
        .get(`http://${this.mdev.address}:3000/token`)
        .auth(args.uuid, args.password)
        .set('Accept', 'application/json')
        break

      case 'wxToken':
        r = request
          .get('http://10.10.9.59:5757/v1/token')
          .query({ code: args.code })
          .query({ platform: 'web' })
        break

      case 'wxLogin':
        r = request
          .get('http://10.10.9.59:5757/v1/test/oauth2')
          .query({ code: args.code })
          .query({ platform: args.platform })
        break

      /** FirmwareUpdate API **/
      case 'firm':
        r = request
          .get('http://10.10.9.124:3001/state')
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
    const done = next ? () => (!--count) && next() : undefined
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
    const { target, mode, username, password } = args

    const uuid = await this.requestAsync('mkfs', { target, mode })
    console.log('device initWizard:  mkfs returns uuid', uuid)

    // await this.requestAsync('storage', null) // FIXME can't finish ???
    console.log('device initWizard: storage refreshed')

    await this.requestAsync('install', { current: uuid.uuid })
    console.log('device initWizard: install fruitmix success')

    while (true) {
      await Promise.delay(1000)
      await this.requestAsync('boot', null)

      const current = this.boot.value().current
      const state = this.boot.value().state

      if (current) {
        if (state === 'started') {
          // this may be due to worker not started yet
          await Promise.delay(2000)

          console.log('device initWizard: fruitmix started')
          break
        }
        if (state === 'stopping') {
          return console.log('device initWizard: fruitmix stopping (unexpected), stop')
        }
        console.log('device initWizard: fruitmix starting, waiting...')
      } else { console.log('device initWizard: fruitmix is null, legal ???') } // NO!!!
    }

    await this.requestAsync('firstUser', { username, password })

    const user = this.firstUser.value()
    console.log('device initWizard: first user created')

    await this.requestAsync('users', null)
    console.log('device initWizard: users refreshed')

    await this.requestAsync('token', { uuid: user.uuid, password })
    console.log('device initWizard: token retrieved')
  }

  async addFirstUserAsync(args) {
    const { username, password } = args

    await this.requestAsync('firstUser', { username, password })

    const user = this.firstUser.value()
    console.log('device initWizard: first user created')

    await this.requestAsync('users', null)
    console.log('device initWizard: users refreshed')

    await this.requestAsync('token', { uuid: user.uuid, password })
    console.log('device initWizard: token retrieved')
  }

  async mkfsAsync(args) {
    const { target, mode } = args
    const uuid = await this.requestAsync('mkfs', { target, mode })
    await this.requestAsync('storage', null)
  }

  async reInstallAsync(args) {
    const { target, username, password, remove } = args
    const install = true
    let reinstall = false
    if (remove === 'wisnuc') reinstall = true // FIXME
    await this.requestAsync('install', { current: target })
    // await this.requestAsync('install', { target, username, password, install, reinstall })
    while (true) {
      await Promise.delay(1000)
      await this.requestAsync('boot', null)
      const fruitmix = this.boot.value().fruitmix
      if (fruitmix) {
        if (fruitmix.state === 'started') {
          await Promise.delay(2000)
          break
        }
        if (fruitmix.state === 'exited') {
          return console.log('device initWizard: fruitmix exited (unexpected), stop')
        }
      } else console.log('device reInstall: fruitmix is null, legal ???') // NO!!!
    }
    await this.requestAsync('firstUser', { username, password })
    const user = this.firstUser.value()
    await this.requestAsync('users', null)
  }

  async manualBootAsync(args) {
    const { target } = args
    await this.requestAsync('run', { target })
  }

  initWizard(args) {
    this.initWizardAsync(args).asCallback(() => {})
  }

  addFirstUser(args) {
    this.addFirstUserAsync(args).asCallback(() => {})
  }

  mkFileSystem(args) {
    this.mkfsAsync(args).asCallback(() => {})
  }

  reInstall(args) {
    this.reInstallAsync(args).asCallback(() => {})
  }

  manualBoot(args) {
    this.manualBootAsync(args).asCallback(() => {})
  }

  /**
   probing -> wait
   starting -> wait
   systemError -> error
   fruitmixError -> maint
   noUser -> create first user
   ready -> show user list
   userMaint -> maint
   failLast -> maint
   uninitialized -> init
   failNoAlt -> maint
  **/
  systemStatus() {
    if (!this.device || !this.boot || !this.storage ||
      !this.users || this.device.isPending() || this.boot.isPending()
      || this.storage.isPending() || this.users.isPending()) {
      return 'probing'
    } else if (this.boot.isRejected() || this.storage.isRejected()) {
      return 'systemError'
    }

    const boot = this.boot.value()
    const storage = this.storage.value()
    if (!boot || !storage) return 'systemError'

    /* normal mode */
    if (!boot.error && boot.state === 'started' && boot.current) {
      if (this.users.isRejected()) {
        return 'fruitmixError'
      } else if (this.users.value() && !this.users.value().length) {
        return 'noUser'
      }
      return 'ready'
    } else if (!boot.error && boot.state === 'starting') {
      this.requestAsync('boot', null)
    }

    /* maintenance mode */
    if (boot.mode === 'maintenance') {
      return 'userMaint'
    } else if (boot.error === 'ELASTNOTMOUNT' || boot.error === 'ELASTMISSING' || boot.error === 'ELASTDAMAGED') {
      return 'failLast'
    } else if (boot.error === 'ENOALT') {
      const { volumes } = storage
      if (volumes && volumes.length === 0) return 'uninitialized'
      return 'failNoAlt'
    }

    return 'unknownMaint'
  }
}

export default Device
