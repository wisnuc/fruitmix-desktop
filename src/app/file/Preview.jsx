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

class PreviewInline extends React.Component {
  constructor(props) {
    super(props)

    this.dragPosition = { x: 0, y: 0, left: 0, top: 0 }

    this.state = {
      direction: null,
      thumbPath: '',
      detailPath: '',
      pages: null
    }

    this.toggleDialog = op => this.setState({ [op]: !this.state[op] })

    this.openByLocal = () => {
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

    /* change image */
    this.request = () => {
      /* get current image */
      this.session = UUID.v4()
      const metadata = this.props.item.metadata
      if (metadata) {
        this.digest = this.props.item.digest || ''
        this.photo = this.props.item.photo || null
        // this.props.ipcRenderer.send('mediaShowThumb', this.session, this.digest, 210, 210)

        /* memoize digest */
        // this.props.memoize({ currentDigest: this.digest, currentScrollTop: 0 })

        /* init image */
        this.setState({ thumbPath: '', detailPath: '' })

        // debug('this.props.memoize', this.props.memoize())
      }
    }

    /* update detail image */
    this.updatePath = (event, session, path) => {
      if (this.session === session) {
        clearTimeout(this.time)
        this.time = setTimeout(() => {
          this.refTransition.style.transform = this.degRotate
          this.setState({ detailPath: path })
        }, 150)
      }
    }

    /* update thumbnail */
    this.updateThumbPath = (event, session, path) => {
      if (this.session === session) {
        /* get detail image */
        this.props.ipcRenderer.send('mediaShowImage', this.session, this.digest)

        /* update thumbPath */
        this.setState({ thumbPath: path, detailPath: '' })
      }
    }

    /* calculate positon of mouse */
    this.calcPositon = (ev) => {
      return null
      /* hide change image button when zoom */
      if (this.refDetailImage && this.refDetailImage.style.zoom > 1) {
        this.refBackground.style.cursor = 'default'
        if (this.state.direction !== null) this.setState({ direction: null })
      }

      const { x, y } = mousePosition(ev)
      const clientWidth = this.props.detailInfo ? window.innerWidth - 360 : window.innerWidth
    }

    /* calculate size of image */
    this.calcSize = () => {
      this.clientHeight = window.innerHeight
      this.clientWidth = this.props.detailInfo ? window.innerWidth - 360 : window.innerWidth

      /* handle the exifOrientation */
      this.exifOrientation = this.photo.metadata.exifOrientation || 1
      this.degRotate = ''
      if (this.exifOrientation) {
        this.degRotate = `rotate(${(this.exifOrientation - 1) * 90}deg)`
      }

      if (this.exifOrientation % 2) {
        this.photoHeight = this.photo.metadata.height
        this.photoWidth = this.photo.metadata.width
      } else {
        this.photoHeight = this.photo.metadata.width
        this.photoWidth = this.photo.metadata.height
      }

      const HWRatio = this.photoHeight / this.photoWidth
      if (this.photoHeight > this.clientHeight) {
        this.photoHeight = this.clientHeight
        this.photoWidth = this.photoHeight / HWRatio
        if (this.photoWidth > this.clientWidth) {
          this.photoWidth = this.clientWidth
          this.photoHeight = this.photoWidth * HWRatio
        }
      } else if (this.photoWidth > this.clientWidth) {
        this.photoWidth = this.clientWidth
        this.photoHeight = this.photoWidth * HWRatio
      }
      if (this.refContainer) {
        this.refContainer.style.height = `${this.photoHeight}px`
        this.refContainer.style.width = `${this.photoWidth}px`
      }
    }

    /* animation */
    this.animation = (status) => {
      const transformItem = this.refReturn
      const root = this.refRoot
      const overlay = this.refOverlay
      const time = 0.2
      const ease = global.Power4.easeOut

      if (status === 'In') {
        TweenMax.from(overlay, time, { opacity: 0, ease })
        TweenMax.from(transformItem, time, { rotation: 180, opacity: 0, ease })
        TweenMax.from(root, time, { opacity: 0, ease })
      }

      if (status === 'Out') {
        TweenMax.to(overlay, time, { opacity: 0, ease })
        TweenMax.to(transformItem, time, { rotation: 180, opacity: 0, ease })
        TweenMax.to(root, time, { opacity: 0, ease })
      }
    }

    /* handle zoom image */
    this.handleZoom = (event) => {
      if (this.refDetailImage) {
        if (this.state.thumbPath) this.setState({ thumbPath: '' })
        let zoom = this.refDetailImage.style.zoom
        zoom *= 0.6 + (event.wheelDelta + 240) / 600
        if (zoom <= 1) {
          zoom = 1
          this.refTransition.style.transform = this.degRotate
          this.dragPosition.left = 0
          this.dragPosition.top = 0
        } else if (zoom > 10000) {
          zoom = 10000
        } else {
          this.dragPosition.left *= 0.6 + (event.wheelDelta + 240) / 600
          this.dragPosition.top *= 0.6 + (event.wheelDelta + 240) / 600

          /* calculate the size diff between photo and client */
          const width = (this.photoWidth * zoom - this.clientWidth) / 2
          const height = (this.photoHeight * zoom - this.clientHeight) / 2

          /* the photo can't be move to outside of client */
          if (width > 0 && this.dragPosition.left < -width) this.dragPosition.left = -width
          if (width > 0 && this.dragPosition.left > width) this.dragPosition.left = width

          if (height > 0 && this.dragPosition.top < -height) this.dragPosition.top = -height
          if (height > 0 && this.dragPosition.top > height) this.dragPosition.top = height

          /* when the photo is smaller than client, it can't be move */
          if (width < 0) this.dragPosition.left = 0
          if (height < 0) this.dragPosition.top = 0

          this.refTransition.style.transform = `translate(${this.dragPosition.left}px,${this.dragPosition.top}px) ${this.degRotate}`
        }
        // debug('onMouseWheel', event.wheelDelta, zoom)
        this.refContainer.style.overflow = ''
        this.refDetailImage.style.zoom = zoom
      }
    }

    /* handle drag image when zoom */
    this.dragImage = (event) => {
      // debug('this.dragImage before', this.degRotate)
      const zoom = event.target.style.zoom
      if (zoom > 1 && this.state.drag) {
        const style = this.refTransition.style

        /* calculate the size diff between photo and client */
        const width = (this.photoWidth * zoom - this.clientWidth) / 2
        const height = (this.photoHeight * zoom - this.clientHeight) / 2

        this.dragPosition.left += this.dragPosition.x ? event.clientX - this.dragPosition.x : 0
        this.dragPosition.top += this.dragPosition.y ? event.clientY - this.dragPosition.y : 0

        /* the photo can't be move to outside of client */
        if (width > 0 && this.dragPosition.left < -width) this.dragPosition.left = -width
        if (width > 0 && this.dragPosition.left > width) this.dragPosition.left = width

        if (height > 0 && this.dragPosition.top < -height) this.dragPosition.top = -height
        if (height > 0 && this.dragPosition.top > height) this.dragPosition.top = height

        /* when the photo is smaller than client, it can't be move */
        if (width < 0) this.dragPosition.left = 0
        if (height < 0) this.dragPosition.top = 0

        /* memoize last position */
        this.dragPosition.x = event.clientX
        this.dragPosition.y = event.clientY

        /* move photo */
        style.transform = `translate(${this.dragPosition.left}px,${this.dragPosition.top}px) ${this.degRotate}`
        // debug('this.dragImage', width, height, this.dragPosition.left, this.dragPosition.top)
      }
    }
  }

  componentWillMount() {
    // this.request()
  }

  componentDidMount() {
    this.props.ipcRenderer.on('donwloadMediaSuccess', this.updatePath)
    this.props.ipcRenderer.on('getThumbSuccess', this.updateThumbPath)
    // this.refContainer.addEventListener('mousewheel', this.handleZoom)
  }

  componentWillUnmount() {
    clearTimeout(this.enterTimeout)
    clearTimeout(this.leaveTimeout)
    // this.refContainer.removeEventListener('mousewheel', this.handleZoom)
    this.props.ipcRenderer.removeListener('getThumbSuccess', this.updateThumbPath)
    this.props.ipcRenderer.removeListener('donwloadMediaSuccess', this.updatePath)
    this.props.ipcRenderer.send('mediaHideThumb', this.session)
    this.props.ipcRenderer.send('mediaHideImage', this.session)
  }

  /* ReactTransitionGroup */

  componentWillEnter(callback) {
    this.componentWillAppear(callback)
  }

  componentWillAppear(callback) {
    // this.animation('In')
    this.enterTimeout = setTimeout(callback, 200) // matches transition duration
  }

  componentWillLeave(callback) {
    // this.animation('Out')
    this.leaveTimeout = setTimeout(callback, 200) // matches transition duration
  }

  renderPhoto() {
    /* calculate photoHeight and photoWidth */
    // this.calcSize()
    // <EventListener target="window" onKeyUp={this.handleKeyUp} />
    return (
      <div
        ref={ref => (this.refContainer = ref)}
        onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          transition: 'all 200ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'
        }}
      >
        { !this.state.thumbPath && !this.state.detailPath && <CircularProgress /> }
        {/* ThumbImage */}
        <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
          {
            this.state.thumbPath &&
              <img
                height={this.photoHeight}
                width={this.photoWidth}
                alt="ThumbImage"
                src={this.state.thumbPath}
              />
          }
        </div>

        {/* DetailImage */}
        <div
          style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          ref={ref => (this.refTransition = ref)}
        >
          {
            this.state.detailPath &&
              <img
                height={this.exifOrientation % 2 === 0 ? this.photoWidth : this.photoHeight}
                width={this.exifOrientation % 2 === 0 ? this.photoHeight : this.photoWidth}
                alt="DetailImage"
                src={this.state.detailPath}
                ref={ref => (this.refDetailImage = ref)}
                style={{ zoom: 1, transition: 'translate .5s cubic-bezier(0.0, 0.0, 0.2, 1)' }}
                onMouseDown={() => this.setState({ drag: true })}
                onMouseUp={() => { this.setState({ drag: false }); this.dragPosition.x = 0; this.dragPosition.y = 0 }}
                onMouseMove={this.dragImage}
                onMouseLeave={() => { this.setState({ drag: false }); this.dragPosition.x = 0; this.dragPosition.y = 0 }}
                draggable={false}
              />
          }
        </div>
      </div>
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
    // debug('render Preview', this.props.item.name)

    const isText = textExtension.findIndex(t => t === extension) > -1 && this.props.item.size < 1024 * 1024

    const isPDF = extension === 'PDF'
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
        { isText ? this.renderText() : this.props.item.metatdata ? this.renderPhoto() : isPDF ? this.renderPDF() : this.renderOtherFiles() }
      </div>
    )
  }
}

/*
 * Use ReactTransitionGroup to handle animation
*/

class Preview extends React.Component {
  render() {
    return (
      <ReactTransitionGroup>
        <PreviewInline {...this.props} />
      </ReactTransitionGroup>
    )
  }
}

export default Preview
