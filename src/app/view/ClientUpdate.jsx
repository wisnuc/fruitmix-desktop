import React from 'react'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import UpdateIcon from 'material-ui/svg-icons/action/system-update-alt'
import Base from './Base'
import UpdateApp from '../control/ClientUpdateApp'

const debug = Debug('view:component:ClientUpdate')

class Update extends Base {

  constructor(ctx) {
    super(ctx)
    this.state = {
      releases: ''
    }
  }

  willReceiveProps(nextProps) {
    debug('ClientUpdate nextProps', nextProps)
    if (!nextProps.apis || !nextProps.apis.releases) return
    const releases = nextProps.apis.releases
    if (releases.isPending() || releases.isRejected()) return

    /* now it's fulfilled */
    const value = releases.value()

    if (value !== this.state.releases) {
      this.setState({ releases: value })
    }
  }

  navEnter() {
    this.ctx.props.apis.request('releases', { platform: 'mac' })
  }

  navGroup() {
    return 'update'
  }

  menuName() {
    return '客户端升级'
  }

  menuIcon() {
    return UpdateIcon
  }

  quickName() {
    return '升级'
  }

  appBarStyle() {
    return 'colored'
  }

  /** renderers **/
  renderContent({ openSnackBar }) {
    return (
      <UpdateApp
        rels={this.state.releases}
        apis={this.ctx.props.apis}
        nav={this.ctx.props.nav}
        selectedDevice={this.ctx.props.selectedDevice}
        primaryColor={this.groupPrimaryColor()}
        openSnackBar={openSnackBar}
        ipcRenderer={ipcRenderer}
      />
    )
  }
}

export default Update
