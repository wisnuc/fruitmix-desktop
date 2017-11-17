import React from 'react'
import Debug from 'debug'
import ActionPowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new'
import Base from './Base'
import PowerApp from '../device/PowerApp'

const debug = Debug('view:admin:power')

class Power extends Base {
  constructor(ctx) {
    super(ctx)
  }

  willReceiveProps(nextProps) {
  }

  navEnter() {
  }

  navLeave() {
  }

  navGroup() {
    return 'device'
  }

  menuName() {
    return '重启与关机'
  }

  menuIcon() {
    return ActionPowerSettingsNew
  }

  quickName() {
    return '重启关机'
  }

  appBarStyle() {
    return 'colored'
  }

  renderContent({ openSnackBar }) {
    return (
      <PowerApp
        apis={this.ctx.props.apis}
        nav={this.ctx.props.nav}
        selectedDevice={this.ctx.props.selectedDevice}
        primaryColor={this.groupPrimaryColor()}
        openSnackBar={openSnackBar}
      />
    )
  }
}

export default Power
