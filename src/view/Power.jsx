import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import ActionPowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new'
import Base from './Base'
import PowerApp from '../device/PowerApp'

const debug = Debug('view:admin:power')

class Power extends Base {
  constructor(ctx) {
    super(ctx)
  }

  navGroup() {
    return 'device'
  }

  menuName() {
    return i18n.__('Power Menu Name')
  }

  menuIcon() {
    return ActionPowerSettingsNew
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
