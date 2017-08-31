import React from 'react'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import { IconButton, Divider } from 'material-ui'
import FileFolder from 'material-ui/svg-icons/file/folder'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import ListIcon from 'material-ui/svg-icons/action/list'
import GridIcon from 'material-ui/svg-icons/action/view-module'
import DownloadIcon from 'material-ui/svg-icons/file/file-download'
import InfoIcon from 'material-ui/svg-icons/action/info'
import DeleteIcon from 'material-ui/svg-icons/action/delete'
import CopyIcon from 'material-ui/svg-icons/content/content-copy'
import MoveIcon from 'material-ui/svg-icons/content/forward'
import ShareIcon from 'material-ui/svg-icons/social/person-add'
import EditIcon from 'material-ui/svg-icons/editor/border-color'

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
import MenuItem from '../common/MenuItem'
import sortByType from '../common/sort'
import { BreadCrumbItem, BreadCrumbSeparator } from '../common/BreadCrumb'
import { UploadFile, UploadFold } from '../common/Svg'

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
      share: false
    }

    /* handle update sortType */
    this.force = false
    this.changeSortType = (sortType) => {
      this.force = true
      this.setState({ sortType })
    }

    this.toggleDialog = (type) => {
      if (!window.navigator.onLine) return this.ctx.openSnackBar('网络连接已断开，请检查网络设置')
      this.setState({ [type]: !this.state[type] })
    }

    /* file or dir operations */
    this.upload = (type) => {
      if (!window.navigator.onLine) return this.ctx.openSnackBar('网络连接已断开，请检查网络设置')
      const dirPath = this.state.path
      const dirUUID = dirPath[dirPath.length - 1].uuid
      const driveUUID = dirPath[0].uuid
      console.log(dirPath, driveUUID, dirUUID, type)
      ipcRenderer.send('UPLOAD', { dirUUID, driveUUID, type })
    }

    this.download = () => {
      if (!window.navigator.onLine) return this.ctx.openSnackBar('网络连接已断开，请检查网络设置')
      const entries = this.state.entries
      const selected = this.state.select.selected
      const path = this.state.path
      const folders = []
      const files = []

      selected.forEach((item) => {
        const obj = entries[item]
        if (obj.type === 'directory') folders.push(obj)
        else if (obj.type === 'file') files.push(obj)
      })

      ipcRenderer.send('DOWNLOAD', { folders, files, dirUUID: path[path.length - 1].uuid, driveUUID: path[0].uuid })
    }

    this.dupFile = () => {
      if (!window.navigator.onLine) return this.ctx.openSnackBar('网络连接已断开，请检查网络设置')
      const entries = this.state.entries
      const selected = this.state.select.selected
      const path = this.state.path
      const curr = path[path.length - 1]
      const oldName = entries[selected[0]].name
      // const num = oldName.replace(/\([0-9]+\)/,'')
      const extension = oldName.replace(/^.*\./, '')
      let newName = oldName
      for (let i = 0; entries.findIndex(e => e.name === newName) > -1; i++) {
        const addText = i ? ` - 副本 (${i})` : ' - 副本'
        if (!extension || extension === oldName) {
          newName = `${oldName}${addText}`
        } else {
          const pureName = oldName.match(/^.*\./)[0]
          newName = `${pureName.slice(0, pureName.length - 1)}${addText}.${extension}`
        }
      }
      const args = {
        driveUUID: path[0].uuid,
        dirUUID: curr.uuid,
        entryUUID: entries[selected[0]].uuid,
        newName,
        oldName
      }
      this.ctx.props.apis.request('dupFile', args, (err, data) => {
        if (err) this.ctx.openSnackBar('制作副本失败')
        else {
          this.refresh()
          this.ctx.openSnackBar('制作成功')
        }
      })
    }

    this.deleteAsync = async () => {
      const entries = this.state.entries
      const selected = this.state.select.selected
      const path = this.state.path
      const dirUUID = path[path.length - 1].uuid
      const driveUUID = this.state.path[0].uuid

      const op = []
      for (let i = 0; i < selected.length; i++) {
        const entryName = entries[selected[i]].name
        const entryUUID = entries[selected[i]].uuid
        op.push({ driveUUID, dirUUID, entryName, entryUUID })
      }

      await this.ctx.props.apis.requestAsync('deleteDirOrFile', op)

      if (this.state.path[this.state.path.length - 1].uuid === dirUUID) {
        await this.ctx.props.apis.requestAsync('listNavDir', { driveUUID: this.state.path[0].uuid, dirUUID })
      }
    }

    this.delete = () => {
      if (!window.navigator.onLine) return this.ctx.openSnackBar('网络连接已断开，请检查网络设置')
      this.setState({ loading: true })
      this.deleteAsync().then(() => {
        this.setState({ loading: false, delete: false })
        this.ctx.openSnackBar('删除成功')
      }).catch((e) => {
        this.setState({ loading: false, delete: false })
        this.ctx.openSnackBar(`删除失败: ${e}`)
      })
    }

    /* actions */
    this.listNavBySelect = () => {
      if (!window.navigator.onLine) return this.ctx.openSnackBar('网络连接已断开，请检查网络设置')
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

    this.refresh = (op) => {
      const rUUID = this.state.path[0].uuid
      const dUUID = this.state.path[this.state.path.length - 1].uuid
      this.ctx.props.apis.request('listNavDir', { driveUUID: rUUID, dirUUID: dUUID })
      if (op && op.fileName) this.setState({ scrollTo: op.fileName })
    }

    this.showContextMenu = (clientX, clientY) => {
      if (this.select.state.ctrl || this.select.state.shift) return
      const containerDom = document.getElementById('content-container')
      const maxLeft = containerDom.offsetLeft + containerDom.clientWidth - 240
      const x = clientX > maxLeft ? maxLeft : clientX
      /* calc positon of menu using height of menu which is related to number of selected items */
      const length = this.select.state && this.select.state.selected && this.select.state.selected.length || 0
      const adjust = !length ? 128 : length > 1 ? 240 : 304
      const maxTop = containerDom.offsetTop + containerDom.offsetHeight - adjust
      const y = clientY > maxTop ? maxTop : clientY
      this.setState({
        contextMenuOpen: !this.state.inRoot, // not show menu in Public root
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
      if (!this.state.path || !this.state.path.length) return
      if (obj.uuid === this.state.path[this.state.path.length - 1].uuid) {
        // this.ctx.openSnackBar(obj.message)
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
    const preDriveUUID = apis.listNavDir && apis.listNavDir.data && apis.listNavDir.data.path[0].uuid
    if (homeDrive && preDriveUUID !== homeDrive.uuid) {
      this.ctx.props.apis.request('listNavDir', { driveUUID: homeDrive.uuid, dirUUID: homeDrive.uuid })
    }
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
          { this.state.gridView ? <ListIcon color="#FFF" /> : <GridIcon color="#FFF" /> }
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
              detailIndex={this.select.state.selected}
              entries={this.state.entries}
              path={this.state.path}
              ipcRenderer={ipcRenderer}
              primaryColor={this.groupPrimaryColor()}
            /> :
            <div style={{ height: 128, backgroundColor: this.groupPrimaryColor(), filter: 'brightness(0.9)' }} />
        }
      </div>
    )
  }

  renderDialogs(openSnackBar, navTo) {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <DialogOverlay open={!!this.state.createNewFolder} onRequestClose={() => this.toggleDialog('createNewFolder')}>
          { this.state.createNewFolder &&
            <NewFolderDialog
              apis={this.ctx.props.apis}
              path={this.state.path}
              entries={this.state.entries}
              openSnackBar={openSnackBar}
              refresh={this.refresh}
            /> }
        </DialogOverlay>

        <DialogOverlay open={!!this.state.rename} onRequestClose={() => this.toggleDialog('rename')}>
          { this.state.rename &&
            <RenameDialog
              apis={this.ctx.props.apis}
              path={this.state.path}
              entries={this.state.entries}
              select={this.state.select}
              openSnackBar={openSnackBar}
              refresh={this.refresh}
            /> }
        </DialogOverlay>

        <DialogOverlay open={!!this.state.move} onRequestClose={() => this.toggleDialog('move')}>
          { this.state.move && <MoveDialog
            apis={this.ctx.props.apis}
            path={this.state.path}
            entries={this.state.entries}
            select={this.state.select}
            openSnackBar={openSnackBar}
            primaryColor={this.groupPrimaryColor()}
            refresh={this.refresh}
            navTo={navTo}
            type="move"
            operation="move"
          /> }
        </DialogOverlay>

        <DialogOverlay open={!!this.state.copy} onRequestClose={() => this.toggleDialog('copy')}>
          { this.state.copy && <MoveDialog
            apis={this.ctx.props.apis}
            path={this.state.path}
            entries={this.state.entries}
            select={this.state.select}
            openSnackBar={openSnackBar}
            primaryColor={this.groupPrimaryColor()}
            refresh={this.refresh}
            navTo={navTo}
            type="copy"
            operation="copy"
          /> }
        </DialogOverlay>

        <DialogOverlay open={!!this.state.share} onRequestClose={() => this.toggleDialog('share')}>
          { this.state.share && <MoveDialog
            apis={this.ctx.props.apis}
            path={this.state.path}
            entries={this.state.entries}
            select={this.state.select}
            openSnackBar={openSnackBar}
            primaryColor={this.groupPrimaryColor()}
            refresh={this.refresh}
            navTo={navTo}
            type="share"
            operation="copy"
          /> }
        </DialogOverlay>

        <DialogOverlay open={!!this.state.delete}>
          {
            this.state.delete &&
            <div style={{ width: 280, padding: '24px 24px 0px 24px' }}>
              <div style={{ color: 'rgba(0,0,0,0.54)' }}>{'确定删除？'}</div>
              <div style={{ height: 24 }} />
              <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                <FlatButton label="取消" primary disabled={this.state.loading} onTouchTap={() => this.toggleDialog('delete')} />
                <FlatButton
                  label="确认"
                  disabled={this.state.loading}
                  primary
                  onTouchTap={this.delete}
                />
              </div>
            </div>
          }
        </DialogOverlay>
        {/* used in Public drives */}
        <DialogOverlay open={!!this.state.noAccess}>
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
        </DialogOverlay>
      </div>
    )
  }

  renderMenu(open, toggleDetail, getDetailStatus) {
    // debug('renderMenu', open, this.state.contextMenuY, this.state.contextMenuX)
    return (
      <ContextMenu
        open={open}
        top={this.state.contextMenuY}
        left={this.state.contextMenuX}
        onRequestClose={this.hideContextMenu}
      >
        {
            this.state.select && this.state.select.selected && !this.state.select.selected.length ?
              <div>
                <MenuItem
                  primaryText="新建文件夹"
                  leftIcon={<FileCreateNewFolder style={{ height: 20, width: 20, marginTop: 6 }} />}
                  onTouchTap={() => this.toggleDialog('createNewFolder')}
                />
                <div style={{ height: 8 }} />
                <Divider />
                <div style={{ height: 8 }} />

                <MenuItem
                  primaryText="上传文件夹"
                  leftIcon={<UploadFold style={{ height: 20, width: 20, marginTop: 6 }} />}
                  onTouchTap={() => this.upload('folder')}
                />
                <MenuItem
                  primaryText="上传文件"
                  leftIcon={<UploadFile style={{ height: 20, width: 20, marginTop: 6 }} />}
                  onTouchTap={() => this.upload('file')}
                />
              </div>
              :
              <div>
                <MenuItem
                  leftIcon={<ShareIcon style={{ height: 20, width: 20, marginTop: 6 }} />}
                  primaryText="分享至共享盘" onTouchTap={() => this.toggleDialog('share')}
                />
                <MenuItem
                  leftIcon={<CopyIcon style={{ height: 20, width: 20, marginTop: 6 }} />}
                  primaryText="拷贝至..." onTouchTap={() => this.toggleDialog('copy')}
                />
                <MenuItem
                  leftIcon={<MoveIcon style={{ height: 20, width: 20, marginTop: 6 }} />}
                  primaryText="移动至..." onTouchTap={() => this.toggleDialog('move')}
                />
                {
                  this.state.select && this.state.select.selected && this.state.select.selected.length === 1 &&
                    <MenuItem
                      leftIcon={<EditIcon style={{ height: 20, width: 20, marginTop: 6 }} />}
                      primaryText="重命名" onTouchTap={() => this.toggleDialog('rename')}
                    />
                }
                <div style={{ height: 8 }} />
                <Divider />
                <div style={{ height: 8 }} />
                <MenuItem
                  leftIcon={<InfoIcon style={{ height: 20, width: 20, marginTop: 6 }} />}
                  primaryText={getDetailStatus() ? '关闭详情' : '详细信息'}
                  onTouchTap={toggleDetail}
                />
                {
                  this.state.select && this.state.select.selected && this.state.select.selected.length === 1 &&
                    <MenuItem
                      leftIcon={<CopyIcon style={{ height: 20, width: 20, marginTop: 6 }} />}
                      primaryText="制作一个副本" onTouchTap={this.dupFile}
                    />
                }
                <MenuItem
                  leftIcon={<DownloadIcon style={{ height: 20, width: 20, marginTop: 6 }} />}
                  primaryText="下载至本地" onTouchTap={this.download}
                />
                <div style={{ height: 8 }} />
                <Divider />
                <div style={{ height: 8 }} />
                <MenuItem
                  leftIcon={<DeleteIcon style={{ height: 20, width: 20, marginTop: 6 }} />}
                  primaryText="刪除" onTouchTap={() => this.toggleDialog('delete')}
                />
              </div>
          }
      </ContextMenu>
    )
  }

  renderContent({ toggleDetail, openSnackBar, navTo, getDetailStatus }) {
    // debug('renderContent', this.state, this.select.state)
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>

        <FileUploadButton upload={this.upload} />

        <FileContent
          home={this.state}
          select={this.state.select}
          entries={this.state.entries}
          listNavBySelect={this.listNavBySelect}
          showContextMenu={this.showContextMenu}
          setAnimation={this.setAnimation}
          ipcRenderer={ipcRenderer}
          download={this.download}
          primaryColor={this.groupPrimaryColor()}
          sortType={this.state.sortType}
          changeSortType={this.changeSortType}
          gridView={this.state.gridView}
          scrollTo={this.state.scrollTo}
        />

        { this.renderMenu(this.state.contextMenuOpen, toggleDetail, getDetailStatus) }

        { this.renderDialogs(openSnackBar, navTo) }

      </div>
    )
  }
}

export default Home
