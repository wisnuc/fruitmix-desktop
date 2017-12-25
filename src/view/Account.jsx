import React from 'react'
import i18n from 'i18n'
import { ipcRenderer } from 'electron'
import ActionAccountBox from 'material-ui/svg-icons/action/account-box'

import Base from './Base'
import AccountApp from '../control/AccountApp'

class Account extends Base {
  constructor(ctx) {
    super(ctx)
    this.refreshData = this.refresh.bind(this)
  }

  willReceiveProps(nextProps) {
    this.handleProps(nextProps.apis, ['account', 'users'])
  }

  refresh() {
    this.ctx.props.apis.request('account')
    this.ctx.props.apis.request('users')
  }

  navEnter() {
    this.ctx.props.apis.request('account')
    this.ctx.props.apis.request('users')
  }

  navLeave() {
  }

  navGroup() {
    return 'user'
  }

  menuName() {
    return i18n.__('Account Menu Name')
  }

  menuIcon() {
    return ActionAccountBox
  }

  appBarStyle() {
    return 'colored'
  }

  renderContent({ openSnackBar }) {
    return (
      <AccountApp
        openSnackBar={openSnackBar}
        account={this.state.account}
        apis={this.ctx.props.apis}
        primaryColor={this.groupPrimaryColor()}
        refresh={this.refreshData}
        ipcRenderer={ipcRenderer}
        selectedDevice={this.ctx.props.selectedDevice}
      />
    )
  }
}

export default Account
