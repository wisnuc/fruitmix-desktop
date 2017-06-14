import React, { PropTypes } from 'react'
import Debug from 'debug'
import UUID from 'node-uuid'
import { Paper, CircularProgress, IconButton, SvgIcon } from 'material-ui'
import RenderToLayer from 'material-ui/internal/RenderToLayer'
import keycode from 'keycode'
import EventListener from 'react-event-listener'
import { TweenMax } from 'gsap'
import ReactTransitionGroup from 'react-addons-transition-group'

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


class PhotoDetailInline extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      direction: null,
      thumbPath: '',
      detailPath: ''
    }

    this.currentIndex = this.props.seqIndex

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
      // debug('this.props.memoize', this.props.memoize())
      debug('render photoDetail', this.props.items.length, this.props.items[this.props.seqIndex])
    }

    this.changeIndex = (direction) => {
      if (direction === 'right' && this.currentIndex < this.props.items.length - 1) {
        this.currentIndex += 1
      } else if (direction === 'left' && this.currentIndex > 0) {
        this.currentIndex -= 1
      } else return
      this.requestNext(this.currentIndex)
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
      const { x, y } = mousePosition(ev)
      const clientWidth = window.innerWidth

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
      this.clientWidth = window.innerWidth

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
  }

  componentWillMount() {
    this.requestNext(this.props.seqIndex)
  }

  componentDidMount() {
    this.props.ipcRenderer.on('donwloadMediaSuccess', this.updatePath)
    this.props.ipcRenderer.on('getThumbSuccess', this.updateThumbPath)
  }

  componentWillUnmount() {
    clearTimeout(this.enterTimeout)
    clearTimeout(this.leaveTimeout)
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
    this.animation('In')
    this.enterTimeout = setTimeout(callback, 200) // matches transition duration
  }

  componentWillLeave(callback) {
    this.props.setAnimation('NavigationMenu', 'In')
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
                />
            }
          </div>
        </div>
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
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          ref={ref => (this.refBackground = ref)}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            zIndex: 1500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onMouseMove={this.calcPositon}
          onTouchTap={() => this.changeIndex(this.state.direction)}
        >

          {/* main image */}
          { this.renderDetail() }

          {/* return Button */}
          <IconButton
            onTouchTap={this.close}
            style={{
              position: 'fixed',
              top: 12,
              left: 12
            }}
          >
            <div ref={ref => (this.refReturn = ref)} >
              <svg width={24} height={24} viewBox="0 0 24 24" fill="white">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </div>
          </IconButton>

          {/* left Button */}
          <IconButton
            style={{
              display: this.state.direction === 'left' ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(66, 66, 66, 0.541176)',
              position: 'fixed',
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
              position: 'fixed',
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

        {/* overlay */}
        <div
          ref={ref => (this.refOverlay = ref)}
          style={{
            position: 'fixed',
            height: '100%',
            width: '100%',
            top: 0,
            left: 0,
            backgroundColor: 'rgb(0, 0, 0)',
            zIndex: 1400
          }}
          onTouchTap={this.close}
        />
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
