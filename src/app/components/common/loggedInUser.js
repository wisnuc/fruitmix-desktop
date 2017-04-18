const request = require('superagent')
const EventEmitter = require('eventemitter3')

import Request from './Request'

// logged-in user is constructed from 
// 1. device 
// 2. useruuid and token
class LoggedInUser extends EventEmitter {

  constructor(address, userUUID, token) {
    super()  

    this.address = address
    this.userUUID = userUUID
    this.token = token

    // requests
    this.login = null       // from login api
    this.users = null       // from users api

    this.homeNav = null         // for home nav

    this.publicDrives = null    // for public drives

    this.fshares = null         // for file shares
    this.mshares = null         // for media shares
    this.media = null           // for media

    this.state = {

      userUUID,
    
      request: this.request.bind(this),
    }

    this.renameBound = this.rename.bind(this)
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
    case 'login':
      r = request
        .get(`http://${this.address}:3721/login`)
      break

    case 'users':
      r = request
        .set('Authorization', 'JWT ' + this.token)
        .get(`http://${this.address}:3721/users`)
      break

    default:
      break
    }

    if (!r) return console.log(`no request handler found for ${name}`)

    this.setRequest(name, args, cb => r.end(cb), next) 
  }

  start() {
    this.request('login')
    this.request('users')
  }

  async rename() {
    this.request('rename')
    this.request('
  }
}

export default LoggedInUser
