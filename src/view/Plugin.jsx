import React from 'react'
import i18n from 'i18n'
import ActionSettings from 'material-ui/svg-icons/action/settings'
import Base from './Base'
import PluginApp from '../device/PluginApp'

class Plugin extends Base {
  constructor(ctx) {
    super(ctx)

    this.state = {
      sambaStauts: null,
      dlnaStauts: null
    }

    this.refresh = () => {
      this.ctx.props.apis.request('samba')
      this.ctx.props.apis.request('dlna')
    }
  }

  willReceiveProps(nextProps) {
    console.log('adminusers nextProps', nextProps)
    if (!nextProps.apis || !nextProps.apis.samba || !nextProps.apis.dlna) return
    const { samba, dlna }  = nextProps.apis
    if (samba.isPending() || samba.isRejected() || dlna.isPending() || dlna.isRejected()) return

    /* now it's fulfilled */
    const sambaStauts = samba.value()
    const dlnaStauts = dlna.value()

    if (sambaStauts !== this.state.sambaStauts || sambaStauts !== this.state.sambaStauts) {
      this.setState({ sambaStauts, dlnaStauts })
    }
  }

  navEnter() {
    this.ctx.props.apis.request('samba')
    this.ctx.props.apis.request('dlna')
  }

  navGroup() {
    return 'settings'
  }

  menuName() {
    return i18n.__('Plugin Menu Name')
  }

  quickName() {
    return i18n.__('Plugin Quick Name')
  }

  menuIcon() {
    return ActionSettings
  }

  appBarStyle() {
    return 'colored'
  }

  renderContent({ openSnackBar }) {
    return (
      <PluginApp
        primaryColor={this.groupPrimaryColor()}
        openSnackBar={openSnackBar}
        dlna={this.state.dlnaStauts}
        samba={this.state.sambaStauts}
        apis={this.ctx.props.apis}
        refresh={this.refresh}
      />
    )
  }
}

export default Plugin
