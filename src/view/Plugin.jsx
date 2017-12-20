import React from 'react'
import i18n from 'i18n'
import ActionSettings from 'material-ui/svg-icons/action/extension'
import Base from './Base'
import PluginApp from '../device/PluginApp'

class Plugin extends Base {
  constructor(ctx) {
    super(ctx)

    this.state = {
      sambaStatus: null,
      dlnaStatus: null
    }

    this.refresh = () => {
      this.ctx.props.apis.request('samba')
      this.ctx.props.apis.request('dlna')
      this.ctx.props.apis.request('bt')
    }
  }

  willReceiveProps(nextProps) {
    console.log('adminusers nextProps', nextProps)
    if (!nextProps.apis || !nextProps.apis.samba || !nextProps.apis.dlna || !nextProps.apis.bt) return
    const { samba, dlna, bt } = nextProps.apis
    if (samba.isPending() || samba.isRejected() || dlna.isPending() || dlna.isRejected() || bt.isPending() || bt.isRejected()) return

    /* now it's fulfilled */
    const sambaStatus = samba.value()
    const dlnaStatus = dlna.value()
    const btStatus = bt.value()

    if (sambaStatus !== this.state.sambaStatus || sambaStatus !== this.state.sambaStatus || btStatus !== this.state.btStatus) {
      this.setState({ sambaStatus, dlnaStatus, btStatus })
    }
  }

  navEnter() {
    this.ctx.props.apis.request('samba')
    this.ctx.props.apis.request('dlna')
    this.ctx.props.apis.request('bt')
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
        dlna={this.state.dlnaStatus}
        samba={this.state.sambaStatus}
        bt={this.state.btStatus}
        apis={this.ctx.props.apis}
        refresh={this.refresh}
      />
    )
  }
}

export default Plugin
