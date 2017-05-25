import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import { Avatar, Divider } from 'material-ui'
import HardwareDeveloperBoard from 'material-ui/svg-icons/hardware/developer-board'
import FileFolder from 'material-ui/svg-icons/file/folder'

import Base from './Base'
import FileContent from '../file/FileContent'
import ListSelect from '../file/ListSelect2'

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
    if (this.props.fileSystem.uuid) return null
    let fileSystem = this.props.fileSystem

    return (
      <div style={{height: 64, display: 'flex', alignItems: 'center',
        ':hover': { backgroundColor: '#F5F5F5' }
      }} onDoubleClick={this.props.enter}>
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
    this.path = [{name:'物理磁盘', type: 'physical', uuid:'物理磁盘'}]
    this.select = new ListSelect(this)
    this.select.on('updated', next => this.setState({ select: next }))
    this.state = {
      extDrives:null,
      extListDir: null,
      path: [],
      entries:[],
      inRoot: true,
      contextMenuOpen: false,
      contextMenuY: -1,
      contextMenuX: -1,
    }
  }

  updateState(data) {
    console.log('.........',data)
    let {extDrives, extListDir} = data
    if (extDrives === this.state.extDrives && data.extListDir === this.state.extListDir) return console.log('same props in Physical')
    if (this.state.inRoot) {
      console.log('在根目录')
      let path = this.path
      let entries = extDrives
      let select = this.select.reset(entries.length)
      this.setState({select, path, entries, extDrives, extListDir})
    }else {
      console.log('不在根目录')
      let entries = extListDir
      let select = this.select.reset(entries.length)
      let path = this.path
      this.setState({select, entries, extDrives, extListDir, path})
    }
  }

  willReceiveProps(nextProps) {
    console.log('receive props in Physical')
    let apis = nextProps.apis
    if (!apis || !apis.extDrives) return
    if (apis.extDrives.isPending()) return
    if (apis.extListDir && apis.extListDir.isPending()) return
    let extListDir = nextProps.apis.extListDir && !apis.extListDir.isRejected()? nextProps.apis.extListDir.value():null
    let extDrives = apis.extDrives.value()
    extDrives.forEach(item => item.type = 'folder')
    this.updateState({
      extListDir: extListDir,
      extDrives: extDrives
    })
  }

  navEnter() {
    let apis = this.ctx.props.apis
    this.path = [{name:'物理磁盘', type: 'physical', uuid:'物理磁盘'}]
    this.setState({inRoot :true, entries :[]})
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

        {this.state.path.length == 1 && <DriveHeader />}
        
        <div style={{height: 8}} />

         {this.state.path.length == 1 &&<Divider style={{marginLeft: 104}} />}

        { this.state.path.length == 1 && this.state.entries.map(fsys => <FileSystemRow fileSystem={fsys} enter={this.enter.bind(this, fsys)} />) }
        { this.state.path.length > 1 && <FileContent 
          home={this.state} 
          select={this.state.select} 
          entries={this.state.entries}
          listNavBySelect={this.enter.bind(this)}
        />
        }

      </div>
    )
  }

  enter(fsy) {
    if (!fsy) {
      if (this.state.select.selected.length > 1) return
      fsy = this.state.entries[this.state.select.selected[0]]
    }
    console.log(fsy, this.state)
    if (fsy.type == 'file') return
    let string = ''
    let fileSystemIndex = this.state.path.findIndex(item => item.fileSystemUUID)
    if (fileSystemIndex == -1) {
      console.log('fileSystemIndex 没有找到 在根目录')
      string += (fsy.fileSystemUUID + '/')
    }else {
      console.log('fileSystemIndex 找到 不在根目录', fileSystemIndex)
      this.state.path.forEach((item, index) => {
        console.log(item)
        if (index < fileSystemIndex) {}
        if (index == fileSystemIndex) string += (item.fileSystemUUID + '/')
        if (index > fileSystemIndex) string += (item.name + '/')
      })
      string += (fsy.name + '/')
    }
      console.log(string)
    let path = [...this.state.path, fsy]
    console.log(string)

    this.ctx.props.apis.request('extListDir', {path: encodeURI(string)})
    this.path = path
    this.setState({inRoot: false})
  }
}

export default Physical

