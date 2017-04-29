import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import { Avatar, Divider, FloatingActionButton, TextField } from 'material-ui'
import FileFolderShared from 'material-ui/svg-icons/file/folder-shared'
import ContentAdd from 'material-ui/svg-icons/content/add'

import Base from './Base'

class AdminDrives extends Base {

  constructor(ctx) {
    super(ctx)
    this.state = { 
      createNewDrive: false 
    }

    this.onCloseDialog = () => {
      this.setState({ createNewDrive: false })
    }
  }

  willReceiveProps(nextProps) { 
  }

  navEnter() {
    this.ctx.props.apis.request('adminDrives')
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

  renderTitle({style}) {
    return <div style={Object.assign({}, style, { marginLeft: 176 })}>共享文件夹</div>
  }

  renderDriveRow(drive) {
    return (
      <div style={{height: 64, display: 'flex', alignItems: 'center'}}>
        <div style={{flex: '0 0 32px'}} />
        <Avatar>DRV</Avatar>
        <div style={{flex: '0 0 32px'}} />
        <div style={{flex: '0 0 240px', fontSize: 16, color: 'rgba(0,0,0,0.87)'}}>Hello</div>
        <div style={{flex: '0 0 400px', fontSize: 16, color: 'rgba(0,0,0,0.54)'}}>World</div>
      </div>
    )
  }

  /** renderers **/
  renderContent() {

    if (this.ctx.props.apis.adminDrives.isPending()) 
      return <div />

    if (this.ctx.props.apis.adminDrives.isRejected()) 
      return (
        <div style={{width: '100%', height: '100%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div>Sorry, 服务器错误；
            <FlatButton label='重试' primary={true} 
              onTouchTap={() => this.ctx.props.apis.request('adminDrives')} />
          </div>
        </div>
      )

    let drives = this.ctx.props.apis.adminDrives.value().drives
    return (
      <div style={{position: 'relative', width: '100%', height: '100%'}}>
        <FloatingActionButton 
          style={{position: 'absolute', top: -28, left: 24}}
          secondary={true}
          onTouchTap={() => this.setState({createNewUser: true})}
        >
          <ContentAdd />
        </FloatingActionButton>
        <div style={{height: 8}} />
        <div style={{height: 48, display: 'flex', alignItems: 'center'}}>
          <div style={{flex: '0 0 104px'}} />
          <div style={{flex: '0 0 240px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)'}}>
            用户名
          </div>
          <div style={{flex: '0 0 400px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)'}}>
            UUID
          </div>
        </div>
        <div style={{height: 8}} />
        <Divider style={{marginLeft: 104}} />
        { drives.reduce((acc, user) => 
            [...acc, this.renderDriveRow(drive), <Divider style={{marginLeft: 104}} />], 
            []) }

      </div>
    )
  }
}

export default AdminDrives

/**
        <DialogOverlay open={!!this.state.createNewUser} onRequestClose={this.onCloseDialog}>
          { this.state.createNewUser && 
            <NewUserDialog primary={true} apis={this.ctx.props.apis} /> }
        </DialogOverlay>
**/
