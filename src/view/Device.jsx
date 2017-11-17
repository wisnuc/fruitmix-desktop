import Debug from 'debug'
import React from 'react'
import Radium from 'radium'
import ActionDns from 'material-ui/svg-icons/action/dns'
import Base from './Base'
import DeviceInfo from '../device/DeviceInfo'

const debug = Debug('component:view:device')

class Device extends Base {
  constructor(ctx) {
    super(ctx)

    this.address = ctx.props.selectedDevice.mdev.address
    this.state = {
      device: null,
      storage: null,
      boot: null,
      info: null
    }
  }

  willReceiveProps(nextProps) {
    // console.log('device nextProps', nextProps)
    if (!nextProps.selectedDevice || !nextProps.selectedDevice.device || !nextProps.selectedDevice.storage
      || !nextProps.selectedDevice.boot || !nextProps.selectedDevice.info) return

    const { device, storage, boot, info } = nextProps.selectedDevice
    if (device.isPending() || device.isRejected() || storage.isPending() || storage.isRejected()
      || boot.isPending() || boot.isRejected() || info.isPending() || info.isRejected()) return

    if (device.value() !== this.state.device || storage.value() !== this.state.storage
      || boot.value() !== this.state.boot || info.value() !== this.state.info) {
      this.setState({ device: device.value(), storage: storage.value(), boot: boot.value(), info: info.value() })
    }
  }

  navEnter() {
    this.ctx.props.selectedDevice.request('device')
    this.ctx.props.selectedDevice.request('storage')
    this.ctx.props.selectedDevice.request('boot')
    this.ctx.props.selectedDevice.request('info')
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

  renderContent({ openSnackBar }) {
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
