import Debug from 'debug'
import React from 'react'
import Radium from 'radium'
import ActionDns from 'material-ui/svg-icons/action/dns'
import Base from './Base'
import DeviceInfo from '../control/DeviceInfo'

const debug = Debug('component:view:device')

class Device extends Base {

  constructor(ctx) {
    super(ctx)

    this.address = ctx.props.selectedDevice.mdev.address
    this.state = {
      device: ''
    }
  }

  willReceiveProps(nextProps) {
    console.log('device nextProps', nextProps)
    if (!nextProps.selectedDevice || !nextProps.selectedDevice.device) return
    const device = nextProps.selectedDevice.device
    if (device.isPending() || device.isRejected()) return

    /* now it's fulfilled */
    const value = device.value()

    if (value !== this.state.device) {
      this.setState({ device: value })
    }
  }

  navEnter() {
  }

  navLeave() {
  }

  navGroup() {
    return 'settings'
  }

  menuName() {
    return '设备信息'
  }

  menuIcon() {
    return ActionDns
  }

  quickName() {
    return '设备'
  }

  appBarStyle() {
    return 'colored'
  }

  renderTitle({ style }) {
    return <div style={style}>系统</div>
  }

  renderContent() {
    return (
      <DeviceInfo
        device={this.state.device}
        primaryColor={this.groupPrimaryColor()}
      />
    )
  }
}

export default Device
