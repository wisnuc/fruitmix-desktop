import React from 'react'
import Debug from 'debug'
import UUID from 'node-uuid'
import prettysize from 'prettysize'
import { IconButton } from 'material-ui'
import CheckIcon from 'material-ui/svg-icons/action/check-circle'
import DeleteIcon from 'material-ui/svg-icons/action/delete'
import DateIcon from 'material-ui/svg-icons/action/today'
import ImageIcon from 'material-ui/svg-icons/image/image'
import CameraIcon from 'material-ui/svg-icons/image/camera'
import LoactionIcon from 'material-ui/svg-icons/communication/location-on'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off'
import InfoIcon from 'material-ui/svg-icons/action/info'
import DownloadIcon from 'material-ui/svg-icons/file/file-download'
import RenderToLayer from 'material-ui/internal/RenderToLayer'
import keycode from 'keycode'
import EventListener from 'react-event-listener'
import { TweenMax } from 'gsap'
import ReactTransitionGroup from 'react-addons-transition-group'
import DialogOverlay from '../common/DialogOverlay'
import FlatButton from '../common/FlatButton'
import Map from '../common/map'

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

class PhotoDetailInline extends React.Component {
  constructor(props) {
    super(props)

    this.digest = this.props.items[this.props.seqIndex][0]

    this.dragPosition = { x: 0, y: 0, left: 0, top: 0 }

    this.state = {
      selected: this.props.selectedItems.findIndex(item => item === this.digest) >= 0,
      direction: null,
      hideDialog: false,
      deleteDialog: false,
      detailInfo: false,
      thumbPath: '',
      detailPath: ''
    }

    this.toggleDialog = op => this.setState({ [op]: !this.state[op] })

    this.currentIndex = this.props.seqIndex

    this.selectPhoto = () => {
      if (this.state.selected) {
        this.setState({ selected: false }, () => this.props.removeListToSelection(this.digest))
      } else {
        this.setState({ selected: true }, () => this.props.addListToSelection(this.digest))
      }
    }

    this.close = () => {
      this.props.onRequestClose()
    }

    /* change image */
    this.requestNext = (currentIndex) => {
      /* get current image */
      this.session = UUID.v4()
      this.digest = this.props.items[currentIndex][0]
      this.photo = this.props.items[currentIndex][1]
      this.props.ipcRenderer.send('mediaShowThumb', this.session, this.digest, 210, 210)

      /* memoize digest */
      this.props.memoize({ currentDigest: this.digest, currentScrollTop: 0 })

      /* init image */
      this.setState({ thumbPath: '', detailPath: '' })

      // debug('this.props.memoize', this.props.memoize())
    }

    this.changeIndex = (direction) => {
      if (direction === 'right' && this.currentIndex < this.props.items.length - 1) {
        this.currentIndex += 1
      } else if (direction === 'left' && this.currentIndex > 0) {
        this.currentIndex -= 1
      } else return
      this.requestNext(this.currentIndex)
      this.digest = this.props.items[this.currentIndex][0]
      this.setState({
        selected: this.props.selectedItems.findIndex(item => item === this.digest) >= 0
      })
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
      /* hide change image button when zoom */
      if (this.refDetailImage && this.refDetailImage.style.zoom > 1) {
        this.refBackground.style.cursor = 'default'
        if (this.state.direction !== null) this.setState({ direction: null })
        return
      }

      const { x, y } = mousePosition(ev)
      const clientWidth = this.state.detailInfo ? window.innerWidth - 360 : window.innerWidth

      if (this.currentIndex > 0 && x < clientWidth * 0.3 && y > 96) {
        this.refBackground.style.cursor = 'pointer'
        if (this.state.direction !== 'left') this.setState({ direction: 'left' })
      } else if (this.currentIndex < this.props.items.length - 1 && x > clientWidth * 0.7 && y > 96) {
        this.refBackground.style.cursor = 'pointer'
        if (this.state.direction !== 'right') this.setState({ direction: 'right' })
      } else {
        this.refBackground.style.cursor = 'default'
        if (this.state.direction !== null) this.setState({ direction: null })
      }
    }

    /* calculate size of image */
    this.calcSize = () => {
      this.clientHeight = window.innerHeight
      this.clientWidth = this.state.detailInfo ? window.innerWidth - 360 : window.innerWidth

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

    this.handleKeyUp = (event) => {
      // debug('this.handleKeyUp', keycode(event))
      switch (keycode(event)) {
        case 'esc': return this.close()
        case 'left': return this.changeIndex('left')
        case 'right': return this.changeIndex('right')
        default: return null
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
    this.requestNext(this.props.seqIndex)
  }

  componentDidMount() {
    this.props.ipcRenderer.on('donwloadMediaSuccess', this.updatePath)
    this.props.ipcRenderer.on('getThumbSuccess', this.updateThumbPath)
    this.refContainer.addEventListener('mousewheel', this.handleZoom)
  }

  componentWillUnmount() {
    clearTimeout(this.enterTimeout)
    clearTimeout(this.leaveTimeout)
    this.refContainer.removeEventListener('mousewheel', this.handleZoom)
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
    this.props.setAnimation('NavigationMenu', 'Out')
    if (this.props.selectedItems.length > 0) this.props.setAnimation2('ClearSelected', 'Out')
    this.animation('In')
    this.enterTimeout = setTimeout(callback, 200) // matches transition duration
  }

  componentWillLeave(callback) {
    this.props.setAnimation('NavigationMenu', 'In')
    if (this.props.selectedItems.length > 0) this.props.setAnimation2('ClearSelected', 'In')
    this.animation('Out')
    this.leaveTimeout = setTimeout(callback, 200) // matches transition duration
  }

  renderDetail() {
    /* calculate photoHeight and photoWidth */
    this.calcSize()
    return (
      <div
        style={{
          position: 'fixed',
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* add EventListener to listen keyup */}
        <EventListener target="window" onKeyUp={this.handleKeyUp} />
        <div
          ref={ref => (this.refContainer = ref)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            height: 0,
            width: 0,
            backgroundColor: 'black',
            overflow: 'hidden',
            transition: 'all 200ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'
          }}
        >
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
      </div>
    )
  }

  renderInfo() {
    debug('renderInfo', this.props.items.length, this.photo)
    const { exifDateTime, exifModel, exifMake, height, width, size } = this.photo.metadata

    const seed = (parseInt(this.digest.slice(0, 3), 16) - 4096) / 2048
    const longitude = Math.round((121 + seed) * 10000) / 10000
    const latitude = Math.round((31 + seed) * 10000) / 10000

    return (
      <div style={{ padding: '0px 32px 0px 32px', width: 296 }}>
        <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.54)', height: 48, display: 'flex', alignItems: 'center' }}> 详情 </div>
        { exifDateTime &&
        <div style={{ height: 72, display: 'flex', alignItems: 'center' }}>
          <DateIcon color="rgba(0,0,0,0.54)" />
          <div style={{ marginLeft: 64 }}>
            <div style={{ color: 'rgba(0,0,0,0.87)', lineHeight: '24px' }}>
              { phaseExifTime(exifDateTime, 'date') }
            </div>
            <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14, lineHeight: '20px' }}>
              { `${phaseExifTime(exifDateTime, 'week')}  ${phaseExifTime(exifDateTime, 'time')}` }
            </div>
          </div>
        </div>
        }
        { height && width && size &&
        <div style={{ height: 72, display: 'flex', alignItems: 'center' }}>
          <ImageIcon color="rgba(0,0,0,0.54)" />
          <div style={{ marginLeft: 64 }}>
            <div style={{ color: 'rgba(0,0,0,0.87)', lineHeight: '24px' }}>
              { this.digest.slice(0, 9) }
            </div>
            <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14, lineHeight: '20px' }}>
              { `${getResolution(height, width)} ${prettysize(size)}` }
            </div>
          </div>
        </div>
        }
        { exifMake && exifModel &&
        <div style={{ height: 72, display: 'flex', alignItems: 'center' }}>
          <CameraIcon color="rgba(0,0,0,0.54)" />
          <div style={{ marginLeft: 64 }}>
            <div style={{ color: 'rgba(0,0,0,0.87)', lineHeight: '24px' }}>
              { exifModel }
            </div>
            <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14, lineHeight: '20px' }}>
              { exifMake }
            </div>
          </div>
        </div>
        }

        {/* location */}
        { exifDateTime &&
        <div style={{ height: 72, display: 'flex', alignItems: 'center' }}>
          <LoactionIcon color="rgba(0,0,0,0.54)" />
          <div style={{ marginLeft: 64 }}>
            <div style={{ color: 'rgba(0,0,0,0.87)', lineHeight: '24px', height: 24 }} id={`map_${this.digest}`} />
            <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14, lineHeight: '20px' }}>
              { `${longitude}, ${latitude}` }
            </div>
          </div>
        </div>
        }

        {/* map */}
        { exifDateTime &&
          <div style={{ width: 360, height: 360, marginLeft: -32 }}>
            <Map
              longitude={longitude}
              latitude={latitude}
              resultId={`map_${this.digest}`}
            />
          </div>
        }
      </div>
    )
  }

  render() {
    return (
      <div
        ref={ref => (this.refRoot = ref)}
        style={{
          position: 'fixed',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: 1500,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* overlay */}
        <div
          ref={ref => (this.refOverlay = ref)}
          style={{
            position: 'fixed',
            height: '100%',
            width: '100%',
            top: 0,
            left: 0,
            backgroundColor: 'rgb(0, 0, 0)'
          }}
          onTouchTap={this.close}
        />

        {/* detail image content */}
        <div
          ref={ref => (this.refBackground = ref)}
          style={{
            position: 'relative',
            width: this.state.detailInfo ? 'calc(100% - 360px)' : '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 225ms cubic-bezier(0.0, 0.0, 0.2, 1)'
          }}
          onMouseMove={this.calcPositon}
          onTouchTap={() => this.changeIndex(this.state.direction)}
        >
          {/* main image */}
          { this.renderDetail() }

          {/* Selected Header */}
          {
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: this.state.detailInfo ? 'calc(100% - 360px)' : '100%',
                height: 64,
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(0deg, rgba(0,0,0,0), rgba(0,0,0,0.54))'
              }}
            >
              {/* return Button */}
              <IconButton
                onTouchTap={this.close}
                style={{ margin: 12 }}
              >
                <div ref={ref => (this.refReturn = ref)} >
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="white">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                  </svg>
                </div>
              </IconButton>
              {
              !!this.props.selectedItems.length &&
                <div style={{ color: '#FFF', fontSize: 20, fontWeight: 500 }} >
                  { `选择了 ${this.props.selectedItems.length} 张照片` }
                </div>
              }
              <div style={{ flexGrow: 1 }} />
              {/* toolbar */}
              {
                this.props.selectedItems.length ?
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ color: '#FFF', fontSize: 14, fontWeight: 500 }} >
                      { this.state.selected ? '已选择' : '选择' }
                    </div>
                    <IconButton onTouchTap={this.selectPhoto}>
                      <CheckIcon color={this.state.selected ? '#1E88E5' : '#FFF'} />
                    </IconButton>
                  </div> :
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onTouchTap={this.props.startDownload} tooltip="下载">
                      <DownloadIcon color="#FFF" />
                    </IconButton>

                    <IconButton onTouchTap={() => this.toggleDialog('deleteDialog')} tooltip="删除">
                      <DeleteIcon color="#FFF" />
                    </IconButton>

                    <IconButton onTouchTap={() => this.toggleDialog('hideDialog')} tooltip="隐藏">
                      <VisibilityOff color="#FFF" />
                    </IconButton>

                    <IconButton onTouchTap={() => this.toggleDialog('detailInfo')} tooltip="信息">
                      <InfoIcon color="#FFF" />
                    </IconButton>
                  </div>
              }
              <div style={{ width: 24 }} />
            </div>
          }

          {/* left Button */}
          <IconButton
            style={{
              display: this.state.direction === 'left' ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(66, 66, 66, 0.541176)',
              position: 'absolute',
              borderRadius: 28,
              width: 56,
              height: 56,
              left: '2%'
            }}
          >
            <svg width={36} height={36} viewBox="0 0 24 24" fill="white">
              <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z" />
            </svg>
          </IconButton>

          {/* right Button */}
          <IconButton
            style={{
              display: this.state.direction === 'right' ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(66, 66, 66, 0.541176)',
              borderRadius: 28,
              position: 'absolute',
              width: 56,
              height: 56,
              right: '2%'
            }}
          >
            <svg width={36} height={36} viewBox="0 0 24 24" fill="white">
              <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" />
            </svg>
          </IconButton>
        </div>

        {/* detail Info */}
        <div
          style={{
            position: 'fixed',
            width: this.state.detailInfo ? 360 : 0,
            height: '100%',
            top: 0,
            right: 0,
            backgroundColor: '#FFF',
            overflow: 'hidden',
            transition: 'all 225ms cubic-bezier(0.0, 0.0, 0.2, 1)'
          }}
        >
          <div style={{ height: 48, display: 'flex', alignItems: 'center', padding: '8px 16px 8px 32px' }}>
            <div style={{ fontSize: 20, width: 360 }}> 信息 </div>
            <div style={{ flexGrow: 1 }} />
            <IconButton onTouchTap={() => this.toggleDialog('detailInfo')}>
              <CloseIcon color="rgba(0,0,0,0.54)" />
            </IconButton>
          </div>
          { this.state.detailInfo && this.renderInfo() }
        </div>

        {/* delete dialog */}

        <DialogOverlay open={!!this.state.deleteDialog}>
          <div>
            {
              this.state.deleteDialog &&
                <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>
                    { '要将照片移动到回收站吗？' }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    { '内容被移到回收站后，文件中的相应内容也会被移除。' }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label="取消" primary onTouchTap={() => this.toggleDialog('deleteDialog')} keyboardFocused />
                    <FlatButton
                      label="移除"
                      primary
                      onTouchTap={() => {
                        this.toggleDialog('deleteDialog')
                        this.props.removeMedia()
                      }}
                    />
                  </div>
                </div>
            }
          </div>
        </DialogOverlay>

        {/* hide dialog */}
        <DialogOverlay open={!!this.state.hideDialog}>
          <div>
            {
              this.state.hideDialog &&
                <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>
                    { '要将照片隐藏吗？' }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    { '内容被隐藏后，我的照片内将不显示，可在智能助理中恢复。' }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label="取消" primary onTouchTap={() => this.toggleDialog('hideDialog')} keyboardFocused />
                    <FlatButton
                      label="隐藏"
                      primary
                      onTouchTap={() => {
                        this.toggleDialog('hideDialog')
                        this.props.hideMedia()
                      }}
                    />
                  </div>
                </div>
            }
          </div>
        </DialogOverlay>
      </div>
    )
  }
}

/*
 * Use RenderToLayer method to move the componet to root node
*/

class PhotoDetail extends React.Component {
  renderLayer = () => (
    <ReactTransitionGroup>
      { this.props.open && <PhotoDetailInline {...this.props} /> }
    </ReactTransitionGroup>
  )

  render() {
    return (
      <RenderToLayer render={this.renderLayer} open useLayerForClickAway={false} />
    )
  }
}

export default PhotoDetail
