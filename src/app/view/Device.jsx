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
      device: null,
      storage: null
    }
  }

  willReceiveProps(nextProps) {
    // console.log('device nextProps', nextProps)
    if (!nextProps.selectedDevice || !nextProps.selectedDevice.device || !nextProps.selectedDevice.storage) return
    const device = nextProps.selectedDevice.device
    if (device.isPending() || device.isRejected()) return
    const storage = nextProps.selectedDevice.storage
    if (storage.isPending() || storage.isRejected()) return

    if (device.value() !== this.state.device || storage.value() !== this.state.storage) {
      this.setState({ device: device.value(), storage: storage.value() })
    }
  }

  navEnter() {
    this.ctx.props.selectedDevice.request('device')
    this.ctx.props.selectedDevice.request('storage')
  }

  navLeave() {
  }

  navGroup() {
    return 'device'
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
    return <div style={style}>设备信息</div>
  }

  renderContent() {
    return (
      <DeviceInfo
        device={this.state.device}
        storage={this.state.storage}
        primaryColor={this.groupPrimaryColor()}
      />
    )
  }
}

export default Device
