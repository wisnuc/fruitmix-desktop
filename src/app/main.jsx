import { ipcRenderer } from 'electron'

import React from 'react'
import ReactDom from 'react-dom'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import { teal500, pinkA200 } from 'material-ui/styles/colors'

import Login from './components/login/Login'
import Navigation from './components/nav/Navigation'
import Maintenance from './components/maintenance/Maintenance'

import Device from './components/common/device'

class Main extends React.Component {

  constructor() {

    super()

    this.selectedDevice = null
    this.user = null

    setTimeout(() => {
      let mdns = window.store.getState().mdns
      if (mdns.length > 0) {
        this.selectDevice(mdns[0])
      }
    }, 3000)

    this.state = { 

      view: 'login',

      selectedDevice: null,

      theme: getMuiTheme({
        fontFamily: 'Noto Sans SC, sans-serif',
        palette: { primary1Color: teal500, accent1Color: pinkA200 }
      }),

      nav: this.nav.bind(this),
      login: this.login.bind(this),
      selectDevice: this.selectDevice.bind(this),
      setPalette: this.setPalette.bind(this),

      ipcRenderer: ipcRenderer
    }
  }

  setPalette(primary1Color, accent1Color) {

    console.log('main setPalette, primary, accent', primary1Color, accent1Color)
    
    this.setState({
      theme: getMuiTheme({
        fontFamily: 'Noto Sans SC, sans-serif',
        palette: { 
          primary1Color, 
          accent1Color 
        }
      })
    })
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

  login() {
    this.setState({ view: 'user' })
  }

  render() {

    let view = null

    switch (this.state.view) {
    case 'login':
      view = <Login mdns={window.store.getState().mdns} {...this.state} />
      break

    case 'maintenance':
      view = <Maintenance {...this.state } />
      break

    case 'user':
      view =  <Navigation {...this.state} />
      break

    default:
      break
    } 

    return (
      <MuiThemeProvider muiTheme={this.state.theme}>
        { view }
      </MuiThemeProvider>
    )
  }
}

export default Main
