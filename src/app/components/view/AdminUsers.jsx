import React from 'react'
import ActionSupervisorAccount from 'material-ui/svg-icons/action/supervisor-account'
import AdminUsersApp from '../control/AdminUsersApp'
import Base from './Base'

class AdminUsers extends Base {

  constructor(ctx) {
    super(ctx)
    this.refreshUsers = this.refresh.bind(this)
  }

  willReceiveProps(nextProps) {
    // console.log('adminusers nextProps', nextProps)
    if (!nextProps.apis || !nextProps.apis.adminUsers) return
    const adminUsers = nextProps.apis.adminUsers
    if (adminUsers.isPending() || adminUsers.isRejected()) return

    /* now it's fulfilled */
    const value = adminUsers.value().users

    if (value !== this.state.users) {
      this.setState({ users: value })
    }
  }
  refresh () {
    this.ctx.props.apis.request('adminUsers')
  }

  navEnter() {
    this.ctx.props.apis.request('adminUsers')
    this.ctx.props.apis.request('login')
  }

  navLeave() {
  }

  navGroup() {
    return 'settings'
  }

  menuName() {
    return '用户'
  }

  menuIcon() {
    return ActionSupervisorAccount
  }

  appBarStyle() {
    return 'colored'
  }

  prominent() {
    return true
  }

  renderTitle({ style }) {
    return <div style={Object.assign({}, style, { marginLeft: 176 })}>用户</div>
  }

  /** renderers **/
  renderContent({ openSnackBar }) {
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
