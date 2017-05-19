import React from 'react'
import Debug from 'debug'
import Paper from 'material-ui/Paper'
import { Dialog, CircularProgress, Divider } from 'material-ui'
import ActionPowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new'
import { pinkA200 } from 'material-ui/styles/colors'
import { ipcRenderer } from 'electron'
import Username from 'material-ui/svg-icons/action/perm-identity'
import PowerSetting from 'material-ui/svg-icons/action/power-settings-new'
import Build from 'material-ui/svg-icons/action/build'

import { header1Style, header2Style, header2StyleNotFirst, contentStyle } from '../control/styles'
import FlatButton from '../common/FlatButton'
import Checkmark from '../common/Checkmark'
import DialogOverlay from '../common/DialogOverlay'

const debug = Debug('component:control:power:')

class Power extends React.Component {

  constructor(props) {
    super(props)
    this.address = this.props.selectedDevice.mdev.address
    this.serial = this.props.selectedDevice.mdev.serial
    this.state = {
      open: false,
      rebooting: false,
      choice: null,
      boot: null,
      storage: null,
      users: null,
      poweroff: null,
      device: null,
      progressDisplay: 'none',
      operationDone: false
    }

    this.cancelButton = <FlatButton label="取消" primary onTouchTap={this.handleClose} />

    this.bootOp = (op) => {
      // debug('request boot op success', op)
      this.props.selectedDevice.request('power', { op })
      if (op === 'poweroff') {
        this.setState({ rebooting: true, poweroff: true })
      } else {
        this.setState({ rebooting: true })
      }
    }
  }

  handleOpen(CHOICE) {
    this.setState({
      choice: CHOICE,
      open: true
    })
  }

  handleClose = () => {
    this.setState({
      open: false,
      rebooting: false
    })
  }

  handleOpenPage = () => {
    this.setState({
      progressDisplay: 'none',
      operationDone: false
    })
    switch (this.state.choice) {
      case 'POWEROFF':
      // go to login page
        this.props.nav('login')
        break
      case 'REBOOT':
      // go to login page & select target device
        this.props.nav('login')
        break
      case 'REBOOTMAINTENANCE':
      // go to login page & select target device
        this.props.nav('maintenance')
        break
    }
  }

  scanMdns() {
    let hasBeenShutDown = false
    const t = setInterval(() => {
      global.mdns.scan()
      setTimeout(() => {
        switch (this.state.choice) {
          case 'POWEROFF':
            if (global.mdns.devices.every(d => d.serial !== this.serial)) {
              clearInterval(t)
              this.setState({ operationDone: true })
            }
            break
          case 'REBOOT':
          case 'REBOOTMAINTENANCE':
            if (hasBeenShutDown) {
              if (global.mdns.devices.find(d => d.serial === this.serial)
                || global.mdns.devices.find(d => d.address === this.address)) {
                clearInterval(t)
                this.setState({ operationDone: true })
              }
            } else if (global.mdns.devices.every(d => d.serial !== this.serial)) {
              hasBeenShutDown = true
            }
            break
        }
      }, 500)
    }, 1000)
  }

  getActions() {
    let operation = ''
    switch (this.state.choice) {
      case 'POWEROFF':
        operation = 'poweroff'
        break
      case 'REBOOT':
        operation = 'reboot'
        break
      case 'REBOOTMAINTENANCE':
        operation = 'rebootMaintenance'
        break
    }

    return [
      this.cancelButton,
      <FlatButton
        label="确定"
        primary
        onTouchTap={() => {
          this.setState({
            progressDisplay: 'block',
            open: false
          })
          ipcRenderer.send('LOGIN_OFF')
          setTimeout(() => {
            this.bootOp(operation)
            this.scanMdns()
          }, 2000)
        }}
      />
    ]
  }

  renderDiaContent() {
    if (this.state.operationDone) {
      let hintText = ''
      let linkText = ''
      switch (this.state.choice) {
        case 'POWEROFF':
          hintText = '设备已关机，去'
          linkText = '登陆'
          break
        case 'REBOOT':
          hintText = '设备已重启完毕，去'
          linkText = '登陆'
          break
        case 'REBOOTMAINTENANCE':
          hintText = '设备已重启至维护模式，去'
          linkText = '维护'
          break
      }

      return [
        <div style={{ marginTop: 80, marginLeft: 194 }}>
          <Checkmark delay={300} />
        </div>,
        <div style={{ textAlign: 'center', marginTop: 30 }}>{hintText}
          <FlatButton label={linkText} primary onTouchTap={this.handleOpenPage} />
        </div>
      ]
    }
    let hintText = ''
    switch (this.state.choice) {
      case 'POWEROFF':
        hintText = '设备正在关机...'
        break
      case 'REBOOT':
        hintText = '设备正在重启...'
        break
      case 'REBOOTMAINTENANCE':
        hintText = '设备正在重启至维护模式 ...'
        break
    }
    return (
      <div>
        <CircularProgress style={{ marginTop: 48, marginLeft: 200 }} size={100} />
        <div style={{ textAlign: 'center', marginTop: 45 }}>{hintText}</div>
      </div>
    )
  }

  render() {
    const progressDiaStyle = {
      position: 'fixed',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.541176)',
      opacity: 1,
      display: this.state.progressDisplay
    }

    const paperStyle = {
      position: 'absolute',
      width: 500,
      height: 300,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white'
    }

    debug('power', this.props)
    return (
      <div style={{ paddingLeft: 24, paddingTop: 24 }}>

        <div style={{ display: 'flex', alignItems: 'center' }} >
          <div style={{ flex: '0 0 56px', height: 36 }} >
            <div style={{ height: 8 }} />
            <PowerSetting color={this.props.primaryColor} />
          </div>
          <div style={{ flex: '0 0 560px', fontSize: 20, color: 'rgba(0, 0, 0, 0.87)' }}>
              重启和关机
            </div>
        </div>

        <div style={{ height: 8 }} />
        <div style={{ display: 'flex', alignItems: 'center' }} >
          <div style={{ flex: '0 0 56px' }} />
          <div style={{ flex: '0 0 560px' }}>
            <FlatButton
              label="关机" primary style={{ marginLeft: -16 }}
              onTouchTap={() => this.handleOpen('POWEROFF')}
            />
            <FlatButton
              label="重启" primary style={{ marginLeft: 0 }}
              onTouchTap={() => this.handleOpen('REBOOT')}
            />
          </div>
        </div>

        <div style={{ height: 16 }} />
        <Divider style={{ color: 'rgba(0, 0, 0, 0.54)' }} />
        <div style={{ height: 16 }} />

        <div style={{ display: 'flex', alignItems: 'center' }} >
          <div style={{ flex: '0 0 56px', height: 36 }} >
            <div style={{ height: 8 }} />
            <Build color={this.props.primaryColor} />
          </div>
          <div style={{ flex: '0 0 560px', fontSize: 20, color: 'rgba(0, 0, 0, 0.87)' }}>
              进入维护模式
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }} >
          <div style={{ flex: '0 0 56px' }} />
          <div style={{ flex: '0 0 560px' }}>
            <div style={contentStyle}>
                重启后进入维护模式，可以在维护模式下执行磁盘操作或系统维护任务。
              </div>
            <div style={{ height: 16 }} />
            <FlatButton
              label="重启进入维护模式" primary style={{ marginLeft: -8 }}
              onTouchTap={() => this.handleOpen('REBOOTMAINTENANCE')}
            />
          </div>
        </div>

        <Dialog
          actions={this.getActions()}
          modal
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          {this.state.choice === 'POWEROFF' ? '确定关机？' : this.state.choice === 'REBOOT' ? '确定重启？' : '确定重启并进入维护模式？'}
        </Dialog>

        <div style={progressDiaStyle}>
          <Paper style={paperStyle} zDepth={2} thickness={7}>
            { this.renderDiaContent()}
          </Paper>
        </div>

      </div>
    )
  }
}

export default Power
