import React from 'react'
import ReactDom from 'react-dom'

import Login from './components/login/Login'
import LoggedIn from './components/main/Navigation'
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
    }, 3000)

    this.state = { 

      view: 'login',

      selectedDevice: null,

      nav: this.nav.bind(this),
      login: this.login.bind(this),
      selectDevice: this.selectDevice.bind(this)
    }
  }

  selectDevice(mdev) { 

    // assert mdev must be in mdns list TODO

    if (this.selectedDevice) {
      this.selectedDevice.abort() 
      this.selectedDevice.removeAllListeners()
    }

    this.selectedDevice = new Device(mdev)
    this.selectedDevice.on('updated', (prev, next) => this.setState({ selectedDevice: next }))
    this.selectedDevice.start()
  }

  nav(view) {
    this.setState({ view })
  }

  login() {}

  render() {

    switch (this.state.view) {
    case 'login':
      return <Login mdns={window.store.getState().mdns} {...this.state} />

    case 'maintenance':
      return <Maintenance {...this.state } />

    case 'user':
      return <LoggedIn showAppBar={window.store.getState().view.showAppBar} />

    default:
      return <div>hello world!</div>
    } 
  }
}

export default Main
