import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import { Paper, Divider, IconButton, Menu, MenuItem, FloatingActionButton } from 'material-ui'
import { orange700, blue700, indigo700, indigo500, teal500 } from 'material-ui/styles/colors'
import FileFolder from 'material-ui/svg-icons/file/folder'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'
import CloudUpload from 'material-ui/svg-icons/file/cloud-upload'

import ContextMenu from '../common/ContextMenu'
import DialogOverlay from '../common/DialogOverlay'

import NewFolderDialog from '../file/NewFolderDialog'
import FileUploadButton from '../file/FileUploadButton'
import RenameDialog from '../file/RenameDialog'
// import DeleteDialog from '../file/DeleteDialog'

import ListSelect from '../file/ListSelect2'
import Base from './Base'

import FileContent from '../file/FileContent'
import { command } from '../../lib/command'

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

class BreadCrumbSeparator extends React.PureComponent {

  render() {
    return (
      <div style={{height:32, width:8, display:'flex', flexDirection:'column', alignItems:'center'}}>
        &rsaquo;
      </div>
    )
  }
}

class Home extends Base {

  constructor(ctx) {

    super(ctx)
    this.select = new ListSelect(this)
    this.select.on('updated', next => this.setState({ select: next }))
    this.state = { 

      select: this.select.state,
      listNavDir: null, // save a reference
      path: [],         // 
      entries: [],      // sorted

      contextMenuOpen: false,
      contextMenuY: -1,
      contextMenuX: -1,

      createNewFolder: null,
      rename: null
    } 

    this.onListNavBySelect = this.listNavBySelect.bind(this)
    this.onShowContextMenu = this.showContextMenu.bind(this)

    this.onRequestClose = dirty => {
      this.setState({ createNewFolder: null })
      if (dirty) 
        this.ctx.props.apis.request('listNavDir', {
          dirUUID: this.state.path[this.state.path.length - 1].uuid,
          rootUUID: this.state.path[0].uuid,
        })
    }
  }

  updateState(listNavDir) {

    if (listNavDir === this.state.listNavDir) return

    let { path, entries } = listNavDir

    entries = [...entries].sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1
      if (a.type === 'file' && b.type === 'folder') return 1
      return a.name.localeCompare(b.name)
    })
 
    let select = this.select.reset(entries.length) 
    let state = { select, listNavDir, path, entries }
    
    this.setState(state)
  }

  willReceiveProps(nextProps) { 

    if (!nextProps.apis || !nextProps.apis.listNavDir) return
    let listNavDir = nextProps.apis.listNavDir
    if (listNavDir.isPending() || listNavDir.isRejected()) return
    this.updateState(listNavDir.value())
  }

  navEnter() {

    if (!this.ctx.props.apis || !this.ctx.props.apis.listNavDir) return
    let listNavDir = this.ctx.props.apis.listNavDir
    if (listNavDir.isPending() || listNavDir.isRejected()) return
    this.updateState(listNavDir.value())
  }

  navLeave() {
    console.log('home leave')
  }

  navGroup() {
    return 'file'
  }

  menuName() {
    return '我的文件'
  }

  menuIcon() {
    return FileFolder
  }

  quickName() {
    return '我的文件'
  }

  quickIcon() {
    return FileFolder 
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

  /** operations **/

  listNavBySelect() {

    let selected = this.select.state.selected
    if (selected.length !== 1) return

    let entry = this.state.entries[selected[0]]
    if (entry.type !== 'folder') return

    this.ctx.props.apis.request('listNavDir', {
      dirUUID: entry.uuid,
      rootUUID: this.state.path[0].uuid
    })
  }

  createNewFolder() {
    this.setState({ createNewFolder: true }) 
  }

  download() {
    let entries = this.state.entries
    let selected = this.state.select.selected
    let p = this.state.path
    let folders = []
    let files = []

    selected.forEach(item => {
      let obj = entries[item]
      if (obj.type == 'folder') folders.push(obj)
      else if (obj.type == 'file') files.push(obj)
    })

    command('fileapp', 'DOWNLOAD', { folders, files, dirUUID: p[p.length - 1].uuid})
    
  }

  delete() {
    console.log(this)
    let entries = this.state.entries
    let selected = this.state.select.selected
    let count = selected.length
    let finishCount = 0

    let p = this.state.path
    let dirUUID = p[p.length - 1].uuid

    let loop = () => {
      let nodeUUID = entries[selected[finishCount]].uuid
      this.ctx.props.apis.request('deleteDirOrFile', {dirUUID, nodeUUID}, (err, data) => {
        console.log(entries[selected[finishCount]].name + ' finish')
        if (err) console.log(err)
        finishCount++
        console.log(finishCount, ' vs ', count, this.state.path[this.state.path.length - 1].uuid === dirUUID)
        if (finishCount === count) {
          if (this.state.path[this.state.path.length - 1].uuid === dirUUID) {
            this.ctx.props.apis.request('listNavDir', {rootUUID: this.state.path[0].uuid, dirUUID})  
          }else return
          
        }else loop()
      })
    }

    loop()
  }

  upload(type) {
    let dirPath = this.state.path
    let dirUUID = dirPath[dirPath.length - 1].uuid
    console.log(dirUUID, type)
    command('fileapp', 'UPLOAD', {dirUUID, type})
  }

  openUploadDialog() {
    let dirPath = this.state.path
    let dirUUID = dirPath[dirPath.length - 1].uuid
    command('fileapp', 'UPLOAD', { dirUUID })
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

  renameFolder() {
    this.setState({rename: true})
  }

  closeRename() {
    this.setState({rename: false})
  }

  /** renderers **/

  // breadcrumb
  renderTitle({style}) {

    if (!this.state.listNavDir) return

    const path = this.state.path

    // each one is preceded with a separator, except for the first one
    // each one is assigned an action, except for the last one
    return (
      <div id='file-breadcrumbs' style={Object.assign({}, style, {marginLeft:'176px'})}>
        { this.state.listNavDir.path.reduce((acc, node, index, arr) => {

          if (path.length > 4 && index > 0 && index < path.length - 3) {
            if (index === 1) {
              acc.push(<BreadCrumbSeparator key={node.uuid + index}/>)
              acc.push(<BreadCrumbItem text='...' key='...'/>)
            }
            return acc
          }

          if (index !== 0) acc.push(<BreadCrumbSeparator key={node.uuid + index}/>)

          if (index === 0) { // the first one is always special
            acc.push(
              <BreadCrumbItem text='我的文件' key={node.uuid}
                onTouchTap={() => this.ctx.props.apis.request('listNavDir', {
                  dirUUID: path[0].uuid,
                  rootUUID: path[0].uuid,
                })}
              />
            )
          }
          // else if (index === arr.length - 1) {
          //   acc.push(<BreadCrumbItem text={node.name} />)
          // } 
          else {
            acc.push(<BreadCrumbItem text={node.name} key={node.uuid}
              onTouchTap={() => this.ctx.props.apis.request('listNavDir', {
                dirUUID: node.uuid,
                rootUUID:path[0].uuid
              })}
            />)
          }
          return acc
        }, [])}
      </div>
    )
  }

  renderToolBar({style}) {

    return (
      <div style={style}>
        <IconButton onTouchTap={this.createNewFolder.bind(this)}>
          <FileCreateNewFolder color='#FFF' />
        </IconButton>
      </div>
    )
  }

  renderDetail({style}) {
  }

  renderContent() {
    return (
      <div style={{position: 'relative', width: '100%', height: '100%'}}>

        <FileUploadButton upload={this.upload.bind(this)}/>

        <FileContent 
          home={this.state} 
          select={this.state.select} 
          entries={this.state.entries} 
          listNavBySelect={this.onListNavBySelect}
          showContextMenu={this.onShowContextMenu}
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
          <MenuItem primaryText='重命名'onTouchTap={this.renameFolder.bind(this)} />
        </ContextMenu> 

        <DialogOverlay open={!!this.state.createNewFolder} onRequestClose={this.onRequestClose}>
          { this.state.createNewFolder && 
            <NewFolderDialog 
              apis={this.ctx.props.apis} 
              path={this.state.path} 
              entries={this.state.entries}
            /> }
        </DialogOverlay>

        <DialogOverlay open={!!this.state.rename} onRequestClose={this.closeRename.bind(this)}>
          { this.state.rename && 
            <RenameDialog 
              apis={this.ctx.props.apis} 
              path={this.state.path} 
              entries={this.state.entries}
              select={this.state.select}
            /> }
        </DialogOverlay>

      </div>
    )
  }
}

export default Home

/**
          { this.state.rename && 
            <RenameDialog
              apis={this.ctx.props.apis}
              path={this.state.path}
              entries={this.state.entries}
              target={...}
            /> } 
          { this.state.delete &&
            <DeleteDialog
              apis={this.ctx.props.apis}
              path={this.state.path}
              entries={this.state.entries}
              select={...}
            /> }
**/


