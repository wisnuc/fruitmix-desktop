import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import { IconButton, MenuItem, FloatingActionButton } from 'material-ui'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'
import ListIcon from 'material-ui/svg-icons/action/list'
import ContentAdd from 'material-ui/svg-icons/content/add'
import GridIcon from 'material-ui/svg-icons/action/view-module'
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh'

import Home from './Home'
import FileDetail from '../file/FileDetail'
import FileContent from '../file/FileContent'
import FileUploadButton from '../file/FileUploadButton'
import DriversDetail from '../control/DriversDetail'
import NewDriveDialog from '../control/NewDriveDialog'
import ContextMenu from '../common/ContextMenu'
import sortByType from '../common/sort'
import { BreadCrumbItem, BreadCrumbSeparator } from '../common/BreadCrumb'
import FlatButton from '../common/FlatButton'
import { ShareDisk } from '../common/Svg'
import DialogOverlay from '../common/DialogOverlay'

const debug = Debug('component:viewModel:public: ')

class Public extends Home {
  constructor(ctx) {
    super(ctx)

    this.state = Object.assign(this.state, { inRoot: true })

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
        const writable = entry.writelist === '*' || entry.writelist.findIndex(uuid => uuid === myUUID) > -1
        if (!writable) {
          this.toggleDialog('noAccess')
          this.refresh()
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
    // debug('updateState', type, data)
    let path
    let entries
    let select
    /* update drives or listNavDir */
    if (type === 'drives') {
      if (data === this.state.drives && !this.force) return
      path = [{ name: i18n.__('Public Drive'), uuid: null, type: 'publicRoot' }]
      const myUUID = this.ctx.props.apis.account.data && this.ctx.props.apis.account.data.uuid
      entries = data.filter(drive => drive.type === 'public' && drive.tag !== 'built-in')
      entries.forEach(item => Object.assign(item, { name: item.label }))

      /* sort enries */
      // entries = [...entries].sort((a, b) => sortByType(a, b, this.state.sortType))
      select = this.select.reset(entries.length)

      this.force = false
      this.setState({ drives: data, path, entries, select, inRoot: true, loading: false })
    } else {
      if (data === this.state.listNavDir && !this.force) return
      path = [{ name: i18n.__('Public Drive'), uuid: this.rootDrive.uuid, type: 'publicRoot' }, ...data.path] // important !!
      const drives = this.state.drives || this.ctx.props.apis.drives.value()
      path[1].name = this.rootDrive.name || drives.find(d => d.uuid === this.rootDrive.uuid).label
      entries = data.entries

      /* sort enries */
      entries = [...entries].sort((a, b) => sortByType(a, b, this.state.sortType))
      select = this.select.reset(entries.length)

      this.force = false
      this.setState({ listNavDir: data, path, entries, select, inRoot: false, loading: false })
    }
  }

  willReceiveProps(nextProps) {
    // console.log('willReceiveProps', nextProps, this.state)
    if (!this.rootDrive) {
      if (!nextProps.apis || !nextProps.apis.drives) return
      if (!nextProps.apis || !nextProps.apis.users) return
      const drives = nextProps.apis.drives
      const users = nextProps.apis.users
      if (drives.isPending() || drives.isRejected() || users.isPending() || users.isRejected()) return
      if (this.state.users !== users.value()) this.setState({ users: users.value() })
      this.updateState('drives', drives.value())
    } else {
      if (!nextProps.apis || !nextProps.apis.listNavDir) return
      const listNavDir = nextProps.apis.listNavDir
      if (listNavDir.isPending() || listNavDir.isRejected()) return
      this.updateState('dir', listNavDir.value())
    }
  }

  navEnter(target) {
    this.isNavEnter = true
    const apis = this.ctx.props.apis
    if (target && target.driveUUID) { // jump to specific dir
      const { driveUUID, dirUUID } = target
      apis.request('listNavDir', { driveUUID, dirUUID })
      this.rootDrive = { uuid: driveUUID }
      this.setState({ loading: true })
     } else this.refresh()
  }

  navLeave() {
    this.isNavEnter = false
  }

  navGroup() {
    return 'public'
  }

  menuName() {
    return i18n.__('Public Menu Name')
  }

  quickName() {
    return i18n.__('Public Quick Name')
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
            text={i18n.__('Public Drive')}
            onTouchTap={() => {
              this.rootDrive = null
              this.ctx.props.apis.request('drives')
              this.setState({ loading: true })
            }}
          />
        </div>
      )
    }

    /*
      each one is preceded with a separator, except for the first one
      each one is assigned an action, except for the last one
    */

    const touchTap = (node) => {
      this.setState({ loading: true })
      this.ctx.props.apis.request('listNavDir', { driveUUID: path[1].uuid, dirUUID: node.uuid })
    }

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
              acc.push(<BreadCrumbItem
                text={i18n.__('Public Drive')}
                key="root"
                onTouchTap={() => {
                    this.rootDrive = null
                    this.ctx.props.apis.request('drives')
                  }}
              />)
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
        <IconButton onTouchTap={() => this.refresh()} tooltip={i18n.__('Refresh')} >
          <RefreshIcon color="#FFF" />
        </IconButton>
        <IconButton
          onTouchTap={() => this.toggleDialog('gridView')}
          tooltip={this.state.gridView ? i18n.__('List View') : i18n.__('Grid View')}
        >
          { this.state.gridView ? <ListIcon color="#FFF" /> : <GridIcon color="#FFF" /> }
        </IconButton>
        <IconButton
          disabled={this.state.inRoot}
          tooltip={i18n.__('Create New Folder')}
          onTouchTap={() => this.toggleDialog('createNewFolder')}
        >
          <FileCreateNewFolder color="#FFF" />
        </IconButton>
      </div>
    )
  }

  renderNoPublic() {
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
          <div style={{ fontSize: 24, color: 'rgba(0,0,0,0.27)', height: 56 }}> { i18n.__('No Public Drive') } </div>
          <div style={{ color: 'rgba(0,0,0,0.27)', height: 56 }}> { i18n.__('No Public Drive Text') } </div>
        </div>
      </div>
    )
  }

  renderDetail({ style, openSnackBar }) {
    if (!this.state.entries) return (<div />)
    console.log('renderDetail', this.state.drives, this.select.state.selected)
    const drives = this.state.drives && this.state.drives.filter(drive => drive.type === 'public' && drive.tag !== 'built-in')
    return (
      <div style={style}>
        {
          this.ctx.props.apis.account && this.ctx.props.apis.account.data && this.ctx.props.apis.account.data.isAdmin &&
          this.state.entries.length && this.select.state.selected.length && this.state.path.length === 1 ?
          <DriversDetail
            primary
            openSnackBar={openSnackBar}
            users={this.state.users}
            drives={drives}
            detailUsers={this.state.users}
            detailDrive={drives[this.select.state.selected[0]]}
            apis={this.ctx.props.apis}
            refreshDrives={this.refresh}
            primaryColor={this.groupPrimaryColor()}
          /> :
          this.state.entries.length && this.select.state.selected.length ?
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

  renderContent({ toggleDetail, openSnackBar, getDetailStatus }) {
    debug('renderContent public', this.state, this.ctx.props)

    /* loading data */
    // if (!this.state.listNavDir && !this.state.drives || !this.state.path.length) return (<div />)

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* add new user FAB */}
        {
          this.ctx.props.apis.account && this.ctx.props.apis.account.data &&
            this.ctx.props.apis.account.data.isAdmin && this.state.path && this.state.path.length === 1 &&
            (
              <FloatingActionButton
                style={{ position: 'absolute', top: -36, left: 24, zIndex: 200 }}
                backgroundColor="#2196F3"
                disabled={!this.state.users || !this.state.drives}
                onTouchTap={() => this.setState({ newDrive: true })}
              >
                <ContentAdd />
              </FloatingActionButton>
            )
        }

        {/* upload FAB */}
        { this.state.path && this.state.path.length > 1 && <FileUploadButton upload={this.upload} /> }

        {
          (this.state.path && this.state.path.length === 1 && !this.state.entries.length) ? this.renderNoPublic() :

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
              openSnackBar={openSnackBar}
              toggleDialog={this.toggleDialog}
              showTakenTime={!!this.state.takenTime}
              apis={this.ctx.props.apis}
              inPublicRoot={this.state.inRoot}
            />
        }

        { this.renderMenu(!!this.state.contextMenuOpen && !this.state.inRoot, toggleDetail, getDetailStatus) }

        { this.renderDialogs(openSnackBar) }

        <DialogOverlay open={!!this.state.newDrive} onRequestClose={() => this.setState({ newDrive: false })}>
          {
            this.state.newDrive && <NewDriveDialog
              primary
              apis={this.ctx.props.apis}
              users={this.state.users}
              drives={this.state.drives}
              refreshDrives={this.refresh}
              openSnackBar={openSnackBar}
              primaryColor={this.groupPrimaryColor()}
            />
          }
        </DialogOverlay>

      </div>
    ) 
  }
}

export default Public
