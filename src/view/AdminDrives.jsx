import React from 'react'
import Debug from 'debug'
import FileFolderShared from 'material-ui/svg-icons/file/folder-shared'
import { MenuItem } from 'material-ui'
import AdminDriversApp from '../control/AdminDriversApp'
import DriversDetail from '../control/DriversDetail'
import ContextMenu from '../common/ContextMenu'
import Base from './Base'
import { ShareDisk } from '../common/Svg'

const debug = Debug('component:viewModel:AdminDrives: ')

class AdminDrives extends Base {
  constructor(ctx) {
    super(ctx)

    this.state = {
      contextMenuOpen: false,
      contextMenuY: -1,
      contextMenuX: -1
    }

    this.refreshDrives = () => {
      this.ctx.props.apis.request('users')
      this.ctx.props.apis.request('drives')
    }


    this.updateDetail = (detailDrive, detailUsers) => {
      this.setState({ detailDrive, detailUsers })
    }

    this.showContextMenu = (clientX, clientY) => {
      this.setState({
        contextMenuOpen: true,
        contextMenuX: clientX,
        contextMenuY: clientY
      })
    }

    this.hideContextMenu = () => {
      this.setState({
        contextMenuOpen: false,
        contextMenuX: -1,
        contextMenuY: -1
      })
    }
  }

  willReceiveProps(nextProps) {
    console.log('adminusers nextProps', nextProps)
    if (!nextProps.apis || !nextProps.apis.users) return
    const adminUsers = nextProps.apis.users
    if (adminUsers.isPending() || adminUsers.isRejected()) return
    const adminDrives = nextProps.apis.drives
    if (!adminDrives || adminDrives.isPending() || adminDrives.isRejected()) return

    /* now it's fulfilled */
    const users = adminUsers.value()
    const drives = adminDrives.value()

    if (users !== this.state.users || drives !== this.state.drives) {
      this.setState({ users, drives })
    }
  }

  navEnter() {
    this.ctx.props.apis.request('users')
    this.ctx.props.apis.request('drives')
  }

  navLeave() {
  }

  navGroup() {
    return 'device'
  }

  menuName() {
    return '共享盘管理'
  }

  quickName() {
    return '共享盘'
  }

  menuIcon() {
    return ShareDisk
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
    return <div style={Object.assign({}, style, { marginLeft: 176 })}>共享盘管理</div>
  }

  renderDetail({ style, openSnackBar }) {
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
              primaryColor={this.groupPrimaryColor()}
            /> :
            <div style={{ height: 128, backgroundColor: this.groupPrimaryColor(), filter: 'brightness(0.9)' }} />
        }
      </div>
    )
  }

  renderContent({ navTo, toggleDetail, openSnackBar }) {
    // debug('renderContent openSnackBar', openSnackBar)
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <AdminDriversApp
          users={this.state.users}
          drives={this.state.drives}
          apis={this.ctx.props.apis}
          refreshDrives={this.refreshDrives}
          updateDetail={this.updateDetail}
          navTo={navTo}
          showContextMenu={this.showContextMenu}
          openSnackBar={openSnackBar}
        />
        <ContextMenu
          open={this.state.contextMenuOpen}
          top={this.state.contextMenuY}
          left={this.state.contextMenuX}
          onRequestClose={this.hideContextMenu}
        >
          <MenuItem primaryText="打开" onTouchTap={() => navTo('public')} />
          <MenuItem primaryText="修改" onTouchTap={toggleDetail} />
        </ContextMenu>
      </div>
    )
  }
}

export default AdminDrives
