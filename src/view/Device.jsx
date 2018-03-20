import React from 'react'
import i18n from 'i18n'
import ActionDns from 'material-ui/svg-icons/action/dns'
import Base from './Base'
import DeviceInfo from '../device/DeviceInfo'

class Device extends Base {
  constructor (ctx) {
    super(ctx)

    this.address = ctx.props.selectedDevice.mdev.address // TODO

    this.state = {
      device: null,
      storage: null,
      boot: null,
      info: null
    }
  }

  willReceiveProps (nextProps) {
    this.handleProps(nextProps.selectedDevice, ['device', 'storage', 'boot', 'info'])
  }

  navEnter () {
    this.ctx.props.selectedDevice.request('device')
    this.ctx.props.selectedDevice.request('storage')
    this.ctx.props.selectedDevice.request('boot')
    this.ctx.props.selectedDevice.request('info')
  }

  navGroup () {
    return 'device'
  }

  menuName () {
    return i18n.__('Device Menu Name')
  }

  menuIcon () {
    return ActionDns
  }

  quickName () {
    return i18n.__('Device Quick Name')
  }

  appBarStyle () {
    return 'colored'
  }

  renderContent ({ openSnackBar }) {
    return (
      <DeviceInfo
        {...this.state}
        selectedDevice={this.ctx.props.selectedDevice}
        primaryColor={this.groupPrimaryColor()}
        openSnackBar={openSnackBar}
      />
    )
  }
}

export default Device
