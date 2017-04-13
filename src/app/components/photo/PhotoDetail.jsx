import React, { PropTypes } from 'react'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import UUID from 'node-uuid'
import { Paper, CircularProgress, IconButton, SvgIcon } from 'material-ui'
import RenderToLayer from 'material-ui/internal/RenderToLayer'
import SlideToAnimate from './SlideToAnimate'

const debug = Debug('component:photoApp:PhotoDetail')

class PhotoDetailInline extends React.Component {
  constructor(props) {
    super(props)

    this.currentIndex = this.props.seqIndex

    this.requestNext = (currentIndex) => {
      this.path = ''
      this.thumbPath = ''
      this.session = UUID.v4()
      this.digest = this.props.items[currentIndex].digest
      ipcRenderer.send('getMediaImage', this.session, this.digest)
      ipcRenderer.send('getThumb', this.session, this.digest)
      this.forceUpdate()
    }
    this.changeIndex = (direction) => {
      if (direction === 'right') {
        this.currentIndex += 1
      } else if (direction === 'left') {
        this.currentIndex -= 1
      }
      this.requestNext(this.currentIndex)
    }
  }

  componentWillMount() {
    this.requestNext(this.props.seqIndex)
  }

  componentDidMount() {
    ipcRenderer.on('donwloadMediaSuccess', (err, session, path) => {
      if (session !== this.session) return
      this.path = path
      this.forceUpdate()
    })
    ipcRenderer.on('getThumbSuccess', (event, session, path) => {
      if (session !== this.session) return
      this.thumbPath = path
      this.forceUpdate()
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state !== nextState
  }

  renderDetail() {
    /*
    let exifOrientation = ''
    if (currentImage) {
      exifOrientation = currentImage.exifOrientation || ''
    }
    const degRotate = exifOrientation ? `rotate(${(exifOrientation - 1) * 90}deg)` : ''
              style={{ transform: degRotate, transitionDuration: '0' }}
    const thumbPath = `${mediaPath}${digest}thumb210`
    */

    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ position: 'fixed', height: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
          { this.path ? // FIXME
            <img
              height={'100%'}
              src={this.path}
              alt="DetailImage"
            /> : this.thumbPath ?
              <img
                height={'100%'}
                src={this.thumbPath}
                alt="DetailImage"
              /> : <div />
          }
        </div>
      </div>
    )
  }

  render() {
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
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            zIndex: 1500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          { this.renderDetail() }
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

          { this.currentIndex > 0 && <IconButton
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(66, 66, 66, 0.541176)',
              position: 'fixed',
              borderRadius: 28,
              width: 56,
              height: 56,
              left: '2%'
            }}
            onTouchTap={() => this.changeIndex('left')}
          >
            <svg width={36} height={36} viewBox="0 0 24 24" fill="white">
              <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z" />
            </svg>
          </IconButton> }

          { this.currentIndex < this.props.items.length - 1 && <IconButton
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(66, 66, 66, 0.541176)',
              borderRadius: 28,
              position: 'fixed',
              width: 56,
              height: 56,
              right: '2%'
            }}
            onTouchTap={() => this.changeIndex('right')}
          >
            <svg width={36} height={36} viewBox="0 0 24 24" fill="white">
              <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" />
            </svg>
          </IconButton> }
        </div>
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
          );

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
