import React from 'react'
import i18n from 'i18n'
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
      if (this.props.item.size > 50 * 1024 * 1024) this.setState({ alert: true })
      else {
        const driveUUID = this.props.path[0].uuid
        const dirUUID = this.props.path[this.props.path.length - 1].uuid
        const entryUUID = this.props.item.uuid
        const fileName = this.props.item.name
        this.props.ipcRenderer.send('OPEN_FILE', {
          driveUUID,
          dirUUID,
          entryUUID,
          fileName
        })
        this.props.close()
      }
    }

    this.downloadSuccess = (event, session, path) => {
      if (this.session === session) {
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
        else this.setState({ filePath: `http://${this.props.apis.address}:3000/media/random/${data.key}` })
        this.session = ''
      })
    }

    /* download text file and read file */
    this.getTextData = () => {
      this.session = UUID.v4()
      const driveUUID = this.props.path[0].uuid
      const dirUUID = this.props.path[this.props.path.length - 1].uuid
      const entryUUID = this.props.item.uuid
      const fileName = this.props.item.name
      this.props.ipcRenderer.send('GET_TEXT_DATA', {
        session: this.session,
        driveUUID,
        dirUUID,
        entryUUID,
        fileName
      })
      this.props.ipcRenderer.on('GET_TEXT_DATA_SUCCESS', this.getTextDataSuccess)
    }

    this.getTextDataSuccess = (event, session, res) => {
      if (this.session === session) {
        clearTimeout(this.time)
        this.session = ''
        if (this.props.item.size > 1024) { // actually, filePath is the content of target file
          this.time = setTimeout(() => {
            this.setState({ filePath: res.filePath, data: res.data })
          }, 500)
        } else {
          this.setState({ filePath: res.filePath, data: res.data })
        }
      }
    }

    /* stop video buffer */
    this.addPauseEvent = (video) => {
      video.addEventListener('pause', () => {
        const playtime = video.currentTime
        const tmpSrc = video.src
        video.src = ''
        video.load()
        video.src = tmpSrc
        video.currentTime = playtime
      }, { once: true })
      video.addEventListener('play', () => {
        this.addPauseEvent(video)
      }, { once: true })
    }
  }

  componentDidMount() {
    this.forceUpdate()
  }

  componentDidUpdate() {
    if (!this.refVideo || !this.props.parent) return

    if (this.props.parent.style.left === '0px' && this.refVideo.paused && !this.played) {
      this.played = true
      this.refVideo.play()
      this.addPauseEvent(this.refVideo)
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

  renderRawText() {
    if (this.name === this.props.item.name && this.state.filePath) {
      return (
        <div
          style={{ height: '80%', width: '80%', backgroundColor: '#FFFFFF', overflowY: 'auto' }}
          onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }}
        >
          <code><pre style={{ margin: 8 }}>{ this.state.data }</pre></code>
        </div>
      )
    }

    if (!this.session) {
      this.name = this.props.item.name
      this.getTextData()
      this.state = Object.assign({}, this.state, { filePath: '', pages: null })
    }

    return (<CircularProgress size={64} thickness={5} />)
  }

  renderVideo() {
    return (
      <div
        style={{ height: '80%', width: '80%', backgroundColor: 'rgba(0,0,0,0)' }}
        onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }}
      >
        <video
          width="100%"
          height="100%"
          controls
          ref={ref => (this.refVideo = ref)}
          controlsList="nodownload"
          src={this.state.filePath}
        />
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
    // debug('this.props renderOtherFiles', this.props)
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
          { i18n.__('Can Not Preview Text')}
        </div>
        <div style={{ height: 8 }} />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <RaisedButton
            label={i18n.__('Download')}
            primary
            style={{ margin: 12 }}
            icon={<DownloadIcon />}
            onTouchTap={() => { this.props.download(); this.props.close() }}
          />
          <RaisedButton
            label={i18n.__('Open via Local App')}
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
    const textExtension = ['TXT', 'MD', 'JS', 'JSX', 'TS', 'JSON', 'HTML', 'CSS', 'LESS', 'CSV', 'XML']
    const videoExtension = ['MP4', 'MOV', 'AVI', 'MKV']
    const audioExtension = ['MP3', 'APE', 'FLAC', 'WMA']
    const isText = textExtension.findIndex(t => t === extension) > -1 && this.props.item.size < 1024 * 128
    const isVideo = videoExtension.findIndex(t => t === extension) > -1
    const isAudio = audioExtension.findIndex(t => t === extension) > -1
    const isPDF = extension === 'PDF'

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

    const extension = this.props.item.name.replace(/^.*\./, '').toUpperCase()
    const textExtension = ['TXT', 'MD', 'JS', 'JSX', 'TS', 'JSON', 'HTML', 'CSS', 'LESS', 'CSV', 'XML']
    const isText = textExtension.findIndex(t => t === extension) > -1 && this.props.item.size < 1024 * 128

    // debug('isPhoto, isVideo', this.props.item, isPhoto, isVideo, isText)

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
        {
          isPhoto ? this.renderPhoto(hash, metadata)
            : isVideo ? this.renderKnownVideo()
            : isText ? this.renderRawText()
            : this.renderPreview()
        }
        {/* dialog */}
        <DialogOverlay open={this.state.alert} >
          {
            this.state.alert &&
              <div
                style={{ width: 560, padding: '24px 24px 0px 24px' }}
                onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }}
              >
                <div style={{ fontSize: 21, fontWeight: 500 }}>
                  { i18n.__('Tips') }
                </div>
                <div style={{ height: 20 }} />
                <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14 }}>
                  { i18n.__('File Oversize Text') }
                </div>
                <div style={{ height: 24 }} />
                <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                  <FlatButton
                    label={i18n.__('Cancel')}
                    primary
                    onTouchTap={() => this.setState({ alert: false })}
                  />
                  <FlatButton
                    label={i18n.__('Download')}
                    primary
                    onTouchTap={() => { this.props.download(); this.setState({ alert: false }); this.props.close() }}
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
