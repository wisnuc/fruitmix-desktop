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
      address,
      userUUID,
      token,
      request: this.request.bind(this)
    }
  }

  setState(name, nextState) {
    const state = this.state
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
      .get(`http://${this.address}:3000/${ep}`)
      .set('Authorization', `JWT ${this.token}`)
  }

  apost(ep, data) {
    const r = request
      .post(`http://${this.address}:3000/${ep}`)
      .set('Authorization', `JWT ${this.token}`)

    return typeof data === 'object'
      ? r.send(data)
      : r
  }

  apatch(ep, data) {
    const r = request
      .patch(`http://${this.address}:3000/${ep}`)
      .set('Authorization', `JWT ${this.token}`)

    return typeof data === 'object'
      ? r.send(data)
      : r
  }

  adel(ep) {
    return request
      .del(`http://${this.address}:3000/${ep}`)
      .set('Authorization', `JWT ${this.token}`)
  }

  request(name, args, next) {
    let r

    switch (name) {

      case 'getToken':
        r = request
          .get(`http://${this.address}:3000/token`)
          .auth(args.uuid, args.password)
          .set('Accept', 'application/json')
        break

      case 'account':
        r = this.aget(`users/${this.userUUID}`)
        break

      case 'updateAccount':
        console.log('updateAccount', args)
        r = this.apatch(`users/${args.uuid}`, args)
        break

      case 'users':
        r = request.get(`http://${this.address}:3000/users`)
        // r = this.aget('users')
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

      case 'driveListNavDir':
        r = this.aget(`files/fruitmix/list-nav/${args.dirUUID}/${args.rootUUID}`)
        break

      case 'adminCreateDrive':
        r = this.apost('drives', {
          label: args.label,
          writelist: args.writelist
        })
        break

      case 'adminUpdateDrive':
        r = this.apost(`drives/${args.uuid}`, args)
        break

    /** File APIs **/
      case 'listDir':
        r = this.aget(`drives/${args.driveUUID}`)
        break

      case 'listNavDir':
        r = this.aget(`drives/${args.driveUUID}/dirs/${args.dirUUID}`)
        break

      case 'mkdir':
        r = this.apost(`drives/${args.driveUUID}/dirs/${args.dirUUID}/entries`)
          .field(args.dirname, JSON.stringify({ op: 'mkdir' }))
        break

      case 'renameDirOrFile':
        // r = this.apatch(`drives/${args.driveUUID}/dirs/${args.dirUUID}/entries/${args.entryUUID}`, { name: args.newName })
        r = this.apost(`drives/${args.driveUUID}/dirs/${args.dirUUID}/entries`)
          .field(args.dirname, JSON.stringify({ op: 'rename', overwrite: args.entryUUID }))
        break

      case 'deleteDir':
        r = this.adel(`drives/${args.driveUUID}/dirs/${args.dirUUID}`)
        break

      case 'deleteFile':
        r = this.adel(`drives/${args.driveUUID}/dirs/${args.dirUUID}/files/${args.fileUUID}`)
        break

    /** Ext APIs **/
      case 'extDrives':
        r = this.aget('files/external/fs')
        break

      case 'extListDir':
        r = this.aget(`files/external/fs/${args.path}`)
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
        r = this.aget('fileshare')
        break

    /** Media Share API **/
      case 'mediaShare':
        r = this.aget('mediashare')
        break

    /** Media API **/
      case 'media':
        r = this.aget('media')
        break

    /** Docker API **/
      case 'docker':
        r = request.get('http://10.10.9.86:3000/server')
        break

    /** Ticket and Wechat API **/
      case 'creatTicket':
        r = this.apost('station/tickets/', { type: 2 })
        break

      case 'getWechatToken':
        r = request
          .get('http://10.10.9.59:5757/v1/token')
          .query({ code: args.code })
          .query({ platform: args.platform })
        break

      case 'getTicket':
        console.log('getTicket API', args)
        r = this.aget(`station/tickets/${args.ticketId}`)
        break

      case 'confirmTicket':
        r = this.apost(`station/tickets/wechat/${args.ticketId}`, {
          guid: args.guid,
          state: args.state
        })
        break

      case 'wxBind':
        r = request
          .get('http://10.10.9.59:5757/v1/wx/oauth2')
          .query({ ticketId: args.ticketId })
          .query({ code: args.code })
          .query({ platform: args.platform })
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
    this.request('account')
    this.request('users')
    this.requestAsync('drives').asCallback((err, drives) => {
      if (drives) {
        console.log('requestAsync drives success', drives)
        const drive = drives.find(drive => drive.tag === 'home')
        this.request('listNavDir', { driveUUID: drive.uuid, dirUUID: drive.uuid })
      }
    })
    // this.request('media')
  }
}

export default Fruitmix
