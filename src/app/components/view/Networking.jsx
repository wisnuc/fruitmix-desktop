import React from 'react'
import ActionSettingsEthernet from 'material-ui/svg-icons/action/settings-ethernet'
import Base from './Base'
import NetworkInfo from '../control/NetworkInfo'

class Ethernet extends Base {

  constructor(ctx) {
    super(ctx)
  }

  willReceiveProps(nextProps) {
    console.log('Ethernet nextProps', nextProps)
    if (!nextProps.selectedDevice || !nextProps.selectedDevice.net) return

    const net = nextProps.selectedDevice.net
    if (net.isPending() || net.isRejected()) return

    /* now it's fulfilled */
    const value = net.value()

    if (value !== this.state.net) {
      this.setState({ net: value })
    }
  }

  navEnter() {
    this.ctx.props.selectedDevice.request('net')
  }

  navLeave() {
  }

  navGroup() {
    return 'settings'
  }

  menuName() {
    return '网络设置'
  }

  menuIcon() {
    return ActionSettingsEthernet
  }

  quickName() {
    return '网络'
  }

  appBarStyle() {
    return 'colored'
  }

  /** renderers **/
  renderContent() {
    return (
      <NetworkInfo
        net={this.state.net}
        primaryColor={this.groupPrimaryColor()}
      />
    )
  }
}

export default Ethernet
