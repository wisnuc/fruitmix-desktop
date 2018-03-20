import React from 'react'
import i18n from 'i18n'
import ActionSettings from 'material-ui/svg-icons/action/extension'
import Base from './Base'
import PluginApp from '../device/PluginApp'

class Plugin extends Base {
  constructor (ctx) {
    super(ctx)

    this.refresh = () => {
      this.ctx.props.apis.request('samba')
      this.ctx.props.apis.request('dlna')
      this.ctx.props.apis.request('bt')
    }
  }

  willReceiveProps (nextProps) {
    this.handleProps(nextProps.apis, ['samba', 'dlna', 'bt'])
  }

  navEnter () {
    this.refresh()
  }

  navGroup () {
    return 'settings'
  }

  menuName () {
    return i18n.__('Plugin Menu Name')
  }

  quickName () {
    return i18n.__('Plugin Quick Name')
  }

  menuIcon () {
    return ActionSettings
  }

  appBarStyle () {
    return 'colored'
  }

  renderContent ({ openSnackBar }) {
    return (
      <PluginApp
        primaryColor={this.groupPrimaryColor()}
        openSnackBar={openSnackBar}
        dlna={this.state.dlna}
        samba={this.state.samba}
        bt={this.state.bt}
        apis={this.ctx.props.apis}
        refresh={this.refresh}
      />
    )
  }
}

export default Plugin
