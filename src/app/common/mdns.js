import UUID from 'node-uuid'

class MDNS {
  constructor(ipc, store) {
    // console.log('constructing mdns', ipc, store)
    this.ipc = ipc
    this.store = store
    this.session = undefined

    this.handleUpdate = (event, session, device) => {
      // console.log('MDNS_UPDATE', session, device)

      /* discard out-dated session data */
      if (this.session !== session) return

      /* discard existing result */
      if (this.store.find(dev => dev.host === device.host)) return
      this.store.push(device)
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

export default (ipc, store) => new MDNS(ipc, store) 
