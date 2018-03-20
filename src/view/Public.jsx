import React from 'react'
import i18n from 'i18n'
import { ipcRenderer } from 'electron'
import { IconButton, FloatingActionButton } from 'material-ui'
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
import sortByType from '../common/sort'
import { ShareDisk } from '../common/Svg'
import DialogOverlay from '../common/DialogOverlay'

class Public extends Home {
  constructor (ctx) {
    super(ctx)

    this.title = () => i18n.__('Public Drive')

    this.state = Object.assign(this.state, { inRoot: true })

    this.rootDrive = null

    this.listNavBySelect = () => {
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

  willReceiveProps (nextProps) {
    if (!this.rootDrive) {
      this.preDriveValue = this.state.drives
      this.handleProps(nextProps.apis, ['drives', 'users'])
      if (this.preDriveValue === this.state.drives && !this.force) return

      /* process path and entries, in root */
      const path = [{ name: i18n.__('Public Drive'), uuid: null, type: 'publicRoot' }]
      const entries = this.state.drives.filter(drive => drive.type === 'public' && drive.tag !== 'built-in')
      entries.forEach(item => Object.assign(item, { name: item.label }))
      const select = this.select.reset(entries.length)

      this.force = false
      this.setState({ path, entries, select, inRoot: true, loading: false })
    } else {
      this.preListValue = this.state.listNavDir
      this.handleProps(nextProps.apis, ['listNavDir'])
      if (this.preListValue === this.state.listNavDir && !this.force) return

      /* process path and entries, not in root */
      const path = [{ name: i18n.__('Public Drive'), uuid: this.rootDrive.uuid, type: 'publicRoot' }, ...this.state.listNavDir.path]
      const drives = this.state.drives || this.ctx.props.apis.drives.value()
      path[1].name = this.rootDrive.name || drives.find(d => d.uuid === this.rootDrive.uuid).label

      const entries = [...this.state.listNavDir.entries].sort((a, b) => sortByType(a, b, this.state.sortType))
      const select = this.select.reset(entries.length)
      const { counter } = this.state.listNavDir

      this.force = false
      this.setState({ path, entries, select, counter, inRoot: false, loading: false })
    }
  }

  navEnter (target) {
    this.isNavEnter = true
    const apis = this.ctx.props.apis
    if (target && target.driveUUID) { // jump to specific dir
      const { driveUUID, dirUUID } = target
      apis.request('listNavDir', { driveUUID, dirUUID })
      this.rootDrive = { uuid: driveUUID }
      this.setState({ loading: true })
    } else this.refresh()
  }

  menuName () {
    return i18n.__('Public Menu Name')
  }

  quickName () {
    return i18n.__('Public Quick Name')
  }

  menuIcon () {
    return ShareDisk
  }

  /* renderers */
  renderTitle ({ style }) {
    if (!this.state.listNavDir && !this.state.drives) return (<div />)
    return this.renderBreadCrumbItem({ style })
  }

  renderToolBar ({ style }) {
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

  renderNoPublic () {
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
          { this.ctx.props.apis.account && this.ctx.props.apis.account.data && this.ctx.props.apis.account.data.isAdmin &&
            <div style={{ color: 'rgba(0,0,0,0.27)', height: 56 }}> { i18n.__('No Public Drive Text') } </div> }
        </div>
      </div>
    )
  }

  renderDetail ({ style, openSnackBar }) {
    if (!this.state.entries) return (<div />)
    const drives = this.state.drives && this.state.drives.filter(drive => drive.type === 'public' && drive.tag !== 'built-in')
    /* pre selected drive */
    const preDrive = drives && drives.find(d => d.uuid === this.state.scrollTo)
    const account = this.ctx.props.apis.account
    const isAdmin = account && account.data && account.data.isAdmin
    const rightPos = this.state.entries.length && (this.state.path.length === 1)
    const isSelected = this.select.state.selected.length || preDrive
    const detailDrive = this.select.state.selected.length ? drives[this.select.state.selected[0]] : preDrive
    return (
      <div style={style}>
        {
          isAdmin && rightPos && isSelected
            ? <DriversDetail
              primary
              openSnackBar={openSnackBar}
              users={this.state.users}
              drives={drives}
              detailUsers={this.state.users}
              detailDrive={detailDrive}
              apis={this.ctx.props.apis}
              refreshDrives={this.refresh}
              primaryColor={this.groupPrimaryColor()}
            />
            : this.state.entries.length
              ? <FileDetail
                detailIndex={this.select.state.selected}
                counter={this.state.counter}
                entries={this.state.entries}
                path={this.state.path}
                ipcRenderer={ipcRenderer}
                primaryColor={this.groupPrimaryColor()}
              />
              : <div style={{ height: 128, backgroundColor: this.groupPrimaryColor(), filter: 'brightness(0.9)' }} />
        }
      </div>
    )
  }

  renderContent ({ toggleDetail, openSnackBar, getDetailStatus }) {
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
          (this.state.path && this.state.path.length === 1 && !this.state.entries.length) ? this.renderNoPublic()

            : <FileContent
              {...this.state}
              listNavBySelect={this.listNavBySelect}
              showContextMenu={this.showContextMenu}
              setAnimation={this.setAnimation}
              ipcRenderer={ipcRenderer}
              download={this.download}
              primaryColor={this.groupPrimaryColor()}
              changeSortType={this.changeSortType}
              openSnackBar={openSnackBar}
              toggleDialog={this.toggleDialog}
              showTakenTime={!!this.state.takenTime}
              apis={this.ctx.props.apis}
              refresh={this.refresh}
              resetScrollTo={this.resetScrollTo}
              rowDragStart={this.rowDragStart}
              gridDragStart={this.gridDragStart}
              setScrollTop={this.setScrollTop}
              setGridData={this.setGridData}
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
