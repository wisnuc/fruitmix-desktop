import React, { Component, PureComponent } from 'react'
import { MenuItem, FloatingActionButton } from 'material-ui'
import Radium from 'radium'

import ListSelect from '../file/ListSelect2'
import FileFolderShared from 'material-ui/svg-icons/file/folder-shared'
import FileContent from '../file/FileContent'
import Base from './Base'
import ContextMenu from '../common/ContextMenu'
import FileUploadButton from '../file/FileUploadButton'

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
      }
    }

    return (
      <div style={style} onTouchTap={this.props.onTouchTap}>
        { this.props.text }   
      </div>
    )
  }
}

class Public extends Base {

  constructor(ctx) {
    super(ctx)
    this.select = new ListSelect(this)
    this.select.on('updated', next => this.setState({ select: next }))
    this.state = { 

      select: this.select.state,
      driveListNavDir: null, // save a reference
      adminDrives:null,
      path: [],         // 
      entries: [],      // sorted

      contextMenuOpen: false,
      contextMenuY: -1,
      contextMenuX: -1,

      createNewFolder: null,
      inRoot: true
    } 
  }

  updateState(listNavDir) {

    // console.log(listNavDir)
    if (listNavDir.driveListNavDir === this.state.driveListNavDir &&
     listNavDir.adminDrives === this.state.adminDrives) return

    if (this.state.inRoot) {
      console.log('在根目录')
      let path = [{name:'共享文件夹', uuid:null}]
      let entries = listNavDir.adminDrives.drives

      entries.forEach(item => item.name = item.label)
      let select = this.select.reset(entries.length) 
      let state = { select, path, entries, 
        driveListNavDir: listNavDir.driveListNavDir, 
        adminDrives: listNavDir.adminDrives
      }

      this.setState(state)

    }else {
      console.log('不在根目录', listNavDir)
      let path = [{name:'共享文件夹', uuid:null}].concat(listNavDir.driveListNavDir.path)
      let entries = listNavDir.driveListNavDir.entries
      entries = [...entries].sort((a, b) => {
        if (a.type === 'folder' && b.type === 'file') return -1
        if (a.type === 'file' && b.type === 'folder') return 1
        if (a.name) return a.name.localeCompare(b.name)
        else return a.label.localeCompare(b.label)
      })

      let select = this.select.reset(entries.length) 
      let state = { select, path, entries,
        driveListNavDir: listNavDir.driveListNavDir, 
        adminDrives: listNavDir.adminDrives 
      }  
      this.setState(state)
    }
  }

  willReceiveProps(nextProps) {
    if (!nextProps.apis || !nextProps.apis.adminDrives) return
    if (nextProps.apis.adminDrives.isPending()) return
    if (nextProps.apis.driveListNavDir && nextProps.apis.driveListNavDir.isPending()) return
    let driveListNavDir = nextProps.apis.driveListNavDir?nextProps.apis.driveListNavDir.value():null
    this.updateState({
      driveListNavDir: driveListNavDir,
      adminDrives:nextProps.apis.adminDrives.value()
    })
  }

  navEnter() {
    this.setState({inRoot: true})
    this.ctx.props.apis.request('adminDrives')
  }

  navLeave() {
  }

  navGroup() {
    return 'file'
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

  renderTitle() {

  }

  listNavBySelect() {
    let selected = this.select.state.selected
    if (selected.length !== 1) return

    let entry = this.state.entries[selected[0]]
    if (entry.type !== 'folder' && entry.type !== 'public') return
    this.setState({inRoot: false})
    this.ctx.props.apis.request('driveListNavDir', {
      dirUUID: entry.uuid,
      rootUUID: this.state.path.length>1?this.state.path[1].uuid:entry.uuid
    })
  }

  showContextMenu(clientX, clientY) {
    if (this.select.state.ctrl || this.select.state.shift) return
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
      contextMenuY: -1,
    })
  }

  createNewFolder() {

  }

  download() {

  }

  delete() {

  }

  upload() {

  }


  /** renderers **/
  renderContent() {
    return (
      <div style={{position: 'relative', width: '100%', height: '100%'}}>
        {this.state.path.length>1 && <FileUploadButton upload={this.upload.bind(this)}/>}
        <FileContent 
          home={this.state} 
          select={this.state.select} 
          entries={this.state.entries}
          listNavBySelect={this.listNavBySelect.bind(this)}
          showContextMenu={this.showContextMenu.bind(this)}
        />

        <ContextMenu 
          open={this.state.contextMenuOpen}
          top={this.state.contextMenuY}
          left={this.state.contextMenuX}
          onRequestClose={() => this.hideContextMenu()}
        >
          <MenuItem primaryText='新建文件夹' onTouchTap={this.createNewFolder.bind(this)} /> 
          <MenuItem primaryText='下载' onTouchTap={this.download.bind(this)} /> 
          <MenuItem primaryText='刪除' onTouchTap={this.delete.bind(this)} /> 
        </ContextMenu> 
      </div>


    )
  }
}

export default Public

