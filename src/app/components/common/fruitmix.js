const request = require('superagent')
const EventEmitter = require('eventemitter3')

import Request from './Request'

// this module encapsulate most fruitmix apis
class Fruitmix extends EventEmitter {

  constructor(address, userUUID, token) {

    super()  

    this.address = address
    this.userUUID = userUUID
    this.token = token

    this.state = {
      userUUID,
      request: this.request.bind(this),
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

      console.log(`${name} updated`, prev, curr, this[name].isFinished(), typeof next === 'function')

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

  aget(ep) {
    return request
      .get(`http://${this.address}:3721/${ep}`)
      .set('Authorization', 'JWT ' + this.token)
  }

  apost(ep, data) {

    let r = request
      .post(`http://${this.address}:3721/${ep}`)
      .set('Authorization', 'JWT ' + this.token)

    return typeof data === 'object'
      ? r.send(data)
      : r
  }

  apatch(ep, data) {

    let r = request
      .patch(`http://${this.address}:3721/${ep}`)
      .set('Authorization', 'JWT ' + this.token)

    return typeof data === 'object'
      ? r.send(data)
      : r
  }

  adel(ep) {
    return request
      .del(`http://${this.address}:3721/${ep}`)
      .set('Authorization', 'JWT ' + this.token)
  }

  request(name, args, next) {

    let r

    switch(name) {
    case 'login':
      r = request.get(`http://${this.address}:3721/login`)
      break

    case 'account':
      r = this.aget('account')
      break

    case 'updateAccount':
      r = this.apost('account', args)
      break

    case 'users':
      r = this.aget('users')
      break

    case 'drives':
      r = this.aget('drives')
      break

    case 'adminUsers':
      r = this.aget('admin/users')
      break

    case 'adminCreateUser':
      r = this.apost('admin/users', {
        type: 'local',
        username: args.username,
        password: args.password
      })
      break

    case 'adminDrives':
      r = this.aget('admin/drives')
      break

    case 'adminCreateDrive':
      r = this.apost('admin/drives', {
        label: args.label,
        writelist: args.writelist,
        readlist: [],
        shareAllowed: true
      })
      break

    /** File APIs **/
    case 'listDir':
      r = this.aget(`files/fruitmix/list/${args.dirUUID}`)
      break

    case 'listNavDir':
      r = this.aget(`files/fruitmix/list-nav/${args.dirUUID}/${args.rootUUID}`)
      break

    case 'downloadFile':
      r = this.aget(`files/fruitmix/download/${args.dirUUID}/${args.fileUUID}`)
      break

    case 'mkdir':
      r = this.apost(`files/fruitmix/mkdir/${args.dirUUID}`, { dirname: args.dirname})
      break

    case 'uploadFile':
      r = null // TODO
      break

    case 'overwriteFile':
      r = null // TODO
      break

    case 'renameDirOrFile':
      r = this.apost(`files/fruitmix/rename/${args.dirUUID}/${args.nodeUUID}/${args.filename}`)
      break

    case 'deleteDirOrFile':
      r = this.adel(`files/fruitmix/${args.dirUUID}/${args.nodeUUID}`)
      break

    /** Ext APIs **/
    case 'extDrives':
      r = this.aget(`files/external/fs`)
      break

    case 'extListDir':
      break

    case 'extMkdir':
      break
    
    case 'extRenameDirOrFile':
      break

    case 'extDeleteDirOrFile':
      break

    /** File Transfer API **/
    // ????

    /** File Share API **/
    case 'fileShare':
      r = this.aget(`fileshare`)
      break

    /** Media Share API **/
    case 'mediaShare':
      r = this.aget(`mediashare`)
      break

    /** Media API **/
    case 'media':
      r = this.aget(`media`)
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

    this.requestAsync('account', null).asCallback((err, account) => {
      if (account) {
        this.request('listNavDir', { dirUUID: account.home, rootUUID: account.home })
        if (account.isAdmin) {
          this.request('adminUsers')
          this.request('adminDrives')
        }
      }
    })

    this.request('users')
    this.request('drives')
    this.request('fileShare')
    this.request('mediaShare')
    this.request('media')
  }
}

export default Fruitmix

