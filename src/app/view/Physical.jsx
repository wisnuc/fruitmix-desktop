import React from 'react'
import Radium from 'radium'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import { Avatar, Divider, MenuItem } from 'material-ui'
import HardwareDeveloperBoard from 'material-ui/svg-icons/hardware/developer-board'
import FileFolder from 'material-ui/svg-icons/file/folder'

import Base from './Base'
import FileContent from '../file/FileContent'
import ListSelect from '../file/ListSelect'
import MoveDialog from '../file/MoveDialog'
import FileDetail from '../file/FileDetail'
import { BreadCrumbItem, BreadCrumbSeparator } from '../common/BreadCrumb'
import ContextMenu from '../common/ContextMenu'
import DialogOverlay from '../common/DialogOverlay'
import { HDDIcon } from '../maintenance/Svg'

const debug = Debug('component:view:Physical:')

class DriveHeader extends React.PureComponent {
  render() {
    return (
      <div style={{ height: 40, display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: '0 0 104px' }} />
        <div style={{ flex: '0 0 240px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)' }}>
          类型
        </div>
        <div style={{ flex: '0 0 240px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)' }}>
          位置
        </div>
        <div style={{ flex: '0 0 320px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)' }}>
          UUID
        </div>
        <div style={{ flexGrow: 1 }} />
      </div>
    )
  }
}

@Radium
class FileSystemRow extends React.PureComponent {
  render() {
    /* ignore btrfs disk */
    if (this.props.fileSystem.uuid) return <div />

    const fileSystem = this.props.fileSystem
    return (
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          ':hover': { backgroundColor: '#F5F5F5' }
        }}
        onDoubleClick={this.props.enter}
      >
        <div style={{ flex: '0 0 56px' }} />
        <div style={{ flex: '0 0 48px', display: 'flex', alignItems: 'center' }}>
          <Avatar style={{ backgroundColor: 'white' }}>
            <HDDIcon color="rgba(0,0,0,0.54)" />
          </Avatar>
        </div>
        <div style={{ flex: '0 0 240px', fontSize: 16, color: 'rgba(0,0,0,0.87)' }}>
          { fileSystem.fileSystemType }
        </div>
        <div style={{ flex: '0 0 240px', fontSize: 16, color: 'rgba(0,0,0,0.87)' }}>
          { fileSystem.mountpoint }
        </div>
        <div style={{ flex: '0 0 320px', fontSize: 16, color: 'rgba(0,0,0,0.87)' }}>
          { fileSystem.fileSystemUUID}
        </div>
        <div style={{ flexGrow: 1 }} />
      </div>
    )
  }
}

class Physical extends Base {
  constructor(ctx) {
    super(ctx)
    this.path = [{ name: '物理磁盘', type: 'physical', uuid: '物理磁盘' }]
    this.select = new ListSelect(this)
    this.select.on('updated', next => this.setState({ select: next }))
    this.state = {
      extDrives: null,
      extListDir: null,
      path: [],
      entries: [],
      inRoot: true,
      contextMenuOpen: false,
      contextMenuY: -1,
      contextMenuX: -1,
      move: false,
      copy: false,
      detailIndex: -1
    }


    ipcRenderer.on('physicalListUpdate', (e, obj) => {
      if (this.state.path.length < 2) return
      if (obj.rootPath !== this.state.path[1].fileSystemUUID) return
      let string = ''
      this.state.path.forEach((item, index) => {
        if (index > 1) string += (`/${item.name}`)
      })
      const position = obj.path.lastIndexOf('/')
      const dirPath = obj.path.substring(0, position)
      if (string === dirPath) {
        // this.ctx.openSnackBar(obj.message)
        this.refresh()
      }
    })
  }

  updateState(data) {
    const { extDrives, extListDir } = data
    if (extDrives === this.state.extDrives && data.extListDir === this.state.extListDir) return
    if (this.state.inRoot) {
      const path = this.path
      const entries = extDrives
      const select = this.select.reset(entries.length)
      this.setState({ select, path, entries, extDrives, extListDir })
    } else {
      const entries = extListDir
      const select = this.select.reset(entries.length)
      const path = this.path
      this.setState({ select, entries, extDrives, extListDir, path })
    }
  }

  willReceiveProps(nextProps) {
    const apis = nextProps.apis
    if (!apis || !apis.extDrives) return
    if (apis.extDrives.isPending()) return
    if (apis.extListDir && apis.extListDir.isPending()) return
    const extListDir = nextProps.apis.extListDir && !apis.extListDir.isRejected() ? nextProps.apis.extListDir.value() : null
    const extDrives = apis.extDrives.value()
    extDrives.forEach(item => item.type = 'folder')
    this.updateState({
      extListDir,
      extDrives
    })
  }

  navEnter() {
    const apis = this.ctx.props.apis
    this.path = [{ name: '物理磁盘', type: 'physical', uuid: '物理磁盘' }]
    this.setState({ inRoot: true, entries: [], detailIndex: -1 })
    apis.request('extDrives')
  }

  navLeave() {
  }

  navGroup() {
    return 'physical'
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

  /** renderers **/

  renderTitle({ style }) {
    if (!this.state.extDrives && !this.state.extListDir) return null
    const path = this.state.path
    return (
      <div id="file-breadcrumbs" style={Object.assign({}, style, { marginLeft: '176px' })}>
        {path.reduce((acc, node, index) => {
          if (path.length > 4 && index > 0 && index < path.length - 3) {
            if (index === 1) {
              acc.push(<BreadCrumbSeparator key={`Separator${index.toString()}`} />)
              acc.push(<BreadCrumbItem text="..." key="..." />)
            }
            return acc
          }

          if (index !== 0) acc.push(<BreadCrumbSeparator key={`Separator${index.toString()}`} />)

          if (index === 0) { // the first one is always special
            acc.push(<BreadCrumbItem text="物理磁盘" key="物理磁盘" onTouchTap={this.navEnter.bind(this)} />)
          } else if (index === 1) {
            acc.push(
              <BreadCrumbItem
                text={node.name}
                key={`${node.name}index`} onTouchTap={this.listByBread.bind(this, index)}
              />)
          } else acc.push(<BreadCrumbItem text={node.name} key={`${node.name}index`} onTouchTap={this.listByBread.bind(this, index)} />)
          return acc
        }, [])}
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
              primaryColor={this.groupPrimaryColor()}
            /> :
            <div style={{ height: 128, backgroundColor: '#558B2F' }} />
        }
      </div>
    )
  }

  renderContent() {
    const apis = this.ctx.props.apis
    // debug('renderContent', this.state)
    if (!this.state.entries) return <div />
    return (
      <div style={{ width: '100%', height: '100%' }}>
        {/* root directory */}
        {
          this.state.path.length === 1 &&
          <div>
            <DriveHeader />
            <div style={{ height: 8 }} />
            {
              this.state.entries.map(fsys => (
                <div key={fsys.mountpoint}>
                  <FileSystemRow fileSystem={fsys} enter={this.enter.bind(this, fsys)} />
                </div>
              ))
            }
          </div>
        }

        {/* second or deeper directory */}
        {
          this.state.path.length > 1 &&
            <FileContent
              home={this.state}
              select={this.state.select}
              entries={this.state.entries}
              listNavBySelect={this.enter.bind(this)}
              showContextMenu={this.showContextMenu.bind(this)}
            />
        }

        <ContextMenu
          open={this.state.contextMenuOpen}
          top={this.state.contextMenuY}
          left={this.state.contextMenuX}
          onRequestClose={() => this.hideContextMenu()}
        >
          <MenuItem primaryText="移动" disabled={!(this.state.path.length > 1)} onTouchTap={this.openMove.bind(this)} />
          <MenuItem primaryText="拷贝" disabled={!(this.state.path.length > 1)} onTouchTap={this.openCopy.bind(this)} />
        </ContextMenu>

        <DialogOverlay open={this.state.move} onRequestClose={this.closeMove.bind(this)}>
          { this.state.move && <MoveDialog
            apis={apis}
            path={this.state.path}
            entries={this.state.entries}
            select={this.state.select}
            type="physical"
            operation="move"
          />}
        </DialogOverlay>

        <DialogOverlay open={this.state.copy} onRequestClose={this.closeCopy.bind(this)}>
          { this.state.copy && <MoveDialog
            apis={apis}
            path={this.state.path}
            entries={this.state.entries}
            select={this.state.select}
            type="public"
            operation="copy"
          />}
        </DialogOverlay>

      </div>
    )
  }

  refresh() {
    const path = this.state.path
    let string = ''
    string += `${path[1].fileSystemUUID}/`
    path.forEach((item, index) => {
      if (index > 1) string += (`${item.name}/`)
    })
    this.ctx.props.apis.request('extListDir', { path: encodeURI(string) })
  }

  listByBread(pathIndex) {
    const path = this.state.path
    const newPath = [...this.state.path]
    let string = ''
    if (pathIndex > path.length || pathIndex < 1) throw Error('bread index error')
    path.forEach((item, index) => {
      if (index > pathIndex || index === 0) return
      if (index === 1) string += `${path[index].fileSystemUUID}/`
      else string += `${path[index].name}/`
    })
    newPath.splice(pathIndex + 1)
    // console.log(string, newPath)
    this.ctx.props.apis.request('extListDir', { path: encodeURI(string) })
    this.path = newPath
    this.setState({ inRoot: false })
  }

  enter(fsy) {
    if (!fsy) {
      if (this.state.select.selected.length > 1) return
      fsy = this.state.entries[this.state.select.selected[0]]
    }
    // console.log(fsy, this.state)
    if (fsy.type === 'file') return
    let string = ''
    const fileSystemIndex = this.state.path.findIndex(item => item.fileSystemUUID)
    if (fileSystemIndex === -1) {
      // console.log('fileSystemIndex 没有找到 在根目录')
      string += (`${fsy.fileSystemUUID}/`)
    } else {
      // console.log('fileSystemIndex 找到 不在根目录', fileSystemIndex)
      this.state.path.forEach((item, index) => {
        if (index < fileSystemIndex) {}
        if (index === fileSystemIndex) string += (`${item.fileSystemUUID}/`)
        if (index > fileSystemIndex) string += (`${item.name}/`)
      })
      string += (`${fsy.name}/`)
    }

    const path = [...this.state.path, fsy]
    // console.log(string)

    this.ctx.props.apis.request('extListDir', { path: encodeURI(string) })
    this.path = path
    this.setState({ inRoot: false })
  }

  showContextMenu(clientX, clientY) {
    if (this.select.state.ctrl || this.select.state.shift) return
    const containerDom = document.getElementById('content-container')
    const maxLeft = containerDom.offsetLeft + containerDom.clientWidth - 240
    const x = clientX > maxLeft ? maxLeft : clientX
    const maxTop = containerDom.offsetTop + containerDom.offsetHeight - 192
    const y = clientY > maxTop ? maxTop : clientY
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
      contextMenuY: -1
    })
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
}

export default Physical
