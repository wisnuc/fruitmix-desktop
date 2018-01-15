import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import { List, AutoSizer } from 'react-virtualized'
import { CircularProgress, FloatingActionButton, Popover, IconButton, Menu, MenuItem, TextField } from 'material-ui'
import DeleteSvg from 'material-ui/svg-icons/action/delete'
import PlaySvg from 'material-ui/svg-icons/av/play-arrow'
import PauseSvg from 'material-ui/svg-icons/av/pause'
import ContentAdd from 'material-ui/svg-icons/content/add'
import ErrorIcon from 'material-ui/svg-icons/alert/error'

import ListSelect from '../file/ListSelect'
import FlatButton from '../common/FlatButton'
import DialogOverlay from '../common/PureDialog'
import ContextMenu from '../common/ContextMenu'
import { BTTorrentIcon, BTMagnetIcon } from '../common/Svg'
import { formatTime } from '../common/datetime'

const debug = Debug('component:download:')

const formatSize = (s) => {
  const size = parseFloat(s, 10)
  if (!size) return `${0} KB`
  if (size < 1024) return `${size.toFixed(2)} B`
  else if (size < (1024 * 1024)) return `${(size / 1024).toFixed(2)} KB`
  else if (size < (1024 * 1024 * 1024)) return `${(size / 1024 / 1024).toFixed(2)} MB`
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
}

const formatSpeed = size => `${formatSize(size)}/s`

const formatSeconds = (seconds) => {
  if (!seconds || seconds === Infinity || seconds === -Infinity) return '- - : - - : - -'
  let s = parseInt(seconds, 10)
  let m = 0
  let h = 0
  if (s > 60) {
    m = parseInt(s / 60)
    s = parseInt(s % 60)
    if (m > 60) {
      h = parseInt(m / 60)
      m = parseInt(m % 60)
    }
  }
  if (h.toString().length === 1) h = `0${h}`
  if (m.toString().length === 1) m = `0${m}`
  if (s.toString().length === 1) s = `0${s}`
  if (h > 24) return i18n.__('More Than 24 Hours')
  return `${h} : ${m} : ${s}`
}

class BTDownload extends React.Component {
  constructor(props) {
    super(props)

    /* handle select TODO */
    this.select = new ListSelect(this)
    this.select.on('updated', next => this.setState({ select: next }))


    this.state = {
      select: this.select.state,
      loading: true,
      errorText: '',
      contextMenuOpen: false,
      contextMenuX: -1,
      contextMenuY: -1,
      WIP: false
    }

    this.toggleDialog = op => this.setState({ [op]: !this.state[op] })

    this.showContextMenu = (clientX, clientY) => {
      this.setState({
        contextMenuOpen: true,
        contextMenuX: clientX,
        contextMenuY: clientY
      })
    }

    this.hideContextMenu = () => {
      this.setState({
        contextMenuOpen: false,
        contextMenuX: -1,
        contextMenuY: -1
      })
    }

    /* cathc key action */
    this.keyDown = (e) => {
      if (e.ctrlKey && e.key === 'a') {
        this.select.addByArray(Array.from({ length: this.props.tasks.length }, (v, i) => i)) // [0, 1, ..., N]
      }
      if (e.key === 'Delete') this.toggleDialog('destroy')
      this.select.keyEvent(e.ctrlKey, e.shiftKey)
    }

    this.keyUp = e => this.select.keyEvent(e.ctrlKey, e.shiftKey)

    this.onRowTouchTap = (e, index) => {
      /*
       * using e.nativeEvent.button instead of e.nativeEvent.which
       * 0 - left
       * 1 - middle
       * 2 - right
       * e.type must be mouseup
       * must be button 1 or button 2 of mouse
       */

      e.preventDefault() // important, to prevent other event
      e.stopPropagation()

      const type = e.type
      const button = e.nativeEvent.button
      if (type !== 'mouseup' || !(button === 0 || button === 2)) return

      /* just touch */
      this.select.touchTap(button, index)
      // this.setState({ expand: this.state.expand === index ? -1 : index })

      /* right click */
      if (button === 2 && index !== -1) {
        this.showContextMenu(e.nativeEvent.clientX, e.nativeEvent.clientY)
      }
    }

    this.onRowMouseEnter = (e, index) => {
      this.select.mouseEnter(index)
    }

    this.onRowMouseLeave = (e, index) => {
      this.deferredLeave = setTimeout(() => this.select.mouseLeave(index), 1)
    }

    /* actions */
    this.openDestroy = (e, infoHash) => {
      e.preventDefault() // important, to prevent other event
      e.stopPropagation()
      this.setState({ ids: infoHash, destroy: true })
      this.hideContextMenu()
    }

    this.toggleStatus = (e, infoHash, isPause) => {
      e.preventDefault() // important, to prevent other event
      e.stopPropagation()
      this.props.apis.request('handleMagnet', { op: isPause ? 'resume' : 'pause', id: infoHash }, (err) => {
        if (err) {
          this.props.openSnackBar(i18n.__('Operation Failed'))
        } else {
          this.props.openSnackBar(i18n.__('Operation Success'))
        }
        this.refresh()
      })
    }

    this.refresh = () => this.props.apis.request('BTList')

    this.isInputOK = v => v && v.length >= 60 && /^magnet:\?xt=urn:btih:/.test(v) && !this.state.errorText

    this.handleChange = value => this.setState({ value, errorText: '' })

    this.destroyAsync = async (ids) => {
      console.log('this.destroyAsync', ids)
      for (let i = 0; i < ids.length; i++) {
        await this.props.apis.requestAsync('handleMagnet', { id: ids[i], op: 'destroy' })
      }
    }

    this.destroy = () => {
      this.setState({ WIP: true })
      this.destroyAsync(this.state.ids).then(() => {
        this.props.openSnackBar(i18n.__('Delete Success'))
        this.setState({ WIP: false, destroy: false })
        this.refresh()
      }).catch((err) => {
        console.log('destroy error', err)
        this.props.openSnackBar(i18n.__('Delete Failed'))
      })
    }

    this.addMagnet = () => {
      this.setState({ WIP: true })
      this.props.apis.request('addMagnet', { magnetURL: this.state.value, dirUUID: this.state.dirUUID }, (err) => {
        if (err) {
          console.log('addMagnet error', err)
          let errorText
          if (err.response && err.response.message === 'torrent exist') errorText = i18n.__('Task Exist')
          else errorText = i18n.__('Add Magnet Failed')

          this.setState({ WIP: false, errorText })
        } else {
          this.props.openSnackBar(i18n.__('Add Magnet Success'))
          this.setState({ WIP: false, magnet: false, value: 'magnet:?xt=urn:btih:' })
        }
        this.refresh()
      })
    }

    this.mkdirAsync = async () => {
      const driveUUID = this.props.apis.drives.data.find(d => d.tag === 'home').uuid
      const stationID = this.props.selectedDevice.token.data.stationID
      const data = await this.props.apis.requestAsync('mkdir', {
        driveUUID,
        dirUUID: driveUUID,
        dirname: i18n.__('BT Download Folder Name')
      })
      const dirUUID = stationID ? data.uuid : data[0].data.uuid
      return ({ driveUUID, dirUUID })
    }

    this.openFAB = (event) => {
      event.preventDefault()
      const anchorEl = event.currentTarget
      if (!window.navigator.onLine) return this.props.openSnackBar(i18n.__('Offline Text'))
      this.mkdirAsync().then(({ driveUUID, dirUUID }) => {
        this.setState({ openFAB: true, anchorEl, driveUUID, dirUUID })
      }).catch((e) => {
        console.log(e)
        if (e && e.response && e.response[0] && e.response[0].error.code === 'EEXIST') {
          this.props.openSnackBar(i18n.__('Download Folder EEXIST Text'))
        } else this.props.openSnackBar(i18n.__('BT Start Failed'))
      })
    }

    this.addTorrent = () => {
      this.props.ipcRenderer.send('ADD_TORRENT', { dirUUID: this.state.dirUUID })
      this.setState({ openFAB: false })
      this.refresh()
    }

    this.showFolder = () => {
      const driveUUID = this.props.apis.drives.data.find(d => d.tag === 'home').uuid
      const dirUUID = this.props.tasks[this.state.select.selected[0]].dirUUID
      this.props.navToDrive(driveUUID, dirUUID)
    }
  }

  componentDidMount() {
    this.refreshTimer = setInterval(this.refresh, 1000)
    /* bind keydown event */
    document.addEventListener('keydown', this.keyDown)
    document.addEventListener('keyup', this.keyUp)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.tasks && this.props.tasks !== nextProps.tasks) this.setState({ loading: false })
  }

  componentWillUnmount() {
    clearInterval(this.refreshTimer)
    /* remove keydown event */
    document.removeEventListener('keydown', this.keyDown)
    document.removeEventListener('keyup', this.keyUp)
  }

  renderNoTasks() {
    return (
      <div
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onTouchTap={e => this.onRowTouchTap(e, -1)}
      >
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
          <ContentAdd style={{ height: 64, width: 64, color: 'rgba(0,0,0,0.27)' }} />
          <div style={{ color: 'rgba(0,0,0,0.27)' }}> { i18n.__('No BT Task Text') } </div>
        </div>
      </div>
    )
  }

  renderDisabled() {
    return (
      <div
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onTouchTap={e => this.onRowTouchTap(e, -1)}
      >
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
          <ErrorIcon style={{ height: 64, width: 64, color: 'rgba(0,0,0,0.27)' }} />
          <div style={{ fontSize: 20, color: 'rgba(0,0,0,0.27)' }}> { i18n.__('No BT Service Text')} </div>
        </div>
      </div>
    )
  }

  renderOffLine() {
    return (
      <div
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onTouchTap={e => this.onRowTouchTap(e, -1)}
      >
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
          <ErrorIcon style={{ height: 64, width: 64, color: 'rgba(0,0,0,0.27)' }} />
          <div style={{ fontSize: 20, color: 'rgba(0,0,0,0.27)' }}> { i18n.__('Offline Text')} </div>
        </div>
      </div>
    )
  }

  renderLoading() {
    return (
      <div style={{ width: '100%', height: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <CircularProgress size={32} thickness={3} />
      </div>
    )
  }

  renderCircularProgress(progress, color, hovered, infoHash, isPause) {
    const p = progress > 1 ? 1 : progress < 0 ? 0 : progress
    const rightDeg = Math.min(45, p * 360 - 135)
    const leftDeg = Math.max(45, p * 360 - 135)
    return (
      <div style={{ width: 56, height: 56, position: 'relative' }}>
        {/* right circular */}
        <div style={{ width: 22, height: 44, marginLeft: 28, marginTop: 6, position: 'absolute', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 36,
              height: 36,
              transform: `rotate(${rightDeg}deg)`,
              border: '4px solid #C5CAE9',
              borderTop: `4px solid ${color}`,
              borderRight: `4px solid ${color}`,
              borderRadius: '50%'
            }}
          />
        </div>

        {/* left circular */}
        <div style={{ width: 22, height: 44, marginLeft: 6, marginTop: 6, position: 'absolute', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 36,
              height: 36,
              transform: `rotate(${leftDeg}deg)`,
              border: '4px solid #C5CAE9',
              borderTop: `4px solid ${color}`,
              borderRight: `4px solid ${color}`,
              borderRadius: '50%'
            }}
          />
        </div>

        {/* process and action */}
        <div
          style={{
            position: 'absolute',
            top: 6,
            left: 6,
            width: 36,
            height: 36,
            border: '4px solid transparent',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%'
          }}
        >
          {
            hovered && !this.props.alt ?
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconButton
                  onTouchTap={e => this.toggleStatus(e, infoHash, isPause)}
                  tooltip={isPause ? i18n.__('Resume') : i18n.__('Pause')}
                >
                  { isPause ? <PlaySvg color={this.props.primaryColor} /> : <PauseSvg color={this.props.primaryColor} /> }
                </IconButton>
              </div>
              : `${Math.round(p * 100)}%`
          }
        </div>
      </div>
    )
  }

  renderRow(task, index) {
    const { magnetURL, name, progress, downloadSpeed, downloaded, timeRemaining, infoHash, isPause, numPeers, finishTime } = task
    const selected = this.state.select.selected && this.state.select.selected.findIndex(s => s === index) > -1
    const hovered = this.state.select.hover === index
    return (
      <div
        key={index.toString()}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          height: 56,
          fontSize: 14,
          backgroundColor: selected ? '#EEEEEE' : hovered ? '#F5F5F5' : ''
        }}
        onTouchTap={e => this.onRowTouchTap(e, index)}
        onDoubleClick={() => this.props.alt && this.showFolder()}
        onMouseEnter={e => this.onRowMouseEnter(e, index)}
        onMouseLeave={e => this.onRowMouseLeave(e, index)}
      >
        {/* CircularProgress */}
        <div style={{ flex: '0 0 56px' }}>
          { this.renderCircularProgress(progress, this.props.primaryColor, hovered, infoHash, isPause) }
        </div>

        {/* task item name */}
        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', marginLeft: 24 }} >
          <div
            style={{
              maxWidth: parseInt(window.innerWidth, 10) - 1086,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: 500
            }}
          >
            { name || magnetURL }
          </div>
        </div>


        <div style={{ flex: '0 0 40px' }} />
        {/* Downloaded size */}
        <div style={{ flex: '0 0 160px' }}> { `${formatSize(downloaded)} / ${formatSize(downloaded / progress)}` } </div>

        {/* speed */}
        <div style={{ flex: '0 0 120px' }}> { !isPause && !this.props.alt && formatSpeed(downloadSpeed) } </div>

        {/* number of peers */}

        <div style={{ flex: '0 0 120px' }}> { !isPause && !this.props.alt && i18n.__n('Number of Peers %s', numPeers) } </div>

        {/* Status */}
        <div style={{ flex: '0 0 160px' }}>
          { this.props.alt ? i18n.__('Finished') : isPause ? i18n.__('Task Paused') :
            name ? i18n.__('Task Downloading') : i18n.__('Getting Info') }
        </div>

        {/* task restTime */}
        <div style={{ flex: '0 0 160px' }}>
          { this.props.alt ? formatTime(finishTime) : isPause ? '- - : - - : - -' : formatSeconds(timeRemaining / 1000) }
        </div>
        <div style={{ flex: '0 0 90px' }} >
          {
            hovered &&
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconButton onTouchTap={e => this.openDestroy(e, [infoHash])} tooltip={i18n.__('Delete')}>
                  <DeleteSvg color={this.props.primaryColor} />
                </IconButton>
              </div>
          }
        </div>
      </div>
    )
  }

  render() {
    // debug('render BTDownload', this.state, this.props)
    /* lost connection to wisnuc */
    if (!window.navigator.onLine) return this.renderOffLine()

    if (this.props.disabled) return this.renderDisabled()

    /* loding */
    if (this.state.loading) return this.renderLoading()

    return (
      <div style={{ position: 'relative', height: '100%', width: '100%' }} onTouchTap={e => this.onRowTouchTap(e, -1)} >
        {/* FAB */}
        <FloatingActionButton
          style={{ position: 'absolute', top: -36, left: 24, zIndex: 200 }}
          secondary
          onTouchTap={e => this.openFAB(e)}
        >
          <ContentAdd />
        </FloatingActionButton>
        <Popover
          open={this.state.openFAB}
          animated
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={() => this.setState({ openFAB: false })}
        >
          <Menu style={{ minWidth: 240 }}>
            <MenuItem
              primaryText={i18n.__('Add Torrent')}
              leftIcon={<BTTorrentIcon />}
              onTouchTap={() => this.addTorrent()}
              style={{ fontSize: 13 }}
            />
            <MenuItem
              primaryText={i18n.__('Add Magnet')}
              leftIcon={<BTMagnetIcon />}
              onTouchTap={() => this.setState({ magnet: true, openFAB: false })}
              style={{ fontSize: 13 }}
            />
          </Menu>
        </Popover>

        {/* Add magnet Dialog */}
        <DialogOverlay open={!!this.state.magnet} onRequestClose={() => this.setState({ magnet: false })}>
          <div>
            {
              this.state.magnet &&
                <div style={{ width: 640, padding: '24px 24px 0px 24px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>
                    { i18n.__('Add Magnet') }
                  </div>
                  <div style={{ height: 20 }} />
                  <TextField
                    floatingLabelFixed
                    floatingLabelText={i18n.__('Add Magnet Label')}
                    defaultValue="magnet:?xt=urn:btih:"
                    onChange={e => this.handleChange(e.target.value)}
                    errorText={this.state.errorText}
                    ref={input => input && input.focus()}
                    fullWidth
                    value={this.state.value}
                  />
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton
                      label={i18n.__('Confirm')}
                      disabled={!this.isInputOK(this.state.value) || this.state.WIP}
                      primary
                      onTouchTap={this.addMagnet}
                    />
                  </div>
                </div>
            }
          </div>
        </DialogOverlay>

        {/* Delete Tasks Dialog */}
        <DialogOverlay open={!!this.state.destroy} onRequestClose={() => this.setState({ destroy: false })}>
          <div>
            {
              this.state.destroy &&
                <div style={{ width: 376, padding: '24px 24px 0px 24px' }}>
                  <div>
                    { i18n.__('Delete Task Text') }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton
                      label={i18n.__('Cancel')}
                      primary
                      onTouchTap={() => this.setState({ destroy: false })}
                    />
                    <FlatButton
                      label={i18n.__('Delete')}
                      disabled={this.state.WIP}
                      primary
                      onTouchTap={this.destroy}
                    />
                  </div>
                </div>
            }
          </div>
        </DialogOverlay>


        <div style={{ height: 48 }} />
        {/* list */}
        <div style={{ overflowY: 'auto', width: '100%', height: 'calc(100% - 48px)' }}>
          {
            (this.props.tasks && !this.props.tasks.length)
            ? this.renderNoTasks()
            : this.props.tasks.map((task, index) => this.renderRow(task, index))
          }
        </div>

        <ContextMenu
          open={this.state.contextMenuOpen}
          top={this.state.contextMenuY}
          left={this.state.contextMenuX}
          onRequestClose={this.hideContextMenu}
        >
          {
            this.state.select.selected && this.state.select.selected.length === 1 &&
              <MenuItem primaryText={i18n.__('Show in Folder')} onTouchTap={this.showFolder} />
          }
          <MenuItem
            primaryText={i18n.__('Delete')}
            onTouchTap={e => this.openDestroy(e, this.state.select.selected.map(i => this.props.tasks[i].infoHash))}
          />
        </ContextMenu>
      </div>
    )
  }
}

export default BTDownload
