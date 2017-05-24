import React from 'react'
import HardwareToys from 'material-ui/svg-icons/hardware/toys'
import Base from './Base'
import Fan from '../control/Fan'

class FanControl extends Base {

  constructor(ctx) {
    super(ctx)
    this.state = {
      fan: null
    }
  }

  willReceiveProps(nextProps) {
    // console.log('fan nextProps', nextProps)
    if (!nextProps.selectedDevice || !nextProps.selectedDevice.fan) return

    const fan = nextProps.selectedDevice.fan
    if (fan.isPending() || fan.isRejected()) return

    /* now it's fulfilled */
    const value = fan.value()
    this.request = nextProps.selectedDevice.request

    if (value !== this.state.fan) {
      this.setState({ fan: value })
    }
  }

  navEnter() {
    this.ctx.props.selectedDevice.request('fan')
  }

  navLeave() {
  }

  navGroup() {
    return 'settings'
  }

  menuName() {
    return '风扇控制'
  }

  menuIcon() {
    return HardwareToys
  }

  quickName() {
    return '风扇'
  }

  appBarStyle() {
    return 'colored'
  }

  /** renderers **/
  renderContent({ openSnackBar }) {
    return (
      <Fan
        fan={this.state.fan}
        primaryColor={this.groupPrimaryColor()}
        request={this.request}
        openSnackBar={openSnackBar}
      />
    )
  }
}

export default FanControl
