import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import prettysize from 'prettysize'
import { IconButton } from 'material-ui'
import CheckIcon from 'material-ui/svg-icons/action/check-circle'
import DateIcon from 'material-ui/svg-icons/action/today'
import ImageIcon from 'material-ui/svg-icons/image/image'
import CameraIcon from 'material-ui/svg-icons/image/camera'
import LoactionIcon from 'material-ui/svg-icons/communication/location-on'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import Visibility from 'material-ui/svg-icons/action/visibility'
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off'
import InfoIcon from 'material-ui/svg-icons/action/info'
import DownloadIcon from 'material-ui/svg-icons/file/file-download'
import RenderToLayer from 'material-ui/internal/RenderToLayer'
import keycode from 'keycode'
import EventListener from 'react-event-listener'
import { TweenMax } from 'gsap'
import ReactTransitionGroup from 'react-transition-group/TransitionGroup'
import DialogOverlay from '../common/DialogOverlay'
import FlatButton from '../common/FlatButton'
import Map from '../common/map'
import PhotoDetail from './PhotoDetail'
import VideoDetail from './VideoDetail'

const debug = Debug('component:photoApp:DetailContainer')

const mousePosition = (ev) => {
  if (ev.pageX || ev.pageY) {
    return { x: ev.pageX, y: ev.pageY }
  }
  return {
    x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
    y: ev.clientY + document.body.scrollTop - document.body.clientTop
  }
}

const parseExifTime = (time, type) => {
  const a = time.replace(/\s+/g, ':').split(':')
  const date = new Date()
  const week = [i18n.__('Sunday'), i18n.__('Monday'), i18n.__('Tuesday'), i18n.__('Wednesday'), i18n.__('Thursday'), i18n.__('Friday'), i18n.__('Saturday')]
  date.setFullYear(a[0], a[1] - 1, a[2])
  if (type === 'date') return i18n.__('Parse Date %s %s %s', a[0], a[1], a[2])
  if (type === 'time') return `${a[3]} : ${a[4]}`
  if (type === 'week') return week[date.getDay()]
  return `${i18n.__('Parse Date %s %s %s', a[0], a[1], a[2])} ${week[date.getDay()]} ${a[3]} : ${a[4]}`
}

const getResolution = (height, width) => {
  let res = height * width
  if (res > 100000000) {
    res = Math.ceil(res / 100000000)
    return i18n.__('Get 100 Million Resolution {{res}} {{alt}} {{height}} {{width}}', { res, alt: res * 100, height, width })
  } else if (res > 10000) {
    res = Math.ceil(res / 10000)
    return i18n.__('Get 0.01 Million Resolution {{res}} {{alt}} {{height}} {{width}}', { res, alt: res / 100, height, width })
  }
  return i18n.__('Get Resolution {{res}} {{height}} {{width}}', { res, height, width })
}

const convertGPS2 = (value, direction) => {
  let d
  let c
  if (direction === 'N' || direction === 'E') {
    d = 1
  } else if (direction === 'S' || direction === 'W') {
    d = -1
  } else {
    return null
  }
  try {
    c = value.split(',').reduce((acc, data, index) => {
      const [a, b] = data.split('/')
      return (acc + (a / b) / 60 ** index)
    }, 0)
  } catch (e) {
    return null
  }
  return Math.round(d * c * 1000) / 1000
}

const convertGPS = (gps) => {
  let result = { latitude: null, longitude: null }
  const array = gps && gps.split(', ').map(a => a.split(' ')).map(b => b.map(c => (/^[0-9]/.test(c) ? parseFloat(c, 10) : c)))

  if (!array || array.length !== 2) return result
  array.forEach((a) => {
    const value = Math.round((a[0] + a[2] / 60 + a[3] / 3600) * 1000) / 1000
    switch (a[4]) {
      case 'N':
        result.latitude = value
        break
      case 'E':
        result.longitude = value
        break
      case 'S':
        result.latitude = -1 * value
        break
      case 'W':
        result.longitude = -1 * value
        break
      default:
        result = { latitude: null, longitude: null }
    }
  })
  return result
}

class DetailContainerInline extends React.Component {
  constructor (props) {
    super(props)

    this.digest = this.props.items[this.props.seqIndex].hash

    this.dragPosition = { x: 0, y: 0, left: 0, top: 0 }

    this.state = {
      selected: this.props.selectedItems.includes(this.digest),
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
        this.setState({ selected: false }, () => this.props.removeListToSelection([this.digest]))
      } else {
        this.setState({ selected: true }, () => this.props.addListToSelection([this.digest]))
      }
    }

    this.close = () => {
      this.props.onRequestClose()
    }

    /* calculate positon of mouse */
    this.calcPositon = (ev) => {
      /* hide change image button when zoom */
      // debug('this.calcPositon', this.zoom)
      if (this.zoom > 1) {
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

    this.changeContainer = () => {
      this.photo = this.props.items[this.currentIndex]
      if (!this.photo) return
      this.clientHeight = window.innerHeight
      this.clientWidth = this.state.detailInfo ? window.innerWidth - 360 : window.innerWidth

      /* handle the exifOrientation */
      this.exifOrientation = this.photo.orient || 1
      this.degRotate = ''

      if (this.exifOrientation % 2) {
        this.photoHeight = this.photo.h
        this.photoWidth = this.photo.w
      } else {
        this.photoHeight = this.photo.w
        this.photoWidth = this.photo.h
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
        // debug('this.refContainer', this.photoWidth, this.photoHeight)
        this.refContainer.style.height = `${this.photoHeight}px`
        this.refContainer.style.width = `${this.photoWidth}px`
      }
    }

    this.updateContainerSize = (zoom) => {
      if (this.refContainer) {
        this.refContainer.style.overflow = zoom > 1 ? '' : 'hidden'
        this.zoom = zoom
      }
    }

    /* change image */
    this.changeIndex = (direction) => {
      // debug('this.changeIndex before', direction, this.leftItem, this.centerItem, this.rightItem)
      if (direction === 'right' && this.currentIndex < this.props.items.length - 1) {
        this.currentIndex += 1

        /* hidden left div which move 200%, show other divs */
        for (let i = 0; i < 3; i++) {
          if (this[`refPreview_${i}`].style.left === '-20%') {
            this[`refPreview_${i}`].style.opacity = 0
            this[`refPreview_${i}`].style.zIndex = 0
            /* update div content */
            const max = this.props.items.length - 1
            if (!i) {
              this.leftItem = this.currentIndex < max ? this.props.items[this.currentIndex + 1] : {}
              this.centerItem = this.props.items[this.currentIndex - 1]
              this.rightItem = this.currentIndex < max + 1 ? this.props.items[this.currentIndex] : {}
            } else if (i === 1) {
              this.leftItem = this.currentIndex < max + 1 ? this.props.items[this.currentIndex] : {}
              this.centerItem = this.currentIndex < max ? this.props.items[this.currentIndex + 1] : {}
              this.rightItem = this.props.items[this.currentIndex - 1]
            } else {
              this.leftItem = this.props.items[this.currentIndex - 1]
              this.centerItem = this.currentIndex < max + 1 ? this.props.items[this.currentIndex] : {}
              this.rightItem = this.currentIndex < max ? this.props.items[this.currentIndex + 1] : {}
            }
          } else if (this[`refPreview_${i}`].style.left === '20%') {
            this[`refPreview_${i}`].style.opacity = 1
            this[`refPreview_${i}`].style.zIndex = 1
          } else {
            this[`refPreview_${i}`].style.opacity = 0
            this[`refPreview_${i}`].style.zIndex = 0
          }
        }
        const tmp = this.refPreview_2.style.left
        this.refPreview_2.style.left = this.refPreview_1.style.left
        this.refPreview_1.style.left = this.refPreview_0.style.left
        this.refPreview_0.style.left = tmp
      } else if (direction === 'left' && this.currentIndex > 0) {
        this.currentIndex -= 1

        /* hidden right div which move 200%, show other divs */
        // debug('direction === left', this.leftItem, this.centerItem, this.rightItem)
        for (let i = 0; i < 3; i++) {
          if (this[`refPreview_${i}`].style.left === '20%') {
            /* update div content */
            if (!i) {
              this.leftItem = this.currentIndex > 0 ? this.props.items[this.currentIndex - 1] : {}
              this.centerItem = this.currentIndex > -1 ? this.props.items[this.currentIndex] : {}
              this.rightItem = this.props.items[this.currentIndex + 1]
            } else if (i === 1) {
              this.leftItem = this.props.items[this.currentIndex + 1]
              this.centerItem = this.currentIndex > 0 ? this.props.items[this.currentIndex - 1] : {}
              this.rightItem = this.currentIndex > -1 ? this.props.items[this.currentIndex] : {}
            } else {
              this.leftItem = this.currentIndex > -1 ? this.props.items[this.currentIndex] : {}
              this.centerItem = this.props.items[this.currentIndex + 1]
              this.rightItem = this.currentIndex > 0 ? this.props.items[this.currentIndex - 1] : {}
            }
            this[`refPreview_${i}`].style.opacity = 0
            this[`refPreview_${i}`].style.zIndex = 0
          } else if (this[`refPreview_${i}`].style.left === '-20%') {
            this[`refPreview_${i}`].style.opacity = 1
            this[`refPreview_${i}`].style.zIndex = 1
          } else {
            this[`refPreview_${i}`].style.opacity = 0
            this[`refPreview_${i}`].style.zIndex = 0
          }
        }
        const tmp = this.refPreview_0.style.left
        this.refPreview_0.style.left = this.refPreview_1.style.left
        this.refPreview_1.style.left = this.refPreview_2.style.left
        this.refPreview_2.style.left = tmp
        this.RightItem = this.props.items[this.currentIndex - 2]
      } else return
      /* memoize digest */
      this.digest = this.props.items[this.currentIndex].hash
      this.props.memoize({ currentDigest: this.digest, currentScrollTop: 0, downloadDigest: this.digest })
      this.refContainer.style.overflow = 'hidden'
      this.zoom = 1
      this.setState({ selected: this.props.selectedItems.includes(this.digest) })
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
  }

  componentWillMount () {
    // debug('componentWillMount', this.currentIndex, this.props.items.length)

    /* init three items' content */
    this.centerItem = this.props.items[this.currentIndex]
    this.leftItem = {}
    this.rightItem = {}
    if (this.currentIndex) {
      this.leftItem = this.props.items[this.currentIndex - 1]
    }
    if (this.currentIndex < this.props.items.length - 1) {
      this.rightItem = this.props.items[this.currentIndex + 1]
    }
    /* memoize Digest for downloading */
    this.props.memoize({ downloadDigest: this.centerItem.hash })
  }

  componentDidMount () {
    /* update refContainer size */
    this.forceUpdate()
  }

  shouldComponentUpdate (nextProps, nextState) {
    // debug('shouldComponentUpdate', nextProps.items.length, this.currentIndex)
    /* when nextProps.items.length === 0, close this DetailContainer */
    if (!nextProps.items.length || this.currentIndex > nextProps.items.length - 1) {
      setImmediate(this.close) // to avoid infinite loop
      return false
    }
    return true
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.forceChange && prevProps && this.props && prevProps.items.length !== this.props.items.length) {
      // debug('componentDidUpdate', prevProps, this.props)
      this.currentIndex -= 1
      this.changeIndex('right')
      this.forceChange = false
    }
  }

  componentWillUnmount () {
    clearTimeout(this.enterTimeout)
    clearTimeout(this.leaveTimeout)
  }

  /* ReactTransitionGroup */
  componentWillEnter (callback) {
    this.componentWillAppear(callback)
  }

  componentWillAppear (callback) {
    this.props.setAnimation('NavigationMenu', 'Out')
    if (this.props.selectedItems.length > 0) this.props.setAnimation2('ClearSelected', 'Out')
    this.animation('In')
    this.enterTimeout = setTimeout(callback, 200) // matches transition duration
  }

  componentWillLeave (callback) {
    this.props.setAnimation('NavigationMenu', 'In')
    if (this.props.selectedItems.length > 0) this.props.setAnimation2('ClearSelected', 'In')
    this.animation('Out')
    this.leaveTimeout = setTimeout(callback, 200) // matches transition duration
  }

  renderInfo () {
    // debug('renderInfo', this.props.items.length, this.photo)
    if (!this.photo) return <div />
    const { date, datetime, model, make, h, w, size, gps, lat, latr, long, longr } = this.photo

    const { latitude, longitude } = gps ? convertGPS(gps) : { latitude: convertGPS2(lat, latr), longitude: convertGPS2(long, longr) }

    return (
      <div style={{ padding: '0px 32px 0px 32px', width: 296 }}>
        <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.54)', height: 48, display: 'flex', alignItems: 'center' }}>
          { i18n.__('Info') }
        </div>
        { (date || datetime) &&
        <div style={{ height: 72, display: 'flex', alignItems: 'center' }}>
          <DateIcon color="rgba(0,0,0,0.54)" />
          <div style={{ marginLeft: 64 }}>
            <div style={{ color: 'rgba(0,0,0,0.87)', lineHeight: '24px' }}>
              { parseExifTime((date || datetime), 'date') }
            </div>
            <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14, lineHeight: '20px' }}>
              { `${parseExifTime((date || datetime), 'week')}  ${parseExifTime((date || datetime), 'time')}` }
            </div>
          </div>
        </div>
        }
        { h && w && size &&
        <div style={{ height: 72, display: 'flex', alignItems: 'center' }}>
          <ImageIcon color="rgba(0,0,0,0.54)" />
          <div style={{ marginLeft: 64 }}>
            <div style={{ color: 'rgba(0,0,0,0.87)', lineHeight: '24px' }}>
              { this.digest.slice(0, 9) }
            </div>
            <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14, lineHeight: '20px' }}>
              { `${getResolution(h, w)} ${prettysize(size)}` }
            </div>
          </div>
        </div>
        }
        { make && model &&
        <div style={{ height: 72, display: 'flex', alignItems: 'center' }}>
          <CameraIcon color="rgba(0,0,0,0.54)" />
          <div style={{ marginLeft: 64 }}>
            <div style={{ color: 'rgba(0,0,0,0.87)', lineHeight: '24px' }}>
              { model }
            </div>
            <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14, lineHeight: '20px' }}>
              { make }
            </div>
          </div>
        </div>
        }

        {/* location */}
        { (gps || (lat && latr && long && longr)) && longitude !== null && latitude !== null &&
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
        { (gps || (lat && latr && long && longr)) && longitude !== null && latitude !== null &&
          <div style={{ width: 360, height: 360, marginLeft: -32 }}>
            <Map
              longitude={longitude}
              latitude={latitude}
              resultId={`map_${this.digest}`}
              unknownRegionText={i18n.__('Unknown Region')}
            />
          </div>
        }
      </div>
    )
  }

  renderDetail (item, parent) {
    const { m } = item
    const photoMagic = ['JPEG', 'GIF', 'PNG']
    const videoMagic = ['3GP', 'MP4', 'MOV']
    const isPhoto = photoMagic.includes(m)
    const isVideo = videoMagic.includes(m)
    const props = {
      item,
      parent,
      station: this.props.station,
      apis: this.props.apis,
      ipcRenderer: this.props.ipcRenderer,
      updateContainerSize: this.updateContainerSize
    }
    if (isPhoto) return (<PhotoDetail {...props} />)
    if (isVideo) return (<VideoDetail {...props} />)
    return (<div />)
  }

  render () {
    debug('renderContainer', this.leftItem, this.centerItem, this.rightItem, this.state, this.props)
    this.changeContainer()

    /* show hidden media or just normal view */
    const h = this.props.type === 'hidden'
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
        {/* add EventListener to listen keyup */}
        <EventListener target="window" onKeyUp={this.handleKeyUp} />
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
            overflow: 'hidden',
            transition: 'all 225ms cubic-bezier(0.0, 0.0, 0.2, 1)'
          }}
          onMouseMove={this.calcPositon}
          onTouchTap={() => this.changeIndex(this.state.direction)}
        >
          <div
            ref={ref => (this.refContainer = ref)}
            style={{
              position: 'relative',
              height: 0,
              width: 0,
              backgroundColor: 'black',
              overflow: 'hidden',
              transition: 'all 200ms cubic-bezier(0.0, 0.0, 0.2, 1)'
            }}
          >
            {/* main image */}
            {
              [this.leftItem, this.centerItem, this.rightItem].map((item, index) => (
                <div
                  key={index.toString()}
                  ref={ref => (this[`refPreview_${index}`] = ref)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: index ? index === 1 ? 0 : '20%' : '-20%',
                    opacity: index === 1 ? 1 : 0,
                    zIndex: index === 1 ? 1 : 0,
                    height: '100%',
                    width: '100%',
                    transition: 'all 200ms cubic-bezier(0.0, 0.0, 0.2, 1)'
                  }}
                >
                  { this.renderDetail(item, this[`refPreview_${index}`]) }
                </div>
              ))
            }
          </div>

          {/* Selected Header */}
          {
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: this.state.detailInfo ? 'calc(100% - 360px)' : '100%',
                zIndex: 100,
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
                  { i18n.__('%s Photo Selected', this.props.selectedItems.length) }
                </div>
              }
              <div style={{ flexGrow: 1 }} />
              {/* toolbar */}
              {
                this.props.selectedItems.length
                  ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ color: '#FFF', fontSize: 14, fontWeight: 500 }} >
                        { this.state.selected ? i18n.__('Selected') : i18n.__('Select') }
                      </div>
                      <IconButton onTouchTap={this.selectPhoto}>
                        <CheckIcon color={this.state.selected ? '#1E88E5' : '#FFF'} />
                      </IconButton>
                    </div>
                  )
                  : (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton onTouchTap={() => this.props.startDownload()} tooltip={i18n.__('Download')}>
                        <DownloadIcon color="#FFF" />
                      </IconButton>

                      {/*
                    <IconButton onTouchTap={() => this.toggleDialog('deleteDialog')} tooltip={i18n.__('Delete')}>
                      <DeleteIcon color="#FFF" />
                    </IconButton>
                    */}

                      { // not show hide or Retrieve button when in box view
                        !this.props.station &&
                        <IconButton
                          onTouchTap={() => this.toggleDialog('hideDialog')}
                          tooltip={h ? i18n.__('Retrieve') : i18n.__('Hide')}
                        >
                          { h ? <Visibility color="#FFF" /> : <VisibilityOff color="#FFF" /> }
                        </IconButton>
                      }

                      <IconButton onTouchTap={() => this.toggleDialog('detailInfo')} tooltip={i18n.__('Info')}>
                        <InfoIcon color="#FFF" />
                      </IconButton>
                    </div>
                  )
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
              zIndex: 100,
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
              zIndex: 100,
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
            <div style={{ fontSize: 20, width: 360 }}> {i18n.__('Info')} </div>
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
                    { i18n.__('Delete Photo Dialog Text 1') }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    { i18n.__('Delete Photo Dialog Text 2') }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label={i18n.__('Cancel')} primary onTouchTap={() => this.toggleDialog('deleteDialog')} keyboardFocused />
                    <FlatButton
                      label={i18n.__('Remove')}
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
                    { h ? i18n.__('Retrieve Photo Dialog Text 1') : i18n.__('Hide Photo Dialog Text 1') }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    { h ? i18n.__('Retrieve Photo Dialog Text 2') : i18n.__('Hide Photo Dialog Text 2') }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label={i18n.__('Cancel')} primary onTouchTap={() => this.toggleDialog('hideDialog')} keyboardFocused />
                    <FlatButton
                      label={h ? i18n.__('Retrieve') : i18n.__('Hide')}
                      primary
                      onTouchTap={() => {
                        this.props.hideMedia(h)
                        this.toggleDialog('hideDialog')
                        this.forceChange = true
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

class DetailContainer extends React.Component {
  renderLayer = () => (
    <ReactTransitionGroup>
      { this.props.open && <DetailContainerInline {...this.props} /> }
    </ReactTransitionGroup>
  )

  render () {
    return (
      <RenderToLayer render={this.renderLayer} open useLayerForClickAway={false} />
    )
  }
}

export default DetailContainer
