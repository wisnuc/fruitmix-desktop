import React from 'react'
import Debug from 'debug'
import UpdateIcon from 'material-ui/svg-icons/action/system-update-alt'
import Base from './Base'
import UpdateApp from '../control/UpdateApp'

const debug = Debug('view:component:update')

class Update extends Base {

  constructor(ctx) {
    super(ctx)
  }

  willReceiveProps(nextProps) {
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
        apis={this.ctx.props.apis}
        nav={this.ctx.props.nav}
        selectedDevice={this.ctx.props.selectedDevice}
        primaryColor={this.groupPrimaryColor()}
        openSnackBar={openSnackBar}
      />
    )
  }
}

export default Update
