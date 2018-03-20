import React from 'react'
import i18n from 'i18n'
import HardwareToys from 'material-ui/svg-icons/hardware/toys'
import Base from './Base'
import Fan from '../device/Fan'

class FanControl extends Base {
  constructor (ctx) {
    super(ctx)
    this.state = {
      fan: null
    }
    this.refresh = () => this.navEnter()
  }

  willReceiveProps (nextProps) {
    this.handleProps(nextProps.selectedDevice, ['fan'])
  }

  navEnter () {
    this.ctx.props.selectedDevice.request('fan')
  }

  navGroup () {
    return 'device'
  }

  menuName () {
    return i18n.__('FanControl Menu Name')
  }

  menuIcon () {
    return HardwareToys
  }

  quickName () {
    return i18n.__('FanControl Quick Name')
  }

  appBarStyle () {
    return 'colored'
  }

  renderContent ({ openSnackBar }) {
    return (
      <Fan
        fan={this.state.fan}
        primaryColor={this.groupPrimaryColor()}
        request={this.ctx.props.selectedDevice.request}
        openSnackBar={openSnackBar}
        refresh={this.refresh}
      />
    )
  }
}

export default FanControl
