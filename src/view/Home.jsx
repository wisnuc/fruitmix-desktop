import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import { IconButton, Divider, CircularProgress, Avatar } from 'material-ui'
import FileFolder from 'material-ui/svg-icons/file/folder'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh'
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
import renderFileIcon from '../common/renderFileIcon'
import { xcopyMsg } from '../common/msg'

const debug = Debug('component:viewModel:Home: ')

class Home extends Base {
  constructor(ctx) {
    super(ctx)

    this.type = 'home'
    this.title = () => i18n.__('Home Title')
    /* handle select TODO */
    this.select = new ListSelect(this)
    this.select.on('updated', next => this.setState({ select: next }))

    this.state = {
      gridView: false, // false: list, true: grid
      sortType: 'nameUp', // nameUp, nameDown, timeUp, timeDown, sizeUp, sizeDown, takenUp, takenDown
      select: this.select.state,
      listNavDir: null, // save a reference
      path: [],
      entries: [], // sorted
      contextMenuOpen: false,
      contextMenuY: -1,
      contextMenuX: -1,

      createNewFolder: false,
      rename: false,
      delete: false,
      move: false,
      copy: false,
      share: false,
      loading: true
    }

    /* handle update sortType */
    this.force = false
    this.changeSortType = (sortType) => {
      this.force = true
      if (sortType === 'takenUp' || sortType === 'takenDown') this.setState({ takenTime: true })
      if (sortType === 'timeUp' || sortType === 'timeDown') this.setState({ takenTime: false })
      this.setState({ sortType })
    }

    this.toggleDialog = (type) => {
      if (!window.navigator.onLine) return this.ctx.openSnackBar(i18n.__('Offline Text'))
      this.setState({ [type]: !this.state[type] })
    }

    /* file or dir operations */
    this.upload = (type) => {
      if (!window.navigator.onLine) return this.ctx.openSnackBar(i18n.__('Offline Text'))
      const dirPath = this.state.path
      const dirUUID = dirPath[dirPath.length - 1].uuid
      const driveUUID = dirPath[0].uuid
      console.log(dirPath, driveUUID, dirUUID, type)
      ipcRenderer.send('UPLOAD', { dirUUID, driveUUID, type })
    }

    this.download = () => {
      if (!window.navigator.onLine) return this.ctx.openSnackBar(i18n.__('Offline Text'))
      const selected = this.state.select.selected
      const entries = selected.map(index => this.state.entries[index])
      const path = this.state.path
      ipcRenderer.send('DOWNLOAD', { entries, dirUUID: path[path.length - 1].uuid, driveUUID: path[0].uuid })
    }

    this.dupFile = () => {
      if (!window.navigator.onLine) return this.ctx.openSnackBar(i18n.__('Offline Text'))
      const entries = this.state.entries
      const selected = this.state.select.selected
      const path = this.state.path
      const curr = path[path.length - 1]
      const oldName = entries[selected[0]].name
      const reg = /^.*\./
      const extension = oldName.replace(reg, '')
      const nameNoExt = oldName.match(reg) ? oldName.match(reg)[0] : oldName
      let newName = oldName
      for (let i = 0; entries.findIndex(e => e.name === newName) > -1; i++) {
        const addText = i ? ` - ${i18n.__('Copy(noun)')} (${i})` : ` - ${i18n.__('Copy(noun)')}`
        if (!extension || extension === oldName || nameNoExt === '.') {
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
        if (err) this.ctx.openSnackBar(i18n.__('Dup File Failed'))
        else {
          this.refresh()
          this.ctx.openSnackBar(i18n.__('Dup File Success'))
        }
      })
    }

    this.deleteAsync = async () => {
      const entries = this.state.entries
      const selected = this.state.select.selected
      const path = this.state.path
      const dirUUID = path[path.length - 1].uuid
      const driveUUID = this.state.path[0].uuid

      if (this.ctx.props.selectedDevice.token.data.stationID) {
        for (let i = 0; i < selected.length; i++) {
          const entryName = entries[selected[i]].name
          const entryUUID = entries[selected[i]].uuid
          await this.ctx.props.apis.requestAsync('deleteDirOrFile', { driveUUID, dirUUID, entryName, entryUUID })
        }
      } else {
        const op = []
        for (let i = 0; i < selected.length; i++) {
          const entryName = entries[selected[i]].name
          const entryUUID = entries[selected[i]].uuid
          op.push({ driveUUID, dirUUID, entryName, entryUUID })
        }
        for (let j = 0; j <= (op.length - 1) / 512; j++) { // delete no more than 512 files per post
          await this.ctx.props.apis.requestAsync('deleteDirOrFile', op.filter((a, i) => (i >= j * 512) && (i < (j + 1) * 512)))
        }
      }

      if (this.state.path[this.state.path.length - 1].uuid === dirUUID) {
        await this.ctx.props.apis.requestAsync('listNavDir', { driveUUID: this.state.path[0].uuid, dirUUID })
      }
    }

    this.delete = () => {
      if (!window.navigator.onLine) return this.ctx.openSnackBar(i18n.__('Offline Text'))
      this.setState({ deleteLoading: true })
      this.deleteAsync().then(() => {
        this.setState({ deleteLoading: false, delete: false })
        this.ctx.openSnackBar(i18n.__('Delete Success'))
      }).catch((e) => {
        this.setState({ deleteLoading: false, delete: false })
        console.log('delete error', e)
        this.ctx.openSnackBar(i18n.__('Delete Failed'))
      })
    }

    /* actions */
    this.listNavBySelect = () => {
      if (!window.navigator.onLine) return this.ctx.openSnackBar(i18n.__('Offline Text'))
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

    /* op: scrollTo file */
    this.refresh = (op) => {
      if (!window.navigator.onLine) return this.ctx.openSnackBar(i18n.__('Offline Text'))

      const rUUID = this.state.path[0] && this.state.path[0].uuid
      const dUUID = this.state.path[0] && this.state.path[this.state.path.length - 1].uuid
      if (!rUUID || !dUUID) {
        this.setState({ loading: true })
        this.ctx.props.apis.request('drives') // drive root
      } else this.ctx.props.apis.request('listNavDir', { driveUUID: rUUID, dirUUID: dUUID })

      // debug('this.refresh op', op)
      if (op) this.setState({ scrollTo: op.fileName, loading: !op.noloading })
      else this.setState({ loading: true })
    }

    this.resetScrollTo = () => Object.assign(this.state, { scrollTo: null })

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

    /* request task state */
    this.getTaskState = async (uuid) => {
      await Promise.delay(500)
      const data = await this.ctx.props.apis.pureRequestAsync('task', { uuid })
      if (data && data.nodes && data.nodes.findIndex(n => n.parent === null && n.state === 'Finished') > -1) return 'Finished'
      if (data && data.nodes && data.nodes.findIndex(n => n.state === 'Conflict') > -1) return 'Conflict'
      return 'Working'
    }

    /* finish post change dialog content to waiting/result */
    this.finish = (error, data) => {
      const type = i18n.__('Move')
      if (error) return this.ctx.openSnackBar(type.concat(i18n.__('+Failed')), { showTasks: true })

      this.getTaskState(data.uuid).asCallback((err, res) => {
        if (err) {
          this.ctx.openSnackBar(type.concat(i18n.__('+Failed')), { showTasks: true })
        } else {
          let text = 'Working'
          if (res === 'Finished') text = xcopyMsg(this.xcopyData)
          if (res === 'Conflict') text = i18n.__('Task Conflict Text')
          this.refresh({ noloading: true })
          this.ctx.openSnackBar(text, res !== 'Finished' ? { showTasks: true } : null)
        }
      })
    }

    this.shouldFire = () => {
      const { select, entries } = this.state
      const { hover } = select
      return hover > -1 && select.rowDrop(hover) && entries[hover].type === 'directory' && this.RDSI !== hover
    }

    this.onHoverHeader = (node) => {
      this.hoverHeader = node
      this.forceUpdate()
    }

    /* verify header node for dropping, return `null` or the node */
    this.dropHeader = () => {
      if (!this.hoverHeader || this.hoverHeader.uuid === this.state.path.slice(-1)[0].uuid) return null
      if (this.hoverHeader.type === 'publicRoot') return null
      return this.hoverHeader
    }

    this.setScrollTop = scrollTop => (this.scrollTop = scrollTop)

    this.setGridData = data => (this.gridData = data)

    this.getPosition = (gridData, index) => {
      const { mapData, indexHeightSum, scrollTop } = gridData
      const lineNum = mapData[index]
      const top = indexHeightSum[lineNum] + 104 - scrollTop
      const left = (index - mapData.findIndex(i => i === lineNum)) * 200 + 123
      return ({ top, left })
    }

    /* drag row */
    this.dragRow = (e) => {
      const s = this.refDragedItems.style
      if (!this.state.select.selected.includes(this.RDSI)) {
        if (this.RDSI > -1) this.state.select.addByArray([this.RDSI], (new Date()).getTime())
      } else if (s.display !== 'flex') {
        s.display = 'flex'
      } else {
        s.width = '180px'
        s.opacity = 1

        const RDTop = `${this.RDSI * 48 + 176 - (this.scrollTop || 0)}px`
        if (!s.top || s.top === RDTop) s.top = `${e.clientY + 2}px`
        else s.marginTop = `${e.clientY + 2 - parseInt(s.top, 10)}px`

        if (!s.left || s.left === '75px') s.left = `${e.clientX + 2}px`
        else s.marginLeft = `${e.clientX + 2 - parseInt(s.left, 10)}px`
      }
      if (!this.entry.type) this.forceUpdate()
    }

    this.dragEnd = () => {
      document.removeEventListener('mousemove', this.dragGrid)
      document.removeEventListener('mousemove', this.dragRow)
      document.removeEventListener('mouseup', this.dragEnd)
      if (!this.refDragedItems || this.RDSI < 0) return
      const hover = this.state.select.hover
      const shouldFire = this.shouldFire()
      const dropHeader = this.dropHeader()
      if (shouldFire || dropHeader) {
        const type = 'move'

        const path = this.state.path
        const dir = path[path.length - 1].uuid
        const drive = path[0].uuid
        const src = { drive, dir }
        const dst = { drive, dir: shouldFire ? this.state.entries[hover].uuid : dropHeader.uuid }

        const entries = this.state.select.selected.map(i => this.state.entries[i].uuid)
        const policies = { dir: ['keep', null] }

        this.xcopyData = {
          type,
          srcDir: path[path.length - 1],
          dstDir: shouldFire ? this.state.entries[hover] : dropHeader,
          entries: this.state.select.selected.map(i => this.state.entries[i])
        }

        this.ctx.props.apis.request('copy', { type, src, dst, entries, policies }, this.finish)
      }
      const s = this.refDragedItems.style
      s.transition = 'all 225ms cubic-bezier(.4,0,1,1)'

      if (this.state.gridView) {
        const { top, left } = this.getPosition(this.gridData, this.RDSI)
        s.top = `${top}px`
        s.left = `${left}px`
        s.width = '180px'
      } else {
        s.top = `${this.RDSI * 48 + 176 - (this.scrollTop || 0)}px`
        s.left = '75px'
        s.width = '100%'
      }
      s.marginTop = '0px'
      s.marginLeft = '0px'
      s.opacity = 0

      this.RDSI = -1
      this.state.select.toggleDrag([])

      setTimeout(() => {
        s.display = 'none'
        s.transition = 'all 225ms cubic-bezier(.4,0,1,1)'
        s.transitionProperty = 'top, left, width, opacity'
      }, shouldFire || dropHeader ? 0 : 225)
    }

    this.rowDragStart = (event, index) => {
      /* only left click */
      if (event.nativeEvent.button !== 0) return
      /* not public */
      if (this.state.entries[index].type === 'public') return
      this.RDSI = index // rowDragStartIndex
      const selected = this.state.select.selected
      this.state.select.toggleDrag(selected.includes(this.RDSI) ? selected : [this.RDSI])

      /* show drag item */
      // console.log('this.scrollTop', this.scrollTop)
      this.refDragedItems.style.top = `${this.RDSI * 48 + 176 - (this.scrollTop || 0)}px`
      this.refDragedItems.style.left = '75px'

      document.addEventListener('mousemove', this.dragRow)
      document.addEventListener('mouseup', this.dragEnd, true)
    }

    /* drag item in GridView */
    this.dragGrid = (e) => {
      const s = this.refDragedItems.style
      if (!this.state.select.selected.includes(this.RDSI)) {
        if (this.RDSI > -1) this.state.select.addByArray([this.RDSI], (new Date()).getTime())
      } else if (s.display !== 'flex') {
        s.display = 'flex'
      } else {
        s.opacity = 1

        const { top, left } = this.getPosition(this.gridData, this.RDSI)

        if (!s.top || s.top === `${top}px`) s.top = `${e.clientY + 2}px`
        else s.marginTop = `${e.clientY + 2 - parseInt(s.top, 10)}px`

        if (!s.left || s.left === `${left}px`) s.left = `${e.clientX + 2}px`
        else s.marginLeft = `${e.clientX + 2 - parseInt(s.left, 10)}px`
      }
      if (!this.entry.type) this.forceUpdate()
    }

    this.gridDragStart = (event, index) => {
      /* only left click */
      if (event.nativeEvent.button !== 0) return
      /* not public */
      if (this.state.entries[index].type === 'public') return
      this.RDSI = index // rowDragStartIndex
      const selected = this.state.select.selected
      this.state.select.toggleDrag(selected.includes(this.RDSI) ? selected : [this.RDSI])

      /* show drag item */
      const { top, left } = this.getPosition(this.gridData, this.RDSI)
      this.refDragedItems.style.top = `${top}px`
      this.refDragedItems.style.left = `${left}px`
      this.refDragedItems.style.width = '180px'

      document.addEventListener('mousemove', this.dragGrid)
      document.addEventListener('mouseup', this.dragEnd, true)
    }

    ipcRenderer.on('driveListUpdate', (e, dir) => {
      if (this.state.contextMenuOpen) return
      if (this.state.select && this.state.select.selected && this.state.select.selected.length > 1) return
      const path = this.state.path
      if (this.isNavEnter && path && path.length && dir.uuid === path[path.length - 1].uuid) this.refresh({ noloading: true })
    })
  }

  willReceiveProps(nextProps) {
    this.preValue = this.state.listNavDir
    this.handleProps(nextProps.apis, ['listNavDir'])

    /* set force === true  to update sortType forcely */
    if (this.preValue === this.state.listNavDir && !this.force) return

    const { path, entries, counter } = this.state.listNavDir
    const select = this.select.reset(entries.length)

    if (Array.isArray(path) && path[0]) path[0].type = this.type

    this.force = false
    /* sort entries, reset select, stop loading */
    this.setState({
      path, select, loading: false, entries: [...entries].sort((a, b) => sortByType(a, b, this.state.sortType)), counter
    })
  }

  navEnter(target) {
    this.isNavEnter = true
    const apis = this.ctx.props.apis
    if (!apis || !apis.drives || !apis.drives.data) return
    if (target && target.driveUUID) { // jump to specific dir
      const { driveUUID, dirUUID } = target
      apis.request('listNavDir', { driveUUID, dirUUID })
      this.setState({ loading: true })
    } else this.refresh()
  }

  navLeave() {
    this.isNavEnter = false
    this.setState({
      contextMenuOpen: false,
      contextMenuY: -1,
      contextMenuX: -1,
      createNewFolder: false,
      rename: false,
      delete: false,
      move: false,
      copy: false,
      share: false,
      loading: false
    })
  }

  navGroup() {
    return 'file'
  }

  menuName() {
    return i18n.__('Home Menu Name')
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
  renderDragItems() {
    this.entry = this.RDSI > -1 && this.state.entries[this.RDSI] || {}
    return (
      <div
        ref={ref => (this.refDragedItems = ref)}
        style={{
          position: 'absolute',
          zIndex: 1000,
          top: 0,
          left: 0,
          marginLeft: 0,
          opacity: 0,
          width: '100%',
          height: 48,
          transition: 'all 225ms cubic-bezier(.4,0,1,1)',
          transitionProperty: 'top, left, width, opacity',
          display: 'none',
          alignItems: 'center',
          color: '#FFF',
          boxShadow: '2px 2px 2px rgba(0,0,0,0.27)',
          backgroundColor: this.groupPrimaryColor()
        }}
      >
        <div style={{ flexGrow: 1, maxWidth: 48 }} />
        {/* file type may be: folder, public, directory, file, unsupported */}
        <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', margin: 12 }}>
          <Avatar style={{ backgroundColor: 'white', width: 36, height: 36 }}>
            {
              this.entry.type === 'directory'
              ? <FileFolder style={{ color: 'rgba(0,0,0,0.54)', width: 24, height: 24 }} />
              : this.entry.type === 'file'
              ? renderFileIcon(this.entry.name, this.entry.metadata, 24)
              : <div />
            }
          </Avatar>
        </div>
        <div
          style={{
            width: 114,
            marginRight: 12,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
          }}
        >
          { this.entry.name }
        </div>
        {
          this.state.select.selected.length > 1 &&
            <div
              style={{
                position: 'absolute',
                top: -12,
                right: -12,
                width: 24 + Math.floor(Math.log10(this.state.select.selected.length)) * 6,
                height: 24,
                borderRadius: 12,
                boxSizing: 'border-box',
                backgroundColor: this.shouldFire() || this.dropHeader() ? this.groupPrimaryColor() : '#FF4081',
                border: '1px solid rgba(0,0,0,0.18)',
                color: '#FFF',
                fontWeight: 500,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              { this.state.select.selected.length }
            </div>
        }
      </div>
    )
  }

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

  renderBreadCrumbItem({ style }) {
    const path = this.state.path

    const touchTap = (node) => {
      this.setState({ loading: true })
      if (node.type === 'publicRoot') {
        this.rootDrive = null
        this.ctx.props.apis.request('drives')
      } else this.ctx.props.apis.request('listNavDir', { driveUUID: path[0].uuid, dirUUID: node.uuid })
    }

    /*
      each one is preceded with a separator, except for the first one
      each one is assigned an action, except for the last one
    */

    return (
      <div style={Object.assign({}, style, { marginLeft: 168 })}>
        {
          path.reduce((acc, node, index) => {
            const isDrop = () => this.state.select.isDrop()
            const dropable = () => this.state.select.isDrop() && this.dropHeader()
            const funcs = { node, isDrop, dropable, onHoverHeader: this.onHoverHeader, onTouchTap: () => touchTap(node) }

            if (path.length > 4 && index > 0 && index < path.length - 3) {
              if (index === path.length - 4) {
                acc.push(<BreadCrumbSeparator key={`Separator${node.uuid}`} />)
                acc.push(<BreadCrumbItem key="..." text="..." {...funcs} />)
              }
              return acc
            }

            if (index !== 0) acc.push(<BreadCrumbSeparator key={`Separator${node.uuid}`} />)

            /* the first one is always special */
            if (index === 0) acc.push(<BreadCrumbItem text={this.title()} key="root" {...funcs} />)
            else acc.push(<BreadCrumbItem text={node.name} key={`Item${node.uuid}`} {...funcs} />)

            return acc
          }, [])
        }
      </div>
    )
  }

  renderTitle({ style }) {
    if (!this.state.listNavDir) return (<div />)
    return this.renderBreadCrumbItem({ style })
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
        <IconButton onTouchTap={() => this.toggleDialog('createNewFolder')} tooltip={i18n.__('Create New Folder')}>
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
              key={this.state.path.slice(-1)[0].uuid}
              detailIndex={this.select.state.selected}
              counter={this.state.counter}
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
            title={this.title}
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
            title={this.title}
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
            title={this.title}
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
              <div style={{ color: 'rgba(0,0,0,0.54)', height: 24, display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                { i18n.__('Confirm Delete Text') }
                { this.state.deleteLoading && <CircularProgress size={16} thickness={2} style={{ marginLeft: 8 }} /> }
              </div>
              <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                <FlatButton label={i18n.__('Cancel')} primary disabled={this.state.deleteLoading} onTouchTap={() => this.toggleDialog('delete')} />
                <FlatButton
                  label={i18n.__('Confirm')}
                  disabled={this.state.deleteLoading}
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
              <div style={{ color: 'rgba(0,0,0,0.54)' }}>{ i18n.__('No Access Text') }</div>
              <div style={{ height: 24 }} />
              <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                <FlatButton label={i18n.__('OK')} primary onTouchTap={() => this.toggleDialog('noAccess')} />
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
                  primaryText={i18n.__('Create New Folder')}
                  leftIcon={<FileCreateNewFolder style={{ height: 20, width: 20, marginTop: 6 }} />}
                  onTouchTap={() => this.toggleDialog('createNewFolder')}
                />
                <div style={{ height: 8 }} />
                <Divider />
                <div style={{ height: 8 }} />

                <MenuItem
                  primaryText={i18n.__('Upload Folder')}
                  leftIcon={<UploadFold style={{ height: 20, width: 20, marginTop: 6 }} />}
                  onTouchTap={() => this.upload('directory')}
                />
                <MenuItem
                  primaryText={i18n.__('Upload File')}
                  leftIcon={<UploadFile style={{ height: 20, width: 20, marginTop: 6 }} />}
                  onTouchTap={() => this.upload('file')}
                />
              </div>
              :
              <div>
                <div>
                  {
                    this.title() !== i18n.__('Share Title') &&
                      <MenuItem
                        leftIcon={<ShareIcon style={{ height: 20, width: 20, marginTop: 6 }} />}
                        primaryText={i18n.__('Share to Public')}
                        onTouchTap={() => this.toggleDialog('share')}
                      />
                  }
                  <MenuItem
                    leftIcon={<CopyIcon style={{ height: 20, width: 20, marginTop: 6 }} />}
                    primaryText={i18n.__('Copy to')}
                    onTouchTap={() => this.toggleDialog('copy')}
                  />
                  <MenuItem
                    leftIcon={<MoveIcon style={{ height: 20, width: 20, marginTop: 6 }} />}
                    primaryText={i18n.__('Move to')}
                    onTouchTap={() => this.toggleDialog('move')}
                  />
                </div>
                {
                  this.state.select && this.state.select.selected && this.state.select.selected.length === 1 &&
                    <MenuItem
                      leftIcon={<EditIcon style={{ height: 20, width: 20, marginTop: 6 }} />}
                      primaryText={i18n.__('Rename')}
                      onTouchTap={() => this.toggleDialog('rename')}
                    />
                }
                <div style={{ height: 8 }} />
                <Divider />
                <div style={{ height: 8 }} />
                <MenuItem
                  leftIcon={<InfoIcon style={{ height: 20, width: 20, marginTop: 6 }} />}
                  primaryText={getDetailStatus() ? i18n.__('Close Detail') : i18n.__('Open Detail')}
                  onTouchTap={toggleDetail}
                />
                {
                  this.state.select && this.state.select.selected && this.state.select.selected.length === 1 &&
                  this.state.entries[this.state.select.selected[0]].type === 'file' &&
                    <MenuItem
                      leftIcon={<CopyIcon style={{ height: 20, width: 20, marginTop: 6 }} />}
                      primaryText={i18n.__('Make a Copy')}
                      onTouchTap={this.dupFile}
                    />
                }
                <MenuItem
                  leftIcon={<DownloadIcon style={{ height: 20, width: 20, marginTop: 6 }} />}
                  primaryText={i18n.__('Download')}
                  onTouchTap={this.download}
                />
                <div style={{ height: 8 }} />
                <Divider />
                <div style={{ height: 8 }} />
                <MenuItem
                  leftIcon={<DeleteIcon style={{ height: 20, width: 20, marginTop: 6 }} />}
                  primaryText={i18n.__('Delete')}
                  onTouchTap={() => this.toggleDialog('delete')}
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
        />

        { this.renderMenu(this.state.contextMenuOpen, toggleDetail, getDetailStatus) }

        { this.renderDialogs(openSnackBar, navTo) }

      </div>
    )
  }
}

export default Home
