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

const debug = Debug('component:file:preview')

const mousePosition = (ev) => {
  if (ev.pageX || ev.pageY) {
    return { x: ev.pageX, y: ev.pageY }
  }
  return {
    x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
    y: ev.clientY + document.body.scrollTop - document.body.clientTop
  }
}

class PreviewInline extends React.Component {
  constructor(props) {
    super(props)

    this.dragPosition = { x: 0, y: 0, left: 0, top: 0 }

    this.state = {
      direction: null,
      detailInfo: false
    }

    this.toggleDialog = op => this.setState({ [op]: !this.state[op] })

    this.currentIndex = this.props.seqIndex

    this.close = () => {
      this.props.onRequestClose()
    }

    /* change image */
    this.requestNext = (currentIndex) => {
      debug('this.requestNext', currentIndex)
    }

    this.changeIndex = (direction) => {
      if (direction === 'right' && this.currentIndex < this.props.items.length - 1) {
        this.currentIndex += 1
      } else if (direction === 'left' && this.currentIndex > 0) {
        this.currentIndex -= 1
      } else return
      this.requestNext(this.currentIndex)
    }

    /* calculate positon of mouse */
    this.calcPositon = (ev) => {
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
          nothing there!
        </div>
      </div>
    )
  }

  renderInfo() {
    return (
      <div style={{ padding: '0px 32px 0px 32px', width: 296 }}>
        <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.54)', height: 48, display: 'flex', alignItems: 'center' }}> 详情 </div>
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

              <div style={{ flexGrow: 1 }} />

              {/* toolbar */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onTouchTap={this.props.startDownload} tooltip="下载">
                  <DownloadIcon color="#FFF" />
                </IconButton>
              </div>
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
      </div>
    )
  }
}

/*
 * Use RenderToLayer method to move the componet to root node
*/

class Preview extends React.Component {
  renderLayer = () => (
    <ReactTransitionGroup>
      { this.props.open && <PreviewInline {...this.props} /> }
    </ReactTransitionGroup>
  )

  render() {
    return (
      <RenderToLayer render={this.renderLayer} open useLayerForClickAway={false} />
    )
  }
}

export default Preview
