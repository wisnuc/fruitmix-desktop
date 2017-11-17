import React from 'react'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import { List, AutoSizer } from 'react-virtualized'
import { CircularProgress, FloatingActionButton, Popover, IconButton, Menu, MenuItem, TextField } from 'material-ui'
import DeleteSvg from 'material-ui/svg-icons/action/delete'
import PlaySvg from 'material-ui/svg-icons/av/play-arrow'
import PauseSvg from 'material-ui/svg-icons/av/pause'
import ContentAdd from 'material-ui/svg-icons/content/add'

import ListSelect from '../file/ListSelect'
import FlatButton from '../common/FlatButton'
import DialogOverlay from '../common/PureDialog'
import PureDialog from '../common/PureDialog'

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
  if (h > 24) return '> 24 小时'
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
      WIP: false
    }

    this.toggleDialog = op => this.setState({ [op]: !this.state[op] })

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
      this.setState({ expand: this.state.expand === index ? -1 : index })

      /* right click */
      if (button === 2) {
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

    this.openDesdroy = (e, infoHash) => {
      e.preventDefault() // important, to prevent other event
      e.stopPropagation()
      this.setState({ id: infoHash, destroy: true })
    }

    this.toggleStatus = (e, infoHash) => {
      e.preventDefault() // important, to prevent other event
      e.stopPropagation()
    }

    this.refresh = () => this.props.apis.request('BTList')

    this.isInputOK = v => v && v.length >= 60 && /^magnet:\?xt=urn:btih:/.test(v)

    this.handleChange = value => this.setState({ value })

    this.destroy = () => {
      this.setState({ WIP: true })
      this.props.apis.request('handleMagnet', { id: this.state.id, op: 'destory' }, (err) => {
        if (err) {
          console.log('destroy error', err)
          this.props.openSnackBar('删除失败！')
        } else {
          this.props.openSnackBar('删除成功！')
        }
        this.setState({ WIP: false, destroy: false })
        this.refresh()
      })
    }

    this.addMagnet = () => {
      this.setState({ WIP: true })
      this.props.apis.request('addMagnet', { magnetURL: this.state.value, downloadPath: '/home/lxw/BT' }, (err) => {
        if (err) {
          console.log('addMagnet error', err)
          this.props.openSnackBar('添加失败！')
          this.setState({ WIP: false })
        } else {
          this.props.openSnackBar('添加成功！')
          this.setState({ WIP: false, magnet: false })
        }
        this.refresh()
      })
    }
  }

  componentDidMount() {
    this.refreshTimer = setInterval(this.refresh, 1000)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.tasks && this.props.tasks !== nextProps.tasks) this.setState({ loading: false })
  }

  componentWillUnmount() {
    clearInterval(this.refreshTimer)
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
          <div style={{ color: 'rgba(0,0,0,0.27)' }}> { '请点击左上按钮添加新的下载任务' } </div>
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
          <div style={{ fontSize: 20, color: 'rgba(0,0,0,0.27)' }}> { '网络连接已断开，请检查网络设置' } </div>
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

  renderCircularProgress(progress, color, hovered, infoHash) {
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
              border: '4px solid transparent',
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
              border: '4px solid transparent',
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
            border: '4px solid #C5CAE9',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%'
          }}
        >
          {
            hovered ?
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconButton onTouchTap={e => this.toggleStatus(e, infoHash)}>
                  <PauseSvg color={this.props.primaryColor} />
                </IconButton>
              </div>
              : `${Math.round(p * 100)}%`
          }
        </div>
      </div>
    )
  }

  renderRow(task, index) {
    const { magnetURL, name, downloadPath, progress, downloadSpeed, downloaded, timeRemaining, infoHash } = task
    const selected = this.state.select.selected && this.state.select.selected.findIndex(s => s === index) > -1
    const hovered = this.state.select.hover === index
    return (
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            height: 56,
            fontSize: 14,
            backgroundColor: selected ? '#EEEEEE' : hovered ? '#F5F5F5' : ''
          }}
          onTouchTap={e => this.onRowTouchTap(e, index)}
          onMouseEnter={e => this.onRowMouseEnter(e, index)}
          onMouseLeave={e => this.onRowMouseLeave(e, index)}
        >
          {/* CircularProgress */}
          <div style={{ flex: '0 0 56px' }}>
            { this.renderCircularProgress(progress, this.props.primaryColor, hovered, infoHash) }
          </div>

          {/* task item name */}
          <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', marginLeft: 24 }} >
            <div
              style={{
                maxWidth: parseInt(window.innerWidth, 10) - 886,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: 500
              }}
            >
              { name || magnetURL }
            </div>
          </div>

          {/* speed */}
          <div style={{ flex: '0 0 120px' }}> { formatSpeed(downloadSpeed) } </div>
          <div style={{ flex: '0 0 400px' }} />
          <div style={{ flex: '0 0 90px' }} >
            {
              hovered &&
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconButton onTouchTap={e => this.openDesdroy(e, infoHash)}>
                    <DeleteSvg color={this.props.primaryColor} />
                  </IconButton>
                </div>
            }
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 96px',
            fontSize: 14,
            height: this.state.expand === index ? 72 * 1 : 0,
            overflow: 'hidden',
            transition: 'all 225ms'
          }}
        >
          {/* task item name */}
          <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', marginLeft: 24 }} >
            <div
              style={{
                maxWidth: parseInt(window.innerWidth, 10) - 886,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              { name || magnetURL }
            </div>
          </div>

          {/* progress bar */}
          <div style={{ flex: '0 0 240px' }}>
            <div
              style={{
                display: 'flex',
                width: 200,
                height: 6,
                marginRight: 12,
                marginTop: 8,
                marginBottom: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(0,0,0,.12)'
              }}
            >
              <div style={{ backgroundColor: this.props.primaryColor, width: `${progress * 100}%` }} />
              {/* size and speed */}
            </div>
            <div style={{ height: 20, width: 200, display: 'flex', alignItems: 'center' }}>
              <div> { formatSize(downloaded) } </div>
              <div style={{ flexGrow: 1 }} />
              <div> { formatSpeed(downloadSpeed) } </div>
            </div>
          </div>

          {/* percent */}
          <div style={{ flex: '0 0 60px' }}> { `${Math.round(progress * 100)}%` } </div>

          {/* Status */}
          <div style={{ flex: '0 0 120px' }}> { name ? '正在下载' : '获取信息中' } </div>

          {/* task restTime */}
          <div style={{ flex: '0 0 120px' }}>{ formatSeconds(timeRemaining / 1000) }</div>
        </div>
      </div>
    )
  }

  render() {
    debug('render BTDownload', this.state, this.props)
    /* lost connection to wisnuc */
    if (!window.navigator.onLine) return this.renderOffLine()

    /* loding */
    if (this.state.loading) return this.renderLoading()

    return (
      <div style={{ position: 'relative', height: '100%', width: '100%' }}>
        {/* FAB */}
        <FloatingActionButton
          style={{ position: 'absolute', top: -36, left: 24, zIndex: 200 }}
          secondary
          onTouchTap={(e) => {
            e.preventDefault()
            this.setState({ openFAB: true, anchorEl: e.currentTarget })
          }}
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
              primaryText="添加BT种子文件"
              leftIcon={<ContentAdd />}
              onTouchTap={() => console.log('添加BT种子文件 TODO')}
              style={{ fontSize: 13 }}
            />
            <MenuItem
              primaryText="添加磁力链接"
              leftIcon={<ContentAdd />}
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
                    { '添加磁力链接' }
                  </div>
                  <div style={{ height: 20 }} />
                  <TextField
                    floatingLabelFixed
                    floatingLabelText="请输入磁力链接地址"
                    defaultValue="magnet:?xt=urn:btih:"
                    onChange={e => this.handleChange(e.target.value)}
                    ref={input => input && input.focus()}
                    fullWidth
                    value={this.state.value}
                  />
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton
                      label="确定"
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
                <div style={{ width: 640, padding: '24px 24px 0px 24px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>
                    { '确定要删除该任务吗' }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton
                      label="取消"
                      primary
                      onTouchTap={() => this.setState({ destroy: false })}
                    />
                    <FlatButton
                      label="确定"
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
      </div>
    )
  }
}

export default BTDownload
