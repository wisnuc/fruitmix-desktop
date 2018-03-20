import React from 'react'
import i18n from 'i18n'
import UUID from 'uuid'
import { CircularProgress } from 'material-ui'
import ErrorIcon from 'material-ui/svg-icons/alert/error'

class PhotoDetail extends React.Component {
  constructor (props) {
    super(props)

    this.state = { filePath: '', error: null }

    this.getRandomSrc = () => {
      this.session = UUID.v4()
      this.props.apis.pureRequest('randomSrc', { hash: this.props.item.hash }, (err, res) => {
        if (err) {
          this.setState({ error: 'randomSrc' })
          console.log('randomSrc error', err)
        } else this.setState({ filePath: `http://${this.props.apis.address}:3000/media/random/${res.key}` })
        this.session = ''
      })
    }

    /* stop video buffer */
    this.addPauseEvent = (video) => {
      video.addEventListener('pause', () => {
        const playtime = video.currentTime
        const tmpSrc = video.src
        console.log('this.addPauseEvent', video.src)
        video.src = ''
        video.load()
        video.src = tmpSrc
        video.currentTime = playtime
      }, { once: true })
      video.addEventListener('play', () => {
        this.addPauseEvent(video)
      }, { once: true })
    }
  }

  componentDidUpdate () {
    if (!this.refVideo) return

    if (this.props.parent.style.left === '0px' && this.refVideo.paused && !this.played) {
      this.played = true
      this.refVideo.play()
      this.addPauseEvent(this.refVideo)
    } else if (this.props.parent.style.left !== '0px') {
      this.played = false
      this.refVideo.pause()
    }
  }

  renderKnownVideo () {
    if (this.hash === this.props.item.hash && this.state.filePath) {
      return (
        <div
          style={{ height: '80%', width: '80%', backgroundColor: 'rgba(0,0,0,0)' }}
          onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }}
        >
          <video
            width="100%"
            height="100%"
            controls
            ref={ref => (this.refVideo = ref)}
            controlsList="nodownload"
            src={this.state.filePath}
          >
            <track kind="captions" />
          </video>
        </div>
      )
    }
    if (!this.session) {
      this.hash = this.props.item.hash
      this.getRandomSrc()
      this.state = Object.assign({}, this.state, { filePath: '' })
    }
    return (<CircularProgress size={64} thickness={5} />)
  }

  renderError () {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <div
          style={{
            width: 360,
            height: 180,
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: '#EEEEEE'
          }}
        >
          <ErrorIcon style={{ height: 64, width: 64, color: 'rgba(0,0,0,0.54)' }} />
          <div style={{ height: 8 }} />
          <div style={{ fontSize: 20, color: 'rgba(0,0,0,0.54)' }}> { i18n.__('Load Video Error Text') } </div>
        </div>
      </div>
    )
  }

  render () {
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
        {/* main video */}
        { this.state.error ? this.renderError() : this.renderKnownVideo() }
      </div>
    )
  }
}

export default PhotoDetail
