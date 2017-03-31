import { ipcRenderer } from 'electron'
import Debug from 'debug'
import React, { PropTypes } from 'react'
import { CircularProgress } from 'material-ui'
import SlideToAnimate from './SlideToAnimate'

const debug = Debug('component:photoApp:PhotoDetail')

class PhotoDetailList extends React.Component {
  constructor() {
    super()
  }

  componentWillReceiveProps(nextProps) {
  }
  shouldComponentUpdate(nextProps, nextState) {
    return 1
  }
  // componentDidUpdate() {
  //  window.store.dispatch({ type: 'CLEAR_MEDIA_IMAGE' })
  // }

  render() {
    const { style, items, seqIndex } = this.props
    const exifOrientation = window.store.getState().view.currentMediaImage.exifOrientation
    let degRotate = ''
    if (exifOrientation) {
      degRotate = `rotate(${(exifOrientation - 1) * 90}deg)`
    }

    debug('window.store.getState().view.currentMediaImage.path', window.store.getState().view.currentMediaImage.path)
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
        { items.map((item, index) => (
          <div
            style={{
              position: 'fixed',
              height: '90%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            key={item.digest}
            deltaWidth={this.props.deltaWidth}
            deltaHeight={this.props.deltaHeight}
          >
            { window.store.getState().view.currentMediaImage.path ?
              <img
                style={{ transform: degRotate }}
                height={'100%'}
                src={window.store.getState().view.currentMediaImage.path}
                alt="DetailImage"
              /> :
              <CircularProgress /> }
          </div>
          ))}
      </div>
    )
  }
}

export default class PhotoDetail extends React.Component {
  constructor() {
    super()

    this.style = {
      slideAnimate: {
        height: '100%',
        width: '100%'
      }
    }

    this.requestNext = (currentIndex) => {
      ipcRenderer.send('getMediaImage', this.props.items[currentIndex].digest)
      setTimeout(() => {
        this.refs.slideToAnimate.setState({ currentIndex })
      }, 500)

      return false
    }
  }

  shouldComponentUpdate(nextProps) {
    return window.store.getState().view.currentMediaImage.path !== ''
  }

  componentWillMount() {
    this.requestNext(this.props.seqIndex)
  }

  render() {
    return (
      <div
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
          <SlideToAnimate
            ref="slideToAnimate"
            style={{
              width: '100%',
              height: '100%',
              zIndex: 1500
            }}
            onClose={this.props.closePhotoDetail}
            activeIndex={this.props.seqIndex}
            translateLeftCallback={this.requestNext}
            translateRightCallback={this.requestNext}
            translateDistance={0}
            translateCount={this.props.items.length}
          >
            <PhotoDetailList
              deltaWidth={this.props.deltaWidth}
              deltaHeight={this.props.deltaHeight}
              style={{
                position: 'relative',
                width: '75%',
                height: '100%',
                margin: '0 auto',
                zIndex: 1500
              }}
              seqIndex={this.props.seqIndex}
              items={this.props.items}
            />
          </SlideToAnimate>
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
      </div>
    )
  }
}

PhotoDetail.propTypes = {
  style: PropTypes.object.isRequired,
  items: PropTypes.array.isRequired,
  activeIndex: PropTypes.number.isRequired,
  closePhotoDetail: PropTypes.func.isRequired
}
