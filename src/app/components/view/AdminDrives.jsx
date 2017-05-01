import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import { Avatar, Divider, FloatingActionButton, TextField, IconButton } from 'material-ui'
import FileFolderShared from 'material-ui/svg-icons/file/folder-shared'
import FileFolder from 'material-ui/svg-icons/file/folder'
import ContentAdd from 'material-ui/svg-icons/content/add'

import IconBox from '../common/IconBox'
import DialogOverlay from '../common/DialogOverlay'
import NewDriveDialog from '../control/NewDriveDialog'
import Base from './Base'

class DriveHeader extends PureComponent {

  // 104, leading
  // 240, label
  // grow, user
  // 320, uuid
  // 56, spacer
  // 64, view
  // 24, padding
  render() {
    return (
      <div style={{height: 48, display: 'flex', alignItems: 'center'}}>
        <div style={{flex: '0 0 104px'}} />
        <div style={{flex: '0 0 240px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)'}}>
          名称
        </div>
        <div style={{flexGrow: 1}}>
          用户
        </div>
        <div style={{flex: '0 0 320px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)'}}>
          UUID
        </div>
        <div style={{flex: '0 0 144px'}} />
      </div>
    )
  }
}

@Radium
class DriveRow extends PureComponent {

  render() {

    let drive = this.props.drive
    let users = this.props.users

    return (
      <div style={{height: 64, display: 'flex', alignItems: 'center',
        ':hover': { backgroundColor: '#F5F5F5' }
      }}>
        <div style={{flex: '0 0 32px'}} />
          <Avatar><FileFolder color='white' /></Avatar>
        <div style={{flex: '0 0 32px'}} />
        <div style={{flex: '0 0 240px', fontSize: 16, color: 'rgba(0,0,0,0.87)'}}>{drive.label}</div>
        <div style={{flexGrow: 1, fontSize: 16, color: 'rgba(0,0,0,0.87)'}}>
        { drive.writelist.reduce((acc, uuid) => {
            let user = users.find(u => u.uuid === uuid)
            return user 
              ? [...acc, user.username]
              : acc
          }, []).join() }
        </div>
        <div style={{flex: '0 0 320px', fontSize: 16, color: 'rgba(0,0,0,0.87)'}}>
          {drive.uuid}
        </div>
        <div style={{flex: '0 0 144px'}} />
      </div>
    )
  }
}

class AdminDrives extends Base {

  constructor(ctx) {
    super(ctx)
    this.state = { 
      newDrive: false 
    }

    this.onCloseDialog = () => {
      this.setState({ newDrive: false })
    }
  }

  willReceiveProps(nextProps) { 
  
  }

  navEnter() {
    this.ctx.props.apis.request('adminUsers')
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

  /** renderers **/
  renderContent() {

    let users, drives

    if (this.ctx.props.apis.adminDrives.isFulfilled())
      drives = this.ctx.props.apis.adminDrives.value().drives

    if (this.ctx.props.apis.adminUsers.isFulfilled()) 
      users = this.ctx.props.apis.adminUsers.value().users
   
/** TODO
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
**/

    return (
      <div style={{position: 'relative', width: '100%', height: '100%'}}>

        <FloatingActionButton 
          style={{position: 'absolute', top: -28, left: 24}}
          secondary={true}
          disabled={!users || !drives}
          onTouchTap={() => this.setState({newDrive: true})}
        >
          <ContentAdd />
        </FloatingActionButton>

        <div style={{height: 8}} />

        <DriveHeader />
        
        <div style={{height: 8}} />

        <Divider style={{marginLeft: 104}} />

        { drives && users && drives.reduce((acc, drive) => 
            [...acc, <DriveRow drive={drive} users={users} />, <Divider style={{marginLeft: 104}} />], 
            []) }

        <DialogOverlay open={!!this.state.newDrive} onRequestClose={this.onCloseDialog}>
          { this.state.newDrive && <NewDriveDialog primary={true} apis={this.ctx.props.apis} /> }
        </DialogOverlay>
      </div>
    )
  }
}

export default AdminDrives


