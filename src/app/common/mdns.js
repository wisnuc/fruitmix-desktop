import UUID from 'node-uuid'
import EventEmitter from 'eventemitter3'

class MDNS {
  constructor(ipc, store, callback) {
    // console.log('constructing mdns', ipc, store)
    this.ipc = ipc
    this.store = store
    this.session = undefined
    this.event = new EventEmitter()
    this.event.on('updateMdns', callback)

    this.handleUpdate = (event, session, device) => {
      /* discard out-dated session data */
      if (this.session !== session) return
      // console.log('MDNS_UPDATE', session, device)

      /* discard existing result */
      if (this.store.find(dev => dev.host === device.host)) return
      this.store.push(device)
      this.event.emit('updateMdns')
    }

    this.ipc.on('MDNS_UPDATE', this.handleUpdate)
  }

  scan() {
    this.session = UUID.v4()
    this.store.length = 0
    this.ipc.send('MDNS_SCAN', this.session)
    // console.log('start new mdns scan session ', this.session)
  }
}

export default (ipc, store, callback) => new MDNS(ipc, store, callback)
