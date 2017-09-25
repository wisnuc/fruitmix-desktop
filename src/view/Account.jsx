import React, { Component, PureComponent } from 'react'
import Radium from 'radium'
import ActionAccountBox from 'material-ui/svg-icons/action/account-box'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import Base from './Base'
import AccountApp from '../control/AccountApp.jsx'

const debug = Debug('component:viewModel:Account')

class Account extends Base {

  constructor(ctx) {
    super(ctx)
    this.refreshData = this.refresh.bind(this)
  }

  willReceiveProps(nextProps) {
    // debug('account nextProps', nextProps)
    if (!nextProps.apis || !nextProps.apis.account) return
    const account = nextProps.apis.account
    if (account.isPending() || account.isRejected()) return

    /* now it's fulfilled */
    const value = account.value()

    if (value !== this.state.account) {
      this.setState({ account: value })
    }
  }

  refresh() {
    this.ctx.props.apis.request('account')
    this.ctx.props.apis.request('users')
  }
  navEnter() {
    /* get user list */
    this.ctx.props.apis.request('users')
  }

  navLeave() {
  }

  navGroup() {
    return 'other'
  }

  menuName() {
    return '我'
  }

  menuIcon() {
    return ActionAccountBox
  }

  appBarStyle() {
    return 'colored'
  }

  /** renderers **/
  renderContent({ openSnackBar }) {
    // debug('renderContent', this.state.account)
    return (
      <AccountApp
        openSnackBar={openSnackBar}
        account={this.state.account}
        apis={this.ctx.props.apis}
        primaryColor={this.groupPrimaryColor()}
        refresh={this.refreshData}
        ipcRenderer={ipcRenderer}
      />
    )
  }
}

export default Account
