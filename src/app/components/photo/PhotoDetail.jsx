import React, { PropTypes } from 'react'
import Debug from 'debug'
import UUID from 'node-uuid'
import { Paper, CircularProgress, IconButton, SvgIcon } from 'material-ui'
import RenderToLayer from 'material-ui/internal/RenderToLayer'
import keycode from 'keycode'
import { TweenMax } from 'gsap'

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

    this.currentIndex = this.props.seqIndex

    this.state = {
      direction: null
    }

    this.requestNext = (currentIndex) => {
      /* hide image and resieze container */
      if (this.refImage) {
        this.refImage.style.display = 'none'
        this.refContainer.style.height = `${this.photoHeight}px`
        this.refContainer.style.width = `${this.photoWidth}px`
      }
      /* initialize path of image */
      this.path = ''
      this.thumbPath = ''

      /* get current image */
      this.session = UUID.v4()
      this.digest = this.props.items[currentIndex][0]
      this.photo = this.props.items[currentIndex][1]
      // debug('this.photo', this.photo)
      this.props.ipcRenderer.send('mediaShowThumb', this.session, this.digest, 210, 210)
      this.forceUpdate()
    }

    this.changeIndex = (direction) => {
      if (direction === 'right' && this.currentIndex < this.props.items.length - 1) {
        this.currentIndex += 1
      } else if (direction === 'left' && this.currentIndex > 0) {
        this.currentIndex -= 1
      } else return
      this.requestNext(this.currentIndex)
    }

    this.updatePath = (event, session, path) => {
      if (this.session === session) {
        // debug('got media!')
        clearTimeout(this.time)
        this.time = setTimeout(() => (this.refImage.src = path), 100)
      }
    }

    this.updateThumbPath = (event, session, path) => {
      if (this.session === session) {
        /* update thumbPath and resize container */
        this.thumbPath = path
        this.refImage.style.display = 'flex'
        this.refImage.src = this.thumbPath
        this.refContainer.style.height = `${this.photoHeight}px`
        this.refContainer.style.width = `${this.photoWidth}px`

        /* get detail image */
        // debug('got thumb!')
        this.props.ipcRenderer.send('mediaShowImage', this.session, this.digest)
      }
    }
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

    this.calcSize = () => {
      this.clientHeight = window.innerHeight
      this.clientWidth = window.innerWidth
      this.photoHeight = this.photo.metadata.height
      this.photoWidth = this.photo.metadata.width
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
    }
  }

  componentWillMount() {
    this.requestNext(this.props.seqIndex)
  }

  componentDidMount() {
    this.props.ipcRenderer.on('donwloadMediaSuccess', this.updatePath)
    this.props.ipcRenderer.on('getThumbSuccess', this.updateThumbPath)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state !== nextState
  }

  componentWillUnmount() {
    this.props.ipcRenderer.removeListener('getThumbSuccess', this.updateThumbPath)
    this.props.ipcRenderer.removeListener('donwloadMediaSuccess', this.updatePath)
    this.props.ipcRenderer.send('mediaHideThumb', this.session)
    this.props.ipcRenderer.send('mediaHideImage', this.session)
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
        <div
          ref={ref => (this.refContainer = ref)}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 0,
            width: 0,
            backgroundColor: 'black',
            overflow: 'hidden',
            transition: 'all 350ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'
          }}
        >
          <div ref={ref => (this.refTransition = ref)}>
            <img
              style={{ display: 'none' }}
              ref={ref => (this.refImage = ref)}
              height={this.photoHeight}
              width={this.photoWidth}
              alt="DetailImage"
            />
          </div>
        </div>
      </div>
    )
  }

  render() {
    // debug('currentImage', this.photo)
    return (
      <Paper
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

          {/* close Button */}
          <IconButton
            onTouchTap={this.props.closePhotoDetail}
            style={{
              position: 'fixed',
              top: 12,
              left: 12
            }}
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="white">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
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

        {/* overLay */}
        <div
          style={{
            position: 'fixed',
            height: '100%',
            width: '100%',
            top: 0,
            left: 0,
            backgroundColor: 'rgb(0, 0, 0)',
            zIndex: 1400
          }}
          onTouchTap={this.props.closePhotoDetail}
        />
      </Paper>
    )
  }
}

/*
 * Use RenderToLayer method to move the componet to root node
*/

export default class PhotoDetail extends React.Component {
  renderLayer = () => (
    <PhotoDetailInline {...this.props} />
  )

  render() {
    return (
      <RenderToLayer render={this.renderLayer} open useLayerForClickAway={false} />
    )
  }
}

PhotoDetail.propTypes = {
  style: PropTypes.object.isRequired,
  items: PropTypes.array.isRequired,
  closePhotoDetail: PropTypes.func.isRequired,
  seqIndex: PropTypes.number.isRequired
}
