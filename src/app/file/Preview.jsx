import React from 'react'
import Debug from 'debug'
import UUID from 'node-uuid'
import prettysize from 'prettysize'
import { IconButton, CircularProgress, RaisedButton } from 'material-ui'
import CheckIcon from 'material-ui/svg-icons/action/check-circle'
import DeleteIcon from 'material-ui/svg-icons/action/delete'
import DateIcon from 'material-ui/svg-icons/action/today'
import ImageIcon from 'material-ui/svg-icons/image/image'
import CameraIcon from 'material-ui/svg-icons/image/camera'
import LoactionIcon from 'material-ui/svg-icons/communication/location-on'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off'
import OpenIcon from 'material-ui/svg-icons/action/open-with'
import InfoIcon from 'material-ui/svg-icons/action/info'
import DownloadIcon from 'material-ui/svg-icons/file/file-download'
import RenderToLayer from 'material-ui/internal/RenderToLayer'
import keycode from 'keycode'
import EventListener from 'react-event-listener'
import { TweenMax } from 'gsap'
import ReactTransitionGroup from 'react-addons-transition-group'
import pdfjsLib from 'pdfjs-dist'
import PDF, { Page } from 'react-pdf-pages'
import DialogOverlay from '../common/DialogOverlay'
import FlatButton from '../common/FlatButton'
import PhotoDetail from '../photo/PhotoDetail'

pdfjsLib.PDFJS.workerSrc = './assets/pdf.worker.bundle.js'

const debug = Debug('component:photoApp:PhotoDetail')

const mousePosition = (ev) => {
  if (ev.pageX || ev.pageY) {
    return { x: ev.pageX, y: ev.pageY }
  }
  return {
    x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
    y: ev.clientY + document.body.scrollTop - document.body.clientTop
  }
}

const phaseExifTime = (time, type) => {
  const a = time.replace(/\s+/g, ':').split(':')
  const date = new Date()
  const week = ['日', '一', '二', '三', '四', '五', '六']
  date.setFullYear(a[0], a[1] - 1, a[2])
  if (type === 'date') return `${a[0]}年${a[1]}月${a[2]}日`
  if (type === 'time') return `${a[3]} : ${a[4]}`
  if (type === 'week') return `星期${week[date.getDay()]}`
  return `${a[0]}年${a[1]}月${a[2]}日 星期${week[date.getDay()]} ${a[3]} : ${a[4]}`
}

const getResolution = (height, width) => {
  let res = height * width
  if (res > 100000000) {
    res = Math.ceil(res / 100000000)
    return `${res} 亿像素 ${height} x ${width}`
  } else if (res > 10000) {
    res = Math.ceil(res / 10000)
    return `${res} 万像素 ${height} x ${width}`
  }
  return `${res} 像素 ${height} x ${width}`
}

class Preview extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      pages: null,
      alert: false
    }

    this.toggleDialog = op => this.setState({ [op]: !this.state[op] })

    this.openByLocal = () => {
      if (this.props.item.size > 50 * 1024 * 1024) return this.setState({ alert: true })
      const driveUUID = this.props.path[0].uuid
      const dirUUID = this.props.path[this.props.path.length - 1].uuid
      const entryUUID = this.props.item.uuid
      const fileName = this.props.item.name
      return this.props.ipcRenderer.send('OPEN_FILE', {
        driveUUID,
        dirUUID,
        entryUUID,
        fileName
      })
    }

    this.downloadSuccess = (event, session, path) => {
      if (this.session === session) {
        console.log('this.downloadSuccess', path)
        clearTimeout(this.time)
        this.session = ''
        if (this.props.item.size > 1024) {
          this.time = setTimeout(() => {
            this.setState({ filePath: path })
          }, 500)
        } else {
          this.setState({ filePath: path })
        }
      }
    }

    this.startDownload = () => {
      this.session = UUID.v4()
      // debug('this.startDownload', this.state, this.props)
      const driveUUID = this.props.path[0].uuid
      const dirUUID = this.props.path[this.props.path.length - 1].uuid
      const entryUUID = this.props.item.uuid
      const fileName = this.props.item.name
      this.props.ipcRenderer.send('TEMP_DOWNLOADING', {
        session: this.session,
        driveUUID,
        dirUUID,
        entryUUID,
        fileName
      })
      this.props.ipcRenderer.on('TEMP_DOWNLOAD_SUCCESS', this.downloadSuccess)
    }

  }

  renderPhoto(hash, metadata) {
    const item = Object.assign({}, metadata, { hash })
    return(
      <PhotoDetail
        item={item}
        ipcRenderer={this.props.ipcRenderer}
        updateContainerSize={this.props.updateContainerSize}
      />
    )
  }

  renderText() {
    if (this.name === this.props.item.name && this.state.filePath) {
      return (
        <div
          style={{ height: '100%', width: '61.8%', backgroundColor: '#FFFFFF' }}
          onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }}
        >
          <iframe
            src={this.state.filePath}
            seamless
            width="100%"
            height="100%"
            frameBorder={0}
          />
        </div>
      )
    }

    debug('before this.startDownload()', this.props.item.name, this.name, this.session)
    if (!this.session) {
      this.name = this.props.item.name
      this.startDownload()
      this.state = Object.assign({}, this.state, { filePath: '', pages: null })
    }
    return (
      <CircularProgress size={64} thickness={5} />
    )
  }

  renderOtherFiles() {
    debug('this.props renderOtherFiles', this.props)
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          height: 144,
          width: 360,
          backgroundColor: '#424242',
          borderRadius: '20px'
        }}
        onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }}
      >
        <div style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 500 }}>
          { '无法预览' }
        </div>
        <div style={{ height: 8 }} />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <RaisedButton
            label="下载"
            primary
            style={{ margin: 12 }}
            icon={<DownloadIcon />}
            onTouchTap={this.props.download}
          />
          <RaisedButton
            label="使用本地应用打开"
            style={{ margin: 12 }}
            icon={<OpenIcon />}
            onTouchTap={this.openByLocal}
          />
        </div>
      </div>
    )
  }

  renderPDF() {
    if (this.name === this.props.item.name && this.state.filePath) {
      return (
        <div
          style={{ height: '100%', width: '61.8%', overflowY: 'auto', overflowX: 'hidden' }}
          onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }}
        >
          <PDF url={this.state.filePath} onComplete={pages => this.setState({ pages })} onError={e => debug(e)}>
            {
              this.state.pages &&
              <div>
                { this.state.pages.map(page => <Page key={page.key} page={page} onError={e => debug(e)} />)}
              </div>
            }
          </PDF>
        </div>
      )
    }

    // debug('before this.startDownload()', this.props.item.name, this.name, this.session)
    if (!this.session) {
      this.name = this.props.item.name
      this.startDownload()
      this.state = Object.assign({}, this.state, { filePath: '', pages: null })
    }
    return (
      <CircularProgress size={64} thickness={5} />
    )
  }

  render() {
    if (!this.props.item || !this.props.item.name) return (<div />)
    const extension = this.props.item.name.replace(/^.*\./, '').toUpperCase()
    const textExtension = ['TXT', 'MD', 'JS', 'JSX', 'HTML']

    const isText = textExtension.findIndex(t => t === extension) > -1 && this.props.item.size < 1024 * 1024

    const isPDF = extension === 'PDF' && this.props.item.size < 1024 * 1024 * 50
    return (
      <div
        ref={ref => (this.refBackground = ref)}
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        { isText ? this.renderText() : this.props.item.metadata
            ? this.renderPhoto(this.props.item.hash, this.props.item.metadata) : isPDF
            ? this.renderPDF() : this.renderOtherFiles() }

        {/* dialog */}
        <DialogOverlay open={this.state.alert} >
          {
            this.state.alert &&
              <div
                style={{ width: 560, padding: '24px 24px 0px 24px' }}
                onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }}
              >
                <div style={{ fontSize: 21, fontWeight: 500 }}>
                  { '提示' }
                </div>
                <div style={{ height: 20 }} />
                <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14 }}>
                  { '该文件大于50M，建议下载后再使用本地应用打开' }
                </div>
                <div style={{ height: 24 }} />
                <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                  <FlatButton
                    label="取消"
                    primary
                    onTouchTap={() => this.setState({ alert: false })}
                  />
                  <FlatButton
                    label={'下载'}
                    primary
                    onTouchTap={() => { this.props.download(); this.setState({ alert: false }) }}
                  />
                </div>
              </div>
          }
        </DialogOverlay>
      </div>
    )
  }
}

export default Preview
