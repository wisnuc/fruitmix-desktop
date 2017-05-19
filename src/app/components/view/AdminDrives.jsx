import React from 'react'
import Debug from 'debug'
import FileFolderShared from 'material-ui/svg-icons/file/folder-shared'
import AdminDriversApp from '../control/AdminDriversApp'
import Base from './Base'

const debug = Debug('component:viewModel:Media: ')

class AdminDrives extends Base {

  constructor(ctx) {
    super(ctx)
    this.refreshDrives = this.refresh.bind(this)
  }

  willReceiveProps(nextProps) {
    // console.log('adminusers nextProps', nextProps)
    if (!nextProps.apis || !nextProps.apis.adminUsers) return
    const adminUsers = nextProps.apis.adminUsers
    if (adminUsers.isPending() || adminUsers.isRejected()) return
    const adminDrives = nextProps.apis.adminDrives
    if (adminDrives.isPending() || adminDrives.isRejected()) return

    /* now it's fulfilled */
    const users = adminUsers.value().users
    const drives = adminDrives.value().drives

    if (users !== this.state.users || drives !== this.state.drives) {
      this.setState({ users, drives })
    }
  }

  refresh() {
    this.ctx.props.apis.request('adminUsers')
    this.ctx.props.apis.request('adminDrives')
  }

  navEnter() {
  }

  navLeave() {
  }

  navGroup() {
    return 'settings'
  }

  menuName() {
    return '共享文件夹'
  }

  menuIcon() {
    return FileFolderShared
  }

  appBarStyle() {
    return 'colored'
  }

  prominent() {
    return true
  }

  hasDetail() {
    return true
  }

  detailEnabled() {
    return true
  }

  renderTitle({ style }) {
    return <div style={Object.assign({}, style, { marginLeft: 176 })}>共享文件夹</div>
  }

  renderDetail({ style }) {
    return (
      <div style={style}>
        hello world
      </div>
    )
  }

  /** renderers **/
  renderContent() {
    return (
      <AdminDriversApp
        users={this.state.users}
        drives={this.state.drives}
        apis={this.ctx.props.apis}
        refreshDrives={this.refreshDrives}
      />
    )
  }
}

export default AdminDrives
