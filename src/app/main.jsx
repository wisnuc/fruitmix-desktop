import React from 'react'
import ReactDom from 'react-dom'

import Login from './components/login/Login'
import LoggedIn from './components/main/Main'
import Maintenance from './components/maintenance/Maintenance'

import Device from './components/common/device'

class Main extends React.Component {

  constructor() {
    super()

    this.selectedDevice = null

    setTimeout(() => {
      let mdns = window.store.getState().mdns
      if (mdns.length > 0) {
        this.selectDevice(mdns[0])
      }
    }, 2000)

    this.state = { selectedDevice: null }

    this.selectDeviceBound = this.selectDevice.bind(this)
  }

  selectDevice(mdev) { 

    // assert mdev must be in mdns list TODO

    if (this.selectedDevice) {
      this.selectedDevice.abort() 
      this.selectedDevice.removeAllListeners()
    }

    this.selectedDevice = new Device(mdev)
    this.selectedDevice.on('updated', (name, prev, curr) => 
      this.setState({ selectedDevice: this.selectedDevice.immutable }))

    this.setState({ selectedDevice: this.selectedDevice.immutable })
  }

  render() {

    if (window.store.getState().maintenance) 
      return <Maintenance />

    else if (window.store.getState().login.state === 'LOGIN')
      return <LoggedIn showAppBar={window.store.getState().view.showAppBar} /> 

    else {
      return (
        <Login 
          mdns={window.store.getState().mdns} 
          {...this.state} 
          selectDevice={this.selectDeviceBound}
        />
      )
    }
  }
}

export default Main
