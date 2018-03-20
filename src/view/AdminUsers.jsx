import React from 'react'
import i18n from 'i18n'
import ActionSupervisorAccount from 'material-ui/svg-icons/action/supervisor-account'

import AdminUsersApp from '../control/AdminUsersApp'
import Base from './Base'

class AdminUsers extends Base {
  constructor (ctx) {
    super(ctx)
    this.refreshUsers = this.refresh.bind(this)
  }

  willReceiveProps (nextProps) {
    this.handleProps(nextProps.apis, ['users'])
  }

  refresh () {
    this.ctx.props.apis.request('users')
  }

  navEnter () {
    this.ctx.props.apis.request('users')
  }

  navGroup () {
    return 'user'
  }

  menuName () {
    return i18n.__('AdminUsers Menu Name')
  }

  quickName () {
    return i18n.__('AdminUsers Quick Name')
  }

  menuIcon () {
    return ActionSupervisorAccount
  }

  appBarStyle () {
    return 'colored'
  }

  prominent () {
    return true
  }

  renderTitle ({ style }) {
    return <div style={Object.assign({}, style, { marginLeft: 176 })}>{i18n.__('AdminUsers Title')}</div>
  }

  renderContent ({ openSnackBar }) {
    return (
      <AdminUsersApp
        users={this.state.users}
        apis={this.ctx.props.apis}
        refreshUsers={this.refreshUsers}
        openSnackBar={openSnackBar}
      />
    )
  }
}

export default AdminUsers
