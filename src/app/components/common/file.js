const request = require('superagent')
const EventEmitter = require('eventemitter3')

import Request from './Request'

class LoggedInUser extends EventEmitter {

  constructor(mdev) {
    super()  

    this.mdev = mdev
  
    this.home = null

    this.state = {
    
      request: this.request.bind(this)
    }
  }

  setState(name, nextState) {

    let state = this.state
    this.state = Object.assign({}, state, { [name]: nextState })
    this.emit('updated', state, this.state)
  }

  setRequest(name, props, f, next) {

    if (this[name]) {
      this[name].abort()
      this[name].removeAllListeners()
    }

    this[name] = new Request(props, f)
    this[name].on('updated', (prev, curr) => {

      this.setState(name, curr)

      console.log(`${name} updated`, prev, curr, 
        this[name].isFinished(), typeof next === 'function')

      if (this[name].isFinished() && next) {
        this[name].isRejected() 
          ? next(this[name].reason())  
          : next(null, this[name].value())
      }
    })

    // emit 
    this.setState(name, this[name].state)
  }

  clearRequest(name) {

    if (this[name]) {
      this[name].abort()
      this[name].removeAllListeners()
      this[name] = null
      this.setState(name, null)
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
}

