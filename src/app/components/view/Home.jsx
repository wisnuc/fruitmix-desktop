import React from 'react'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import { IconButton, MenuItem } from 'material-ui'
import FileFolder from 'material-ui/svg-icons/file/folder'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'

import Base from './Base'
import FileDetail from '../file/FileDetail'
import ListSelect from '../file/ListSelect'
import MoveDialog from '../file/MoveDialog'
import FileContent from '../file/FileContent'
import RenameDialog from '../file/RenameDialog'
import NewFolderDialog from '../file/NewFolderDialog'
import FileUploadButton from '../file/FileUploadButton'
import ContextMenu from '../common/ContextMenu'
import DialogOverlay from '../common/DialogOverlay'
import FlatButton from '../common/FlatButton'
import { BreadCrumbItem, BreadCrumbSeparator } from '../common/BreadCrumb'
import { command } from '../../lib/command'

const debug = Debug('component:viewModel:Home: ')

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

      createNewFolder: false,
      rename: false,
      delete: false,
      move: false,
      copy: false,
      detailIndex: -1
    }

    this.onListNavBySelect = this.listNavBySelect.bind(this)
    this.onShowContextMenu = this.showContextMenu.bind(this)

    this.onRequestClose = (dirty) => {
      this.setState({ createNewFolder: null })
      if (dirty) {
        this.ctx.props.apis.request('listNavDir', {
          dirUUID: this.state.path[this.state.path.length - 1].uuid,
          rootUUID: this.state.path[0].uuid
        })
      }
    }

    this.toggleDialog = (type) => {
      this.setState({ [type]: !this.state[type] })
    }

    this.delete = () => {
      const entries = this.state.entries
      const selected = this.state.select.selected
      const count = selected.length
      let finishCount = 0
      const path = this.state.path
      const dirUUID = path[path.length - 1].uuid
      const loop = () => {
        const nodeUUID = entries[selected[finishCount]].uuid
        this.ctx.props.apis.request('deleteDirOrFile', { dirUUID, nodeUUID }, (err, data) => {
          // need to handle this err ? TODO
          if (err) console.log(err)
          finishCount += 1
          if (finishCount === count) {
            if (this.state.path[this.state.path.length - 1].uuid === dirUUID) {
              this.ctx.props.apis.request('listNavDir', { rootUUID: this.state.path[0].uuid, dirUUID }, (err, data) => {
                if (!err) {
                  this.ctx.openSnackBar('删除成功')
                } else {
                  this.ctx.openSnackBar(`删除失败: ${err.message}`)
                }
              })
            } else return null
          } else loop()
        })
      }
      loop()
      this.toggleDialog('delete')
    }

    this.updateDetail = (index) => {
      this.setState({ detailIndex: index })
    }

    ipcRenderer.on('driveListUpdate', (e, obj) => {
      console.log('in home')
      console.log(obj, this.state.path)
      if (obj.uuid == this.state.path[this.state.path.length - 1].uuid) {
        // this.ctx.openSnackBar(obj.message)
        this.refresh()
      }
    })

  }

  updateState(listNavDir) {
    if (listNavDir === this.state.listNavDir) return

    let { path, entries } = listNavDir

    entries = [...entries].sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1
      if (a.type === 'file' && b.type === 'folder') return 1
      return a.name.localeCompare(b.name)
    })

    const select = this.select.reset(entries.length)
    const state = { select, listNavDir, path, entries }

    this.setState(state)
  }

  willReceiveProps(nextProps) {
    if (!nextProps.apis || !nextProps.apis.listNavDir) return
    const listNavDir = nextProps.apis.listNavDir
    if (listNavDir.isPending() || listNavDir.isRejected()) return
    this.updateState(listNavDir.value())
  }

  navEnter() {
    if (!this.ctx.props.apis || !this.ctx.props.apis.listNavDir) return
    const listNavDir = this.ctx.props.apis.listNavDir
    if (listNavDir.isPending() || listNavDir.isRejected()) return
    this.updateState(listNavDir.value())
  }

  navLeave() {
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

  /** operations **/
  listNavBySelect() {
    const selected = this.select.state.selected
    if (selected.length !== 1) return

    const entry = this.state.entries[selected[0]]
    if (entry.type !== 'folder') return

    this.ctx.props.apis.request('listNavDir', {
      dirUUID: entry.uuid,
      rootUUID: this.state.path[0].uuid
    })
  }

  showContextMenu(clientX, clientY) {
    if (this.select.state.ctrl || this.select.state.shift) return
    const containerDom = document.getElementById('content-container')
    const maxLeft = containerDom.offsetLeft + containerDom.clientWidth - 240
    const x = clientX > maxLeft ? maxLeft : clientX
    const maxTop = containerDom.offsetTop + containerDom.offsetHeight - 336
    const y = clientY > maxTop ? maxTop : clientY
    this.setState({
      contextMenuOpen: true,
      contextMenuX: x,
      contextMenuY: y
    })
  }

  hideContextMenu() {
    this.setState({
      contextMenuOpen: false
      // contextMenuX: -1,
      // contextMenuY: -1,
    })
  }

  openCreateNewFolder() {
    this.setState({ createNewFolder: true })
  }

  closeCreateNewFolder(dirty) {
    this.setState({ createNewFolder: false })
    if (dirty) {
      this.ctx.props.apis.request('listNavDir', {
        dirUUID: this.state.path[this.state.path.length - 1].uuid,
        rootUUID: this.state.path[0].uuid
      })
    }
  }

  openRenameFolder() {
    this.setState({ rename: true })
  }

  closeRename() {
    this.setState({ rename: false })
    this.refresh()
  }

  openMove() {
    this.setState({ move: true })
  }

  closeMove() {
    this.setState({ move: false })
  }

  openCopy() {
    this.setState({ copy: true })
  }

  closeCopy() {
    this.setState({ copy: false })
  }

  openUploadDialog() {
    const dirPath = this.state.path
    const dirUUID = dirPath[dirPath.length - 1].uuid
    command('fileapp', 'UPLOAD', { dirUUID })
  }

  download() {
    const entries = this.state.entries
    const selected = this.state.select.selected
    const path = this.state.path
    const folders = []
    const files = []

    selected.forEach((item) => {
      const obj = entries[item]
      if (obj.type === 'folder') folders.push(obj)
      else if (obj.type === 'file') files.push(obj)
    })

    command('fileapp', 'DOWNLOAD', { folders, files, dirUUID: path[path.length - 1].uuid })
  }

  upload(type) {
    const dirPath = this.state.path
    const dirUUID = dirPath[dirPath.length - 1].uuid
    // console.log(dirUUID, type)
    command('fileapp', 'UPLOAD', { dirUUID, type })
  }

  refresh() {
    const rUUID = this.state.path[0].uuid
    const dUUID = this.state.path[this.state.path.length - 1].uuid
    this.ctx.props.apis.request('listNavDir', { rootUUID: rUUID, dirUUID: dUUID })
  }

  /* renderers */
  renderTitle({ style }) {
    if (!this.state.listNavDir) return

    const path = this.state.path

    /*
      each one is preceded with a separator, except for the first one
      each one is assigned an action, except for the last one
    */
    return (
      <div id="file-breadcrumbs" style={Object.assign({}, style, { marginLeft: '176px' })}>
        {
          this.state.listNavDir.path.reduce((acc, node, index, arr) => {
            if (path.length > 4 && index > 0 && index < path.length - 3) {
              if (index === 1) {
                acc.push(<BreadCrumbSeparator key={node.uuid + index} />)
                acc.push(<BreadCrumbItem text="..." key="..." />)
              }
              return acc
            }

            if (index !== 0) acc.push(<BreadCrumbSeparator key={node.uuid + index} />)

            /* the first one is always special */
            if (index === 0) {
              acc.push(
                <BreadCrumbItem
                  text="我的文件" key={node.uuid}
                  onTouchTap={() => this.ctx.props.apis.request('listNavDir', {
                    dirUUID: path[0].uuid,
                    rootUUID: path[0].uuid
                  })}
                />
              )
            } else {
              acc.push(<BreadCrumbItem
                text={node.name} key={node.uuid}
                onTouchTap={() => this.ctx.props.apis.request('listNavDir', {
                  dirUUID: node.uuid,
                  rootUUID: path[0].uuid
                })}
              />)
            }
            return acc
          }, [])
        }
      </div>
    )
  }

  renderToolBar({ style }) {
    return (
      <div style={style}>
        <IconButton onTouchTap={this.openCreateNewFolder.bind(this)}>
          <FileCreateNewFolder color="#FFF" />
        </IconButton>
      </div>
    )
  }

  renderDetail({ style }) {
    return (
      <div style={style}>
        {
          this.state.entries.length ?
            <FileDetail
              detailFile={this.state.entries[this.state.detailIndex]}
              path={this.state.path}
              ipcRenderer={ipcRenderer}
            /> :
            <div style={{ height: 128, backgroundColor: '#00796B' }} />
        }
      </div>
    )
  }

  renderContent({ toggleDetail, openSnackBar }) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>

        <FileUploadButton upload={this.upload.bind(this)} />

        <FileContent
          home={this.state}
          select={this.state.select}
          entries={this.state.entries}
          listNavBySelect={this.onListNavBySelect}
          showContextMenu={this.onShowContextMenu}
          updateDetail={this.updateDetail}
        />

        <ContextMenu
          open={this.state.contextMenuOpen}
          top={this.state.contextMenuY}
          left={this.state.contextMenuX}
          onRequestClose={() => this.hideContextMenu()}
        >
          <MenuItem primaryText="新建文件夹" onTouchTap={this.openCreateNewFolder.bind(this)} />
          <MenuItem primaryText="下载" onTouchTap={this.download.bind(this)} />
          <MenuItem primaryText="详细信息" onTouchTap={toggleDetail} />
          <MenuItem primaryText="刪除" onTouchTap={() => this.toggleDialog('delete')} />
          <MenuItem primaryText="重命名" onTouchTap={this.openRenameFolder.bind(this)} />
          <MenuItem primaryText="移动" onTouchTap={this.openMove.bind(this)} />
          <MenuItem primaryText="拷贝" onTouchTap={this.openCopy.bind(this)} />
        </ContextMenu>

        <DialogOverlay open={this.state.createNewFolder} onRequestClose={this.closeCreateNewFolder.bind(this)}>
          { this.state.createNewFolder &&
            <NewFolderDialog
              apis={this.ctx.props.apis}
              path={this.state.path}
              entries={this.state.entries}
              openSnackBar={openSnackBar}
            /> }
        </DialogOverlay>

        <DialogOverlay open={this.state.rename} onRequestClose={this.closeRename.bind(this)}>
          { this.state.rename &&
            <RenameDialog
              apis={this.ctx.props.apis}
              path={this.state.path}
              entries={this.state.entries}
              select={this.state.select}
            /> }
        </DialogOverlay>

        <DialogOverlay open={this.state.move} onRequestClose={this.closeMove.bind(this)}>
          { this.state.move && <MoveDialog
            apis={this.ctx.props.apis}
            path={this.state.path}
            entries={this.state.entries}
            select={this.state.select}
            type="home"
            operation="move"
          />}
        </DialogOverlay>

        <DialogOverlay open={this.state.copy} onRequestClose={this.closeCopy.bind(this)}>
          { this.state.copy && <MoveDialog
            apis={this.ctx.props.apis}
            path={this.state.path}
            entries={this.state.entries}
            select={this.state.select}
            type="home"
            operation="copy"
          />}
        </DialogOverlay>

        <DialogOverlay open={this.state.delete}>
          {
            this.state.delete &&
            <div style={{ width: 280, padding: '24px 24px 0px 24px' }}>
              <div style={{ color: 'rgba(0,0,0,0.54)' }}>{'确定删除？'}</div>
              <div style={{ height: 24 }} />
              <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                <FlatButton label="取消" primary onTouchTap={() => this.toggleDialog('delete')} />
                <FlatButton
                  label="确认"
                  primary
                  onTouchTap={this.delete}
                />
              </div>
            </div>

          }
        </DialogOverlay>

      </div>
    )
  }
}

export default Home
