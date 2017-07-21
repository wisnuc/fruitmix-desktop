import React from 'react'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import { IconButton, MenuItem } from 'material-ui'
import FileFolder from 'material-ui/svg-icons/file/folder'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import ListIcon from 'material-ui/svg-icons/action/list'
import GridIcon from 'material-ui/svg-icons/action/view-module'

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
import sortByType from '../common/sort'
import { BreadCrumbItem, BreadCrumbSeparator } from '../common/BreadCrumb'

const debug = Debug('component:viewModel:Home: ')

class Home extends Base {
  constructor(ctx) {
    super(ctx)

    /* handle select TODO */
    this.select = new ListSelect(this)
    this.select.on('updated', next => this.setState({ select: next }))

    this.state = {
      gridView: false, // false: list, true: grid
      sortType: '', // nameUp, nameDown, timeUp, timeDown, sizeUp, sizeDown
      select: this.select.state,
      listNavDir: null, // save a reference
      path: [],
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

    /* handle update sortType */
    this.force = false
    this.changeSortType = (sortType) => {
      this.force = true
      this.setState({ sortType })
    }

    this.toggleDialog = (type) => {
      this.setState({ [type]: !this.state[type] })
    }

    /* file or dir operations */
    this.upload = (type) => {
      const dirPath = this.state.path
      const dirUUID = dirPath[dirPath.length - 1].uuid
      const driveUUID = dirPath[0].uuid
      // console.log(dirUUID, type)
      ipcRenderer.send('UPLOAD', { dirUUID, driveUUID, type })
    }

    this.download = () => {
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

      ipcRenderer.send('DOWNLOAD', { folders, files, dirUUID: path[path.length - 1].uuid })
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
              this.ctx.props.apis.request('listNavDir', { driveUUID: this.state.path[0].uuid, dirUUID }, (err, data) => {
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

    this.openByLocal = () => {
      const entries = this.state.entries
      const selected = this.state.select.selected[0]
      const path = this.state.path
      const entry = entries[selected]
      ipcRenderer.send('OPEN_FILE', { file: entry, path: path[path.length - 1].uuid })
    }

    /* actions */
    this.listNavBySelect = () => {
      // debug('listNavBySelect', this.select, this.state)
      const selected = this.select.state.selected
      if (selected.length !== 1) return

      const entry = this.state.entries[selected[0]]
      if (entry.type === 'directory') {
        this.ctx.props.apis.request('listNavDir', {
          driveUUID: this.state.path[0].uuid,
          dirUUID: entry.uuid
        })
      }
    }

    this.refresh = () => {
      const rUUID = this.state.path[0].uuid
      const dUUID = this.state.path[this.state.path.length - 1].uuid
      this.ctx.props.apis.request('listNavDir', { driveUUID: rUUID, dirUUID: dUUID })
    }

    this.updateDetail = (index) => {
      this.setState({ detailIndex: index })
    }

    this.showContextMenu = (clientX, clientY) => {
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

    this.hideContextMenu = () => {
      this.setState({
        contextMenuOpen: false
        // contextMenuX: -1,
        // contextMenuY: -1,
      })
    }

    /* NavigationMenu animation */
    this.setAnimation = (component, status) => {
      if (component === 'NavigationMenu') {
        /* add animation to NavigationMenu */
        const transformItem = this.refNavigationMenu
        const time = 0.4
        const ease = global.Power4.easeOut
        if (status === 'In') {
          TweenMax.to(transformItem, time, { rotation: 180, opacity: 1, ease })
        }
        if (status === 'Out') {
          TweenMax.to(transformItem, time, { rotation: -180, opacity: 0, ease })
        }
      }
    }

    ipcRenderer.on('driveListUpdate', (e, obj) => {
      console.log(obj, this.state.path)
      if (!this.state.path.length) return
      if (obj.uuid === this.state.path[this.state.path.length - 1].uuid) {
        this.ctx.openSnackBar(obj.message)
        this.refresh()
      }
    })
  }

  updateState(listNavDir) {
    if (listNavDir === this.state.listNavDir && !this.force) return

    let { path, entries } = listNavDir

    /* sort enries */
    entries = [...entries].sort((a, b) => sortByType(a, b, this.state.sortType))

    const select = this.select.reset(entries.length)
    const state = { select, listNavDir, path, entries }

    this.force = false
    this.setState(state)
  }

  willReceiveProps(nextProps) {
    // console.log('home', nextProps)
    if (!nextProps.apis || !nextProps.apis.listNavDir) return
    const listNavDir = nextProps.apis.listNavDir
    if (listNavDir.isPending() || listNavDir.isRejected()) return
    this.updateState(listNavDir.value())
  }

  navEnter() {
    const apis = this.ctx.props.apis
    if (!apis || !apis.drives || !apis.drives.data) return
    const homeDrive = apis.drives.data.find(drive => drive.tag === 'home')
    if (homeDrive) this.ctx.props.apis.request('listNavDir', { driveUUID: homeDrive.uuid, dirUUID: homeDrive.uuid })
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

  /* renderers */
  renderNavigationMenu({ style, onTouchTap }) {
    const CustomStyle = Object.assign(style, { opacity: 1 })
    return (
      <div style={CustomStyle} ref={ref => (this.refNavigationMenu = ref)}>
        <IconButton onTouchTap={onTouchTap}>
          <NavigationMenu color="#FFFFFF" />
        </IconButton>
      </div>
    )
  }

  renderTitle({ style }) {
    if (!this.state.listNavDir) return (<div />)

    const path = this.state.path

    /*
      each one is preceded with a separator, except for the first one
      each one is assigned an action, except for the last one
    */

    const touchTap = node => this.ctx.props.apis.request('listNavDir', { driveUUID: path[0].uuid, dirUUID: node.uuid })

    return (
      <div style={Object.assign({}, style, { marginLeft: 168 })}>
        {
          this.state.listNavDir.path.reduce((acc, node, index) => {
            if (path.length > 4 && index > 0 && index < path.length - 3) {
              if (index === path.length - 4) {
                acc.push(<BreadCrumbSeparator key={`Separator${node.uuid}`} />)
                acc.push(<BreadCrumbItem text="..." key="..." onTouchTap={() => touchTap(node)} />)
              }
              return acc
            }

            if (index !== 0) acc.push(<BreadCrumbSeparator key={`Separator${node.uuid}`} />)

            /* the first one is always special */
            if (index === 0) {
              acc.push(<BreadCrumbItem text="我的文件" key="root" onTouchTap={() => touchTap(path[0])} />)
            } else {
              acc.push(<BreadCrumbItem text={node.name} key={`Item${node.uuid}`} onTouchTap={() => touchTap(node)} />)
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
        <IconButton onTouchTap={() => this.toggleDialog('gridView')} tooltip={this.state.gridView ? '列表视图' : '网格视图'}>
          { this.state.gridView ? <GridIcon color="#FFF" /> : <ListIcon color="#FFF" /> }
        </IconButton>
        <IconButton onTouchTap={() => this.toggleDialog('createNewFolder')} tooltip="新建文件夹">
          <FileCreateNewFolder color="#FFF" />
        </IconButton>
      </div>
    )
  }

  renderDetail({ style }) {
    if (!this.state.entries) return (<div />)
    return (
      <div style={style}>
        {
          this.state.entries.length ?
            <FileDetail
              detailFile={this.state.entries[this.state.detailIndex]}
              path={this.state.path}
              ipcRenderer={ipcRenderer}
              primaryColor={this.groupPrimaryColor()}
            /> :
            <div style={{ height: 128, backgroundColor: this.groupPrimaryColor(), filter: 'brightness(0.9)' }} />
        }
      </div>
    )
  }

  renderDialogs(openSnackBar) {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <DialogOverlay open={this.state.createNewFolder} onRequestClose={() => this.toggleDialog('createNewFolder')}>
          { this.state.createNewFolder &&
            <NewFolderDialog
              apis={this.ctx.props.apis}
              path={this.state.path}
              entries={this.state.entries}
              openSnackBar={openSnackBar}
              refresh={this.refresh}
            /> }
        </DialogOverlay>

        <DialogOverlay open={this.state.rename} onRequestClose={() => this.toggleDialog('rename')}>
          { this.state.rename &&
            <RenameDialog
              apis={this.ctx.props.apis}
              path={this.state.path}
              entries={this.state.entries}
              select={this.state.select}
              openSnackBar={openSnackBar}
            /> }
        </DialogOverlay>

        <DialogOverlay open={this.state.move} onRequestClose={() => this.toggleDialog('move')}>
          { this.state.move && <MoveDialog
            apis={this.ctx.props.apis}
            path={this.state.path}
            entries={this.state.entries}
            select={this.state.select}
            openSnackBar={openSnackBar}
            type="home"
            operation="move"
          /> }
        </DialogOverlay>

        <DialogOverlay open={this.state.copy} onRequestClose={() => this.toggleDialog('copy')}>
          { this.state.copy && <MoveDialog
            apis={this.ctx.props.apis}
            path={this.state.path}
            entries={this.state.entries}
            select={this.state.select}
            openSnackBar={openSnackBar}
            type="home"
            operation="copy"
          /> }
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
        {/* used in Public drives */}
        <DialogOverlay open={this.state.noAccess}>
          {
            this.state.noAccess &&
            <div style={{ width: 280, padding: '24px 24px 0px 24px' }}>
              <div style={{ color: 'rgba(0,0,0,0.54)' }}>{'对不起，您没有访问权限！'}</div>
              <div style={{ height: 24 }} />
              <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                <FlatButton label="确定" primary onTouchTap={() => this.toggleDialog('noAccess')} />
              </div>
            </div>
          }
        </DialogOverlay>)
      </div>
    )
  }

  renderContent({ toggleDetail, openSnackBar }) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>

        <FileUploadButton upload={this.upload} />

        <FileContent
          home={this.state}
          select={this.state.select}
          entries={this.state.entries}
          listNavBySelect={this.listNavBySelect}
          showContextMenu={this.showContextMenu}
          updateDetail={this.updateDetail}
          setAnimation={this.setAnimation}
          ipcRenderer={ipcRenderer}
          download={this.download}
          openByLocal={this.openByLocal}
          primaryColor={this.groupPrimaryColor()}
          sortType={this.state.sortType}
          changeSortType={this.changeSortType}
          gridView={this.state.gridView}
        />

        <ContextMenu
          open={this.state.contextMenuOpen}
          top={this.state.contextMenuY}
          left={this.state.contextMenuX}
          onRequestClose={this.hideContextMenu}
        >
          <MenuItem primaryText="新建文件夹" onTouchTap={() => this.toggleDialog('createNewFolder')} />
          <MenuItem primaryText="下载" onTouchTap={this.download} />
          <MenuItem primaryText="详细信息" onTouchTap={toggleDetail} />
          <MenuItem primaryText="刪除" onTouchTap={() => this.toggleDialog('delete')} />
          <MenuItem primaryText="重命名" onTouchTap={() => this.toggleDialog('rename')} />
          <MenuItem primaryText="移动" onTouchTap={() => this.toggleDialog('move')} />
          <MenuItem primaryText="拷贝" onTouchTap={() => this.toggleDialog('copy')} />
        </ContextMenu>

        { this.renderDialogs(openSnackBar) }

      </div>
    )
  }
}

export default Home
