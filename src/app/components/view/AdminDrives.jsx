import React from 'react'
import Debug from 'debug'
import FileFolderShared from 'material-ui/svg-icons/file/folder-shared'
import { MenuItem } from 'material-ui'
import AdminDriversApp from '../control/AdminDriversApp'
import DriversDetail from '../control/DriversDetail'
import ContextMenu from '../common/ContextMenu'
import Base from './Base'

const debug = Debug('component:viewModel:Media: ')

class AdminDrives extends Base {

  constructor(ctx) {
    super(ctx)
    this.refreshDrives = this.refresh.bind(this)
    this.updateDetail = this.update.bind(this)
    this.state = {
      contextMenuOpen: false,
      contextMenuY: -1,
      contextMenuX: -1
    }
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

  showContextMenu(clientX, clientY) {
    this.setState({
      contextMenuOpen: true,
      contextMenuX: clientX,
      contextMenuY: clientY
    })
  }

  hideContextMenu() {
    this.setState({
      contextMenuOpen: false,
      contextMenuX: -1,
      contextMenuY: -1
    })
  }

  refresh() {
    this.ctx.props.apis.request('adminUsers')
    this.ctx.props.apis.request('adminDrives')
  }

  update(detailDrive, detailUsers) {
    // debug('detailDrive, detailUsers', detailDrive, detailUsers)
    this.setState({ detailDrive, detailUsers })
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

  renderDetail({ style }, openSnackBar) {
    return (
      <div style={style}>
        {
          this.state.detailDrive ?
            <DriversDetail
              primary
              openSnackBar={openSnackBar}
              users={this.state.users}
              drives={this.state.drives}
              detailUsers={this.state.detailUsers}
              detailDrive={this.state.detailDrive}
              apis={this.ctx.props.apis}
              refreshDrives={this.refreshDrives}
            /> :
            <div style={{ height: 128, backgroundColor: '#5E35B1' }} />
        }
      </div>
    )
  }

  /** renderers **/
  renderContent({ navTo, toggleDetail, openSnackBar }) {
    debug('renderContent openSnackBar', openSnackBar)
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <AdminDriversApp
          users={this.state.users}
          drives={this.state.drives}
          apis={this.ctx.props.apis}
          refreshDrives={this.refreshDrives}
          updateDetail={this.updateDetail}
          navTo={navTo}
          showContextMenu={this.showContextMenu.bind(this)}
          openSnackBar={openSnackBar}
        />
        <ContextMenu
          open={this.state.contextMenuOpen}
          top={this.state.contextMenuY}
          left={this.state.contextMenuX}
          onRequestClose={() => this.hideContextMenu()}
        >
          <MenuItem primaryText="打开" onTouchTap={() => navTo('public')} />
          <MenuItem primaryText="修改" onTouchTap={toggleDetail} />
        </ContextMenu>
      </div>
    )
  }
}

export default AdminDrives
