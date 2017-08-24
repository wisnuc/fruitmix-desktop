import React from 'react'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import { IconButton, MenuItem } from 'material-ui'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'
import ListIcon from 'material-ui/svg-icons/action/list'
import GridIcon from 'material-ui/svg-icons/action/view-module'

import Home from './Home'
import FileContent from '../file/FileContent'
import FileUploadButton from '../file/FileUploadButton'
import ContextMenu from '../common/ContextMenu'
import sortByType from '../common/sort'
import { BreadCrumbItem, BreadCrumbSeparator } from '../common/BreadCrumb'
import FlatButton from '../common/FlatButton'
import { ShareDisk } from '../common/Svg'

const debug = Debug('component:viewModel:public: ')

class Public extends Home {
  constructor(ctx) {
    super(ctx)

    this.state = {
      inRoot: true
    }

    this.rootDrive = null

    this.listNavBySelect = () => {
      debug('listNavBySelect', this.select, this.state)
      const selected = this.select.state.selected
      if (selected.length !== 1) return

      const entry = this.state.entries[selected[0]]
      if (entry.type === 'directory') {
        this.ctx.props.apis.request('listNavDir', {
          driveUUID: this.state.path[0].uuid,
          dirUUID: entry.uuid
        })
      } else if (entry.type === 'public') {
        const myUUID = this.ctx.props.apis.account.data.uuid
        const writable = entry.writelist.findIndex(uuid => uuid === myUUID) > -1
        if (!writable) {
          this.toggleDialog('noAccess')
          return
        }
        this.rootDrive = entry
        this.ctx.props.apis.request('listNavDir', {
          driveUUID: entry.uuid,
          dirUUID: entry.uuid
        })
      }
    }
  }

  updateState(type, data) {
    debug('updateState', type, data)
    let path
    let entries
    let select
    /* update drives or listNavDir */
    if (type === 'drives') {
      if (data === this.state.drives && !this.force) return
      path = [{ name: '共享盘', uuid: null, type: 'publicRoot' }]
      entries = data.filter(drive => drive.type === 'public')
      entries.forEach(item => Object.assign(item, { name: item.label }))

      /* sort enries */
      entries = [...entries].sort((a, b) => sortByType(a, b, this.state.sortType))
      select = this.select.reset(entries.length)

      this.force = false
      this.setState({ drives: data, path, entries, select, inRoot: true })
    } else {
      if (data === this.state.listNavDir && !this.force) return
      path = [{ name: '共享盘', uuid: this.rootDrive.uuid, type: 'publicRoot' }, ...data.path] // important !!
      path[1].name = this.rootDrive.name
      entries = data.entries

      /* sort enries */
      entries = [...entries].sort((a, b) => sortByType(a, b, this.state.sortType))
      select = this.select.reset(entries.length)

      this.force = false
      this.setState({ listNavDir: data, path, entries, select, inRoot: false })
    }
  }

  willReceiveProps(nextProps) {
    // console.log('willReceiveProps', nextProps, this.state)
    if (!this.rootDrive) {
      if (!nextProps.apis || !nextProps.apis.drives) return
      const drives = nextProps.apis.drives
      if (drives.isPending() || drives.isRejected()) return
      this.updateState('drives', drives.value())
    } else {
      if (!nextProps.apis || !nextProps.apis.listNavDir) return
      const listNavDir = nextProps.apis.listNavDir
      if (listNavDir.isPending() || listNavDir.isRejected()) return
      this.updateState('dir', listNavDir.value())
    }
  }

  navEnter() {
    this.rootDrive = null
    this.ctx.props.apis.request('drives')
  }

  menuName() {
    return '共享盘'
  }

  menuIcon() {
    return ShareDisk
  }

  /* renderers */

  renderTitle({ style }) {
    if (!this.state.listNavDir && !this.state.drives) return (<div />)

    // debug('renderTitle', this.state)
    const path = this.state.path

    /* in the public drives */
    if (this.state.inRoot) {
      return (
        <div style={Object.assign({}, style, { marginLeft: 168 })}>
          <BreadCrumbItem
            text="共享盘"
            onTouchTap={() => {
              this.rootDrive = null
              this.ctx.props.apis.request('drives')
            }}
          />
        </div>
      )
    }

    /*
      each one is preceded with a separator, except for the first one
      each one is assigned an action, except for the last one
    */

    const touchTap = node => this.ctx.props.apis.request('listNavDir', { driveUUID: path[1].uuid, dirUUID: node.uuid })

    return (
      <div style={Object.assign({}, style, { marginLeft: 168 })}>
        {
          this.state.path.reduce((acc, node, index) => {
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
              acc.push(
                <BreadCrumbItem
                  text="共享盘"
                  key="root"
                  onTouchTap={() => {
                    this.rootDrive = null
                    this.ctx.props.apis.request('drives')
                  }}
                />
              )
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
        <IconButton onTouchTap={() => this.toggleDialog('createNewFolder')} tooltip="新建文件夹" disabled={this.state.inRoot} >
          <FileCreateNewFolder color="#FFF" />
        </IconButton>
      </div>
    )
  }

  renderNoPublic(navTo) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: '#FAFAFA'
          }}
        >
          <div style={{ fontSize: 24, color: 'rgba(0,0,0,0.27)', height: 56 }}> { '尚未建立共享盘' } </div>
          { this.ctx.props.apis.account && this.ctx.props.apis.account.data && this.ctx.props.apis.account.data.isAdmin &&
            <FlatButton label="去创建" primary onTouchTap={() => navTo('adminDrives')} /> }
        </div>
      </div>
    )
  }

  renderContent({ navTo, toggleDetail, openSnackBar }) {
    debug('renderContent public', this.state.contextMenuOpen, !this.state.inRoot, this.state.contextMenuY, this.state.contextMenuX)

    /* loading data */
    if (!this.state.listNavDir && !this.state.drives || !this.state.path.length) return (<div />)

    /* no public drives */
    if (this.state.path.length === 1 && !this.state.entries.length) return this.renderNoPublic(navTo)

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>

        { this.state.path.length > 1 && <FileUploadButton upload={this.upload} /> }

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
        />

        { this.renderMenu(!!this.state.contextMenuOpen && !this.state.inRoot, toggleDetail) }

        { this.renderDialogs(openSnackBar) }

      </div>
    )
  }
}

export default Public
