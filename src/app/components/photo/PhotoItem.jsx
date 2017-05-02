import React, { Component, PropTypes } from 'react'
import UUID from 'node-uuid'
import Debug from 'debug'
import { Paper, Card, IconButton, CircularProgress } from 'material-ui'
import { CheckIcon } from './Svgs'

const debug = Debug('component:photoApp:photoItem:')

class PhotoItem extends Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      pending: true,
      action: false,
      hover: false
    }
    this.path = ''

    this.onSelectIconButton = () => {
      if (!this.state.action) {
        this.setState({ action: true }, () => this.props.addListToSelection(this.props.digest))
      } else {
        this.setState({ action: false }, () => this.props.removeListToSelection(this.props.digest))
      }
    }

    this.placeHolder = <div style={{ backgroundColor: '#eeeeee', height: '100%', width: '100%' }} />
    // this.placeHolder = (<CircularProgress size={40} thickness={5} />)

    this.updatePath = (event, session, path) => {
      if (this.session === session) {
        this.path = path
        this.forceUpdate()
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (this.state !== nextState)
  }
  componentDidMount() {
    this.session = UUID.v4()
    this.props.ipcRenderer.send('mediaShowThumb', this.session, this.props.digest, 210, 210)
    this.props.ipcRenderer.on('getThumbSuccess', this.updatePath)
  }
  componentWillUnmount() {
    this.props.ipcRenderer.removeListener('getThumbSuccess', this.updatePath)
    this.props.ipcRenderer.send('mediaHideThumb', this.session)
  }

  renderHover = () => (
    <div
      style={{
        position: 'absolute',
        zIndex: 100,
        left: 5,
        top: 5,
        width: 18,
        height: 18
      }}
      onTouchTap={(e) => { this.onSelectIconButton(); e.stopPropagation() }}
      onMouseEnter={() => this.setState({ hover: true })}
      onMouseLeave={() => this.setState({ hover: false })}
    >
      <CheckIcon
        hoverColor={this.state.action ? '#1E88E5' : '#42A5F5'}
        color={this.state.action ? '#1E88E5' : '#90CAF9'}
      />
    </div>
  )

  renderImage = () => (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onTouchTap={() => this.props.lookPhotoDetail(this.props.digest)}
      onMouseMove={() => this.setState({ hover: true })}
      onMouseLeave={() => this.setState({ hover: false })}
    >
      {
          !this.path ? this.placeHolder :
          <img src={this.path} alt="img" style={{ objectFit: 'cover' }} />
        }
    </div>
    )

  render() {
    const { style } = this.props
    // debug('Render PhotoItem this.props', this.props)
    return (
      <div style={style}>
        <div
          style={{
            position: 'relative',
            height: '100%',
            width: '100%'
          }}
        >
          {/* (this.state.action || this.state.hover) && <this.renderHover /> */}
          { <this.renderImage /> }
        </div>
      </div>
    )
  }
}

PhotoItem.propTypes = {
  digest: PropTypes.string.isRequired,
  lookPhotoDetail: PropTypes.func
}

PhotoItem.defaultProps = {
  lookPhotoDetail: () => {}
}

export default PhotoItem
