import React from 'react'
import Debug from 'debug'
import UUID from 'uuid'
import { CircularProgress } from 'material-ui'

const debug = Debug('component:photoApp:PhotoDetail')

class PhotoDetail extends React.Component {
  constructor(props) {
    super(props)

    this.state = { filePath: '' }

    this.getRandomSrc = () => {
      this.session = UUID.v4()
      this.props.apis.pureRequest('randomSrc', { hash: this.props.item.hash }, (error, data) => {
        if (error) console.log('randomSrc error', error)
        else this.setState({ filePath: `http://${this.props.apis.address}:3000/media/random/${data.body.key}` })
      })
    }
  }

  componentDidUpdate() {
    if (!this.refVideo) return
    debug('componentDidUpdate', this.props.item, this.refVideo.paused, this.props.index)
    if (this.props.index === 1 && this.refVideo.paused) this.refVideo.play()
    else if (this.props.index !== 1) this.refVideo.pause()
  }

  renderKnownVideo(item) {
    debug('renderVideo', item)
    if (this.hash === this.props.item.hash && this.state.filePath) {
      return (
        <div
          style={{ height: '80%', width: '80%', backgroundColor: 'rgba(0,0,0,0)' }}
          onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }}
        >
          <video width="100%" height="100%" controls ref={ref => (this.refVideo = ref)} >
            <source src={this.state.filePath} />
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

  render() {
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
        {/* main video */}
        { this.renderKnownVideo() }
      </div>
    )
  }
}

export default PhotoDetail
