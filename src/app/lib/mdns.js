import UUID from 'node-uuid'

class MDNS {

  constructor(ipc, store) {

    console.log('constructing mdns', ipc, store)

    this.ipc = ipc
    this.store = store
    this.devices = undefined
    this.session = undefined

    this.ipc.on('MDNS_UPDATE', this.handleUpdate.bind(this))
  }

  handleUpdate(event, session, device) {

    console.log('MDNS_UPDATE', session, device)

    // discard out-dated session data
    if (this.session !== session) return

    // discard existing result
    if (this.devices.find(dev => dev.host === device.host)) return

    this.devices = [...this.devices, device]
    this.store.dispatch({ type: 'MDNS_UPDATE', data: this.devices })
  }

  scan() {

    this.session = UUID.v4()
    this.devices = [] 
    this.store.dispatch({ type: 'MDNS_UPDATE', data: [] })

    this.ipc.send('MDNS_SCAN', this.session)

    console.log('start new mdns scan session ', this.session)
  }
}


export default (ipc, store) => new MDNS(ipc, store) 

