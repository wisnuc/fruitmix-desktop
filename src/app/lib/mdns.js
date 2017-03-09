import UUID from 'node-uuid'
import { ipcRenderer } from 'electron'

window.mdns = {

  instance: null,
  devices: [],

  update(instance, device) {
    if (this.instance !== instance) return
    if (this.devices.find(dev => dev.host === device.host)) return
    this.devices = [...this.devices, device]
    console.log('mdns udpated', this.devices)

    window.fullRender()
  },

  restart() {
    this.instance = UUID.v4()
    this.devices = []
    ipcRenderer.send('MDNS_RESTART', this.instance)
  }
}

ipcRenderer.on('MDNS_UPDATE', 
  (event, instance, device) => window.mdns.update(instance, device))

window.mdns.restart()


