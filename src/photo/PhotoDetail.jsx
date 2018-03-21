import React from 'react'
import Debug from 'debug'
import UUID from 'uuid'
import { CircularProgress } from 'material-ui'

const debug = Debug('component:photoApp:PhotoDetail')

class PhotoDetail extends React.Component {
  constructor (props) {
    super(props)

    this.digest = ''

    this.dragPosition = { x: 0, y: 0, left: 0, top: 0 }

    this.state = {
      thumbPath: '',
      detailPath: ''
    }

    this.toggleDialog = op => this.setState({ [op]: !this.state[op] })

    this.currentIndex = this.props.seqIndex

    this.close = () => {
      this.props.onRequestClose()
    }

    this.startDownload = () => {
      this.session = UUID.v4()
      this.photo = this.props.item
      this.digest = this.props.item.hash
      this.state = Object.assign({}, this.state, { thumbPath: '', detailPath: '' })
      this.props.ipcRenderer.send('mediaShowThumb', this.session, this.digest, 200, 200, this.props.station)
    }

    /* update detail image */
    this.updatePath = (event, session, path) => {
      if (this.session === session) {
        clearTimeout(this.time)
        this.session = ''
        this.time = setTimeout(() => {
          if (this.digest !== this.props.item.hash) {
            this.setState({ detailPath: '', thumbPath: '' })
          } else {
            this.refTransition.style.transform = this.degRotate
            this.setState({ detailPath: path })
          }
        }, 200)
      }
    }

    /* update thumbnail */
    this.updateThumbPath = (event, session, path) => {
      if (this.digest !== this.props.item.hash) {
        this.session = ''
        this.setState({ detailPath: '', thumbPath: '' })
        return
      }
      if (this.session === session) {
        /* update thumbPath */
        this.setState({ thumbPath: path, detailPath: '' }, () => {
          /* get detail image */
          this.props.ipcRenderer.send('mediaShowImage', this.session, this.digest, this.props.station)
        })
      }
    }

    /* calculate size of image */
    this.calcSize = () => {
      this.clientHeight = window.innerHeight
      this.clientWidth = this.props.detailInfo ? window.innerWidth - 360 : window.innerWidth

      /* handle the exifOrientation */
      this.exifOrientation = this.photo.orient || 1
      this.degRotate = ''
      if (this.exifOrientation) {
        this.degRotate = `rotate(${(this.exifOrientation - 1) * 90}deg)`
      }

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
        debug('onMouseWheel', event.wheelDelta, zoom)
        this.refDetailImage.style.zoom = zoom
        this.props.updateContainerSize(zoom)
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

  componentDidMount () {
    this.props.ipcRenderer.on('donwloadMediaSuccess', this.updatePath)
    this.props.ipcRenderer.on('getThumbSuccess', this.updateThumbPath)
    if (this.refContainer) this.refContainer.addEventListener('mousewheel', this.handleZoom)
  }

  componentWillUnmount () {
    clearTimeout(this.enterTimeout)
    clearTimeout(this.leaveTimeout)
    if (this.refContainer) this.refContainer.removeEventListener('mousewheel', this.handleZoom)
    this.props.ipcRenderer.removeListener('getThumbSuccess', this.updateThumbPath)
    this.props.ipcRenderer.removeListener('donwloadMediaSuccess', this.updatePath)
    this.props.ipcRenderer.send('mediaHideThumb', this.session)
    this.props.ipcRenderer.send('mediaHideImage', this.session)
  }

  renderDetail () {
    /* calculate photoHeight and photoWidth */
    if (this.digest === this.props.item.hash && (this.state.thumbPath || this.state.detailPath)) {
      this.calcSize()
      return (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
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
                  onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }}
                />
            }
          </div>

          {/* DetailImage */}
          <div
            role="presentation"
            style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            ref={ref => (this.refTransition = ref)}
            onMouseDown={() => this.setState({ drag: true })}
            onMouseUp={() => { this.setState({ drag: false }); this.dragPosition.x = 0; this.dragPosition.y = 0 }}
            onMouseMove={this.dragImage}
            onMouseLeave={() => { this.setState({ drag: false }); this.dragPosition.x = 0; this.dragPosition.y = 0 }}
            onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }}
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
                  draggable={false}
                />
            }
          </div>
        </div>
      )
    }

    if (!this.session) {
      this.startDownload()
    }

    return (
      <CircularProgress size={64} thickness={5} />
    )
  }

  render () {
    // debug('render!!!', this.props, this.state)
    if (!this.props.item || !this.props.item.hash) return (<div />)
    return (
      <div
        ref={ref => (this.refContainer = ref)}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* main image */}
        { this.renderDetail() }
      </div>
    )
  }
}

export default PhotoDetail
