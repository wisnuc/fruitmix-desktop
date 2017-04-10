import React, { Component, PropTypes } from 'react'
import { ipcRenderer } from 'electron'
import Debug from 'debug'
import { Paper, Card, IconButton, CircularProgress } from 'material-ui'
import { CheckIcon } from './Svgs'

const debug = Debug('component:photoApp:photoItem:')

export default class PhotoItem extends Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      pending: true,
      action: false,
      hover: false
    }

    this.onSelectIconButton = () => {
      if (!this.state.action) {
        this.setState({ action: true }, () => this.props.selected())
      } else {
        this.setState({ action: false }, () => this.props.unselected())
      }
    }

    this.offSelectIconButton = (disabled, state = false) => {
      if (this.state.action) {
        this.setState({ action: state },
          () => !disabled && props.unselected())
      }
    }

    this.placeHolder = <div style={{ backgroundColor: '#eeeeee', height: '100%', width: '100%' }} />
    // this.placeHolder = (<CircularProgress size={40} thickness={5} />)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (this.state !== nextState || nextProps.path !== this.props.path)
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

  renderImage = (props) => {
    const path = props.path
    return (
      <Paper
        style={{
          position: 'relative',
          cursor: 'pointer',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        zDepth={this.state.action || this.state.hover ? 2 : 0}
        onTouchTap={() => this.props.lookPhotoDetail(this.props.digest)}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
      >
        { !path ?
          this.placeHolder :
          <div>
            <div style={{ height: '50%', width: 0, display: 'inline-block' }} />
            <img src={path} alt="img" style={{ objectFit: 'cover' }} />
          </div>
        }
      </Paper>
    )
  }

  render() {
    const { path, style } = this.props
    // debug('Render PhotoItem this.props', this.props)
    return (
      <Paper style={style}>
        <div
          style={{
            position: 'relative',
            height: '100%',
            width: '100%'
          }}
        >
          { (this.state.action || this.state.hover) && <this.renderHover /> }
          { <this.renderImage path={path} /> }
        </div>
      </Paper>
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
