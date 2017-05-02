import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import { Avatar, Divider } from 'material-ui'
import HardwareDeveloperBoard from 'material-ui/svg-icons/hardware/developer-board'
import FileFolder from 'material-ui/svg-icons/file/folder'

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
          类型
        </div>
        <div style={{flexGrow: 1}}>
          位置
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
class FileSystemRow extends PureComponent {

  render() {

    let fileSystem = this.props.fileSystem

    return (
      <div style={{height: 64, display: 'flex', alignItems: 'center',
        ':hover': { backgroundColor: '#F5F5F5' }
      }}>
        <div style={{flex: '0 0 32px'}} />
          <Avatar><FileFolder color='white' /></Avatar>
        <div style={{flex: '0 0 32px'}} />
        <div style={{flex: '0 0 240px', fontSize: 16, color: 'rgba(0,0,0,0.87)'}}>
          { fileSystem.fileSystemType } 
        </div>
        <div style={{flexGrow: 1, fontSize: 16, color: 'rgba(0,0,0,0.87)'}}>
          { fileSystem.mountpoint }
        </div>
        <div style={{flex: '0 0 320px', fontSize: 16, color: 'rgba(0,0,0,0.87)'}}>
          { fileSystem.fileSystemUUID}
        </div>
        <div style={{flex: '0 0 144px'}} />
      </div>
    )
  }
}

class Physical extends Base {

  constructor(ctx) {
    super(ctx)
    this.state = {}
  }

  willReceiveProps(nextProps) { 
  }

  navEnter() {
    let apis = this.ctx.props.apis
    apis.request('extDrives')
  }

  navLeave() {
  }

  navGroup() {
    return 'file'
  }

  menuName() {
    return '物理磁盘'
  }

  menuIcon() {
    return HardwareDeveloperBoard
  }

  quickName() {
    return '物理磁盘'
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

  detailWidth() {
    return 400
  }

  /** renderers **/
  renderContent() {

    let extDrives, apis = this.ctx.props.apis
    if (apis.extDrives.isFulfilled) extDrives = apis.extDrives.value()

    return (
      <div style={{width: '100%', height: '100%'}}>

        <div style={{height: 8}} />

        <DriveHeader />
        
        <div style={{height: 8}} />

        <Divider style={{marginLeft: 104}} />

        { extDrives && extDrives.map(fsys => <FileSystemRow fileSystem={fsys} />) }
      </div>
    )
  }
}

export default Physical

