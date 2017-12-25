import React from 'react'
import i18n from 'i18n'
import ActionPowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new'
import Base from './Base'
import PowerApp from '../device/PowerApp'

class Power extends Base {
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
        nav={this.ctx.props.nav}
        apis={this.ctx.props.apis}
        openSnackBar={openSnackBar}
        primaryColor={this.groupPrimaryColor()}
        selectedDevice={this.ctx.props.selectedDevice}
      />
    )
  }
}

export default Power
