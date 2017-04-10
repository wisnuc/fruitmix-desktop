import { ipcRenderer } from 'electron'
import Debug from 'debug'
import React, { PropTypes } from 'react'
import { Paper, CircularProgress, IconButton, SvgIcon } from 'material-ui'
import RenderToLayer from 'material-ui/internal/RenderToLayer'
import SlideToAnimate from './SlideToAnimate'

const debug = Debug('component:photoApp:PhotoDetail')

class PhotoDetailInline extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      currentImage: null
    }

    this.currentImage = ''

    this.currentIndex = this.props.seqIndex

    this.style = {
      leftDire: {
        backgroundColor: 'rgba(50, 50, 50, .5)',
        position: 'fixed',
        left: '2%'
      },
      rightDire: {
        backgroundColor: 'rgba(50, 50, 50, .5)',
        position: 'fixed',
        right: '2%'
      },
      closeBtn: {
        backgroundColor: 'rgba(50, 50, 50, .5)',
        position: 'fixed',
        top: 12,
        right: 'calc(2% + 6px)'
      }
    }

    this.requestNext = (currentIndex) => {
      ipcRenderer.send('getMediaImage', this.props.items[currentIndex].digest)
    }
    this.changeIndex = (direction) => {
      if (direction === 'right') {
        this.currentIndex += 1
      } else if (direction === 'left') {
        this.currentIndex -= 1
      }
      ipcRenderer.once('donwloadMediaSuccess', (err, item) => {
        this.currentImage = item
        this.forceUpdate()
      })
      this.forceUpdate()
      this.currentImage = ''
      this.requestNext(this.currentIndex)
    }
  }

  componentWillMount() {
    this.requestNext(this.props.seqIndex)
  }

  componentDidMount() {
    ipcRenderer.once('donwloadMediaSuccess', (err, item) => {
      this.currentImage = item
      this.forceUpdate()
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state !== nextState
  }

  renderDetail(currentImage, photo) {
    let exifOrientation = ''
    if (currentImage) {
      exifOrientation = currentImage.exifOrientation || ''
    }
    const degRotate = exifOrientation ? `rotate(${(exifOrientation - 1) * 90}deg)` : ''
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
          { currentImage ? // FIXME
            <img
              style={{ transform: degRotate, transitionDuration: '0' }}
              height={'100%'}
              src={window.store.getState().view.currentMediaImage.path}
              alt="DetailImage"
            /> : photo.path ?
              <img
                height={'100%'}
                src={photo.path}
                alt="DetailImage"
              /> : <div /> }
        </div>
      </div>
    )
  }

  render() {
    const photo = this.props.items[this.currentIndex]
    debug('PhotoDetail', this.props)
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
          transition: 'all 0ms cubic-bezier(0.23, 1, 0.32, 1)'
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
          <div
            style={{
              width: '100%',
              height: '100%',
              zIndex: 1500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            { this.renderDetail(this.currentImage, photo) }
            <IconButton
              onTouchTap={this.props.closePhotoDetail}
              style={this.style.closeBtn}
            >
              <SvgIcon fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                <path d="M0 0h24v24H0z" fill="none" />
              </SvgIcon>
            </IconButton>
            { this.currentIndex > 0 && <IconButton
              style={this.style.leftDire}
              onTouchTap={() => this.changeIndex('left')}
            >
              <SvgIcon fill="#000000" height="36" viewBox="0 0 24 24" width="36">
                <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z" />
                <path d="M0-.5h24v24H0z" fill="none" />
              </SvgIcon>
            </IconButton> }

            { this.currentIndex < this.props.items.length - 1 && <IconButton
              style={this.style.rightDire}
              onTouchTap={() => this.changeIndex('right')}
            >
              <SvgIcon fill="#000000" height="36" viewBox="0 0 24 24" width="36" >
                <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" />
                <path d="M0-.25h24v24H0z" fill="none" />
              </SvgIcon>
            </IconButton> }
          </div>
        </div>
        <div
          style={{
            position: 'fixed',
            height: '100%',
            width: '100%',
            top: 0,
            left: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
