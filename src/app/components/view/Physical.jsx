import React, { Component, PureComponent } from 'react'
import Radium from 'radium'
import { ipcRenderer } from 'electron'
import { Avatar, Divider, MenuItem } from 'material-ui'
import HardwareDeveloperBoard from 'material-ui/svg-icons/hardware/developer-board'
import FileFolder from 'material-ui/svg-icons/file/folder'

import Base from './Base'
import FileContent from '../file/FileContent'
import ListSelect from '../file/ListSelect2'
import MoveDialog from '../file/MoveDialog'
import ContextMenu from '../common/ContextMenu'
import DialogOverlay from '../common/DialogOverlay'

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
      move: false,
      copy: false
    }

    ipcRenderer.on('physicalListUpdate', (e, obj) => {
      if (this.state.path.length < 2) return
      if (obj.rootPath !== this.state.path[1].fileSystemUUID) return
      let string = ''
      this.state.path.forEach((item, index) => {
        if (index > 1) string += ('/' + item.name) 
      })
      let position = obj.path.lastIndexOf('/')
      let dirPath = obj.path.substring(0, position)
      if (string == dirPath) {
        this.ctx.openSnackBar(obj.message)
        this.refresh() 
      }
      
    })
  }

  updateState(data) {
    let {extDrives, extListDir} = data
    if (extDrives === this.state.extDrives && data.extListDir === this.state.extListDir) return
    if (this.state.inRoot) {
      let path = this.path
      let entries = extDrives
      let select = this.select.reset(entries.length)
      this.setState({select, path, entries, extDrives, extListDir})
    }else {
      let entries = extListDir
      let select = this.select.reset(entries.length)
      let path = this.path
      this.setState({select, entries, extDrives, extListDir, path})
    }
  }

  willReceiveProps(nextProps) {
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

  renderTitle({style}) {
    if (!this.state.extDrives && !this.state.extListDir) return
    const path = this.state.path
    return (
      <div id='file-breadcrumbs' style={Object.assign({}, style, {marginLeft:'176px'})}>
        {path.reduce((acc, node, index, arr) => {
          if (path.length > 4 && index > 0 && index < path.length - 3) {
            if (index === 1) {
              acc.push(<BreadCrumbSeparator key={'Separator' + index}/>)
              acc.push(<BreadCrumbItem text='...' key='...'/>)
            }
            return acc
          }

          if (index !== 0) acc.push(<BreadCrumbSeparator key={'Separator' + index}/>)

          if (index === 0) { // the first one is always special
            acc.push(<BreadCrumbItem text='物理磁盘' key='物理磁盘' onTouchTap={this.navEnter.bind(this)}/>)
          }

          else {
            if (index === 1) acc.push(
              <BreadCrumbItem 
                text={node.name}
                key={node.name + 'index'} onTouchTap={this.listByBread.bind(this, index)}/>)

            else acc.push(<BreadCrumbItem text={node.name} key={node.name + 'index'} onTouchTap={this.listByBread.bind(this, index)}/>)
            
          }
          return acc
        }, [])}
      </div>
    )
  }

  
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
          updateDetail={() => {}}
          showContextMenu={this.showContextMenu.bind(this)}
        />
        }

        <ContextMenu 
          open={this.state.contextMenuOpen}
          top={this.state.contextMenuY}
          left={this.state.contextMenuX}
          onRequestClose={() => this.hideContextMenu()}
        >
          <MenuItem primaryText='移动' disabled={this.state.path.length>1?false:true} onTouchTap={this.openMove.bind(this)} />
          <MenuItem primaryText='拷贝' disabled={this.state.path.length>1?false:true} onTouchTap={this.openCopy.bind(this)} />
        </ContextMenu> 

        <DialogOverlay open={this.state.move} onRequestClose={this.closeMove.bind(this)}>
          { this.state.move && <MoveDialog
              apis={this.ctx.props.apis} 
              path={this.state.path} 
              entries={this.state.entries}
              select={this.state.select}
              type='physical'
              operation='move'
            />}
        </DialogOverlay>

        <DialogOverlay open={this.state.copy} onRequestClose={this.closeCopy.bind(this)}>
          { this.state.copy && <MoveDialog
              apis={this.ctx.props.apis} 
              path={this.state.path} 
              entries={this.state.entries}
              select={this.state.select}
              type='public'
              operation='copy'
            />}
        </DialogOverlay>

      </div>
    )
  }

  refresh() {
    let path = this.state.path
    let string = ''
    string += path[1].fileSystemUUID + '/'
    path.forEach((item, index) => {
      if (index > 1) string += (item.name + '/')
    })
    this.ctx.props.apis.request('extListDir', {path: encodeURI(string)})
  }

  listByBread(pathIndex) {
    let path = this.state.path
    let newPath = [...this.state.path]
    let string = ''
    if (pathIndex > path.length || pathIndex < 1) throw Error('bread index error')
    path.forEach((item, index) => {
      if (index > pathIndex || index == 0) return
      if (index == 1) string += path[index].fileSystemUUID + '/'
      else string += path[index].name + '/'
    })
    newPath.splice(pathIndex + 1)
    // console.log(string, newPath)
    this.ctx.props.apis.request('extListDir', {path: encodeURI(string)})
    this.path = newPath
    this.setState({inRoot: false})
  } 

  enter(fsy) {
    if (!fsy) {
      if (this.state.select.selected.length > 1) return
      fsy = this.state.entries[this.state.select.selected[0]]
    }
    // console.log(fsy, this.state)
    if (fsy.type == 'file') return
    let string = ''
    let fileSystemIndex = this.state.path.findIndex(item => item.fileSystemUUID)
    if (fileSystemIndex == -1) {
      // console.log('fileSystemIndex 没有找到 在根目录')
      string += (fsy.fileSystemUUID + '/')
    }else {
      // console.log('fileSystemIndex 找到 不在根目录', fileSystemIndex)
      this.state.path.forEach((item, index) => {
        if (index < fileSystemIndex) {}
        if (index == fileSystemIndex) string += (item.fileSystemUUID + '/')
        if (index > fileSystemIndex) string += (item.name + '/')
      })
      string += (fsy.name + '/')
    }

    let path = [...this.state.path, fsy]
    // console.log(string)

    this.ctx.props.apis.request('extListDir', {path: encodeURI(string)})
    this.path = path
    this.setState({inRoot: false})
  }

  showContextMenu(clientX, clientY) {
    if (this.select.state.ctrl || this.select.state.shift) return
    let containerDom = document.getElementById('content-container')
    let maxLeft = containerDom.offsetLeft + containerDom.clientWidth - 240
    let x = clientX > maxLeft? maxLeft: clientX
    let maxTop = containerDom.offsetTop + containerDom.offsetHeight -192
    let y = clientY > maxTop? maxTop: clientY
    this.setState({ 
      contextMenuOpen: true,
      contextMenuX: x,
      contextMenuY: y
    }) 
  }

  hideContextMenu() {
    this.setState({ 
      contextMenuOpen: false,
      contextMenuX: -1,
      contextMenuY: -1,
    })
  }

  openMove() {
    this.setState({move: true})
  }

  closeMove() {
    this.setState({move:false})
  }

  openCopy() {
    this.setState({ copy: true})
  }

  closeCopy() {
    this.setState({ copy: false})
  }
}

class BreadCrumbSeparator extends React.PureComponent {

  render() {
    return (
      <div style={{height:32, width:8, display:'flex', flexDirection:'column', alignItems:'center'}}>
        &rsaquo;
      </div>
    )
  }
}

@Radium
class BreadCrumbItem extends React.PureComponent {

  render() {

    let style = {
      cursor: 'pointer',
      borderRadius: 2, // mimic a flat button
      height: 32,
      paddingLeft: 8, 
      paddingRight: 8, 
      backgroundColor: 'rgba(255,255,255,0)',
      ':hover': {
        backgroundColor: 'rgba(255,255,255,0.14)' // value from material-component card example
      },
      maxWidth: '100px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis'

    }

    return (
      <div style={style} onTouchTap={this.props.onTouchTap}>
        { this.props.text }   
      </div>
    )
  }
}

export default Physical

