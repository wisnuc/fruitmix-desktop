import React from 'react'
import Debug from 'debug'
import UUID from 'uuid'
import { CircularProgress, RaisedButton } from 'material-ui'
import OpenIcon from 'material-ui/svg-icons/action/open-with'
import DownloadIcon from 'material-ui/svg-icons/file/file-download'
import PDFView from './PDF'
import DialogOverlay from '../common/DialogOverlay'
import FlatButton from '../common/FlatButton'
import PhotoDetail from '../photo/PhotoDetail'

const debug = Debug('component:file:preview: ')

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

    this.getRandomSrc = () => {
      this.session = UUID.v4()
      this.props.apis.pureRequest('randomSrc', { hash: this.props.item.hash }, (error, data) => {
        if (error) console.log('randomSrc error', error)
        else this.setState({ filePath: `http://${this.props.apis.address}:3000/media/random/${data.body.key}` })
        this.session = ''
      })
    }
  }

  componentDidUpdate() {
    if (!this.refVideo || !this.props.parent) return

    if (this.props.parent.style.left === '0px' && this.refVideo.paused && !this.played) {
      this.played = true
      this.refVideo.play()
    } else if (this.props.parent.style.left !== '0px') {
      this.played = false
      this.refVideo.pause()
    }
  }

  renderPhoto(hash, metadata) {
    const item = Object.assign({}, metadata, { hash })
    return (
      <PhotoDetail
        item={item}
        ipcRenderer={this.props.ipcRenderer}
        updateContainerSize={this.props.updateContainerSize}
      />
    )
  }

  renderText() {
    return (
      <div
        style={{ height: '80%', width: '80%', backgroundColor: '#FFFFFF' }}
        onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }}
      >
        <iframe
          seamless
          width="100%"
          height="100%"
          frameBorder={0}
          src={this.state.filePath}
        />
      </div>
    )
  }

  renderVideo() {
    return (
      <div
        style={{ height: '80%', width: '80%', backgroundColor: 'rgba(0,0,0,0)' }}
        onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }}
      >
        <video width="100%" height="100%" controls controlsList="nodownload" ref={ref => (this.refVideo = ref)} >
          <source src={this.state.filePath} />
        </video>
      </div>
    )
  }

  renderKnownVideo() {
    if (this.name === this.props.item.name && this.state.filePath) return this.renderVideo()

    if (!this.session) {
      this.name = this.props.item.name
      this.getRandomSrc()
      this.state = Object.assign({}, this.state, { filePath: '', pages: null })
    }

    return (<CircularProgress size={64} thickness={5} />)
  }

  renderAudio() {
    return (
      <div onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }} >
        <audio width="100%" height="100%" controls >
          <source src={this.state.filePath} />
        </audio>
      </div>
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
    return (
      <div
        style={{ height: '80%', width: '80%', overflowY: 'auto', overflowX: 'hidden' }}
        onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }}
      >
        <PDFView
          filePath={this.state.filePath}
        />
      </div>
    )
  }

  renderPreview() {
    const extension = this.props.item.name.replace(/^.*\./, '').toUpperCase()
    const textExtension = ['TXT', 'MD', 'JS', 'JSX', 'HTML', 'MP4']
    const videoExtension = ['MP4', 'MOV', 'AVI', 'MKV']
    const audioExtension = ['MP3', 'APE', 'FLAC', 'WMA']
    const isText = textExtension.findIndex(t => t === extension) > -1 && this.props.item.size < 1024 * 1024
    const isVideo = videoExtension.findIndex(t => t === extension) > -1
    const isAudio = audioExtension.findIndex(t => t === extension) > -1
    const isPDF = extension === 'PDF' && global.config.platform !== 'win32'
    // const isPDF = extension === 'PDF'

    if ((!isText && !isVideo && !isAudio && !isPDF) || this.props.item.size > 1024 * 1024 * 50) return this.renderOtherFiles()

    if (this.name === this.props.item.name && this.state.filePath) {
      return isVideo ? this.renderVideo() : isPDF ? this.renderPDF() : isAudio ? this.renderAudio() : this.renderText()
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

    const { magic, metadata, hash } = this.props.item
    const photoMagic = ['JPEG', 'GIF', 'PNG']
    const videoMagic = ['3GP', 'MP4', 'MOV']
    const isPhoto = metadata && photoMagic.includes(magic)
    const isVideo = metadata && videoMagic.includes(magic)

    debug('isPhoto, isVideo', this.props.item, isPhoto, isVideo)

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
        { isPhoto ? this.renderPhoto(hash, metadata) : isVideo ? this.renderKnownVideo() : this.renderPreview() }
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
                    label="下载"
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
