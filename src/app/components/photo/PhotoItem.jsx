import React, { Component, PropTypes } from 'react'
import Debug from 'debug'
import { Card, IconButton, CircularProgress } from 'material-ui'
import SelectIconButton from './SelectIconButton'
import loading from '../../../assets/images/index/loading.gif'

const debug = Debug('component:photoItem:')

function getStyles() {
  return {
    root: {
      position: 'relative',
      boxSizing: 'border-box',
      height: '100%',
      width: '100%',
      overflow: 'hidden'
    },
    loadingIcon: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      marginLeft: -8,
      marginTop: -8,
      width: 16,
      height: 16,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '0 0'
    },
    ovlay: {
      position: 'absolute',
      width: '100%',
      height: '50px',
      background: 'linear-gradient(to bottom, rgba(0, 0, 0, .12) 0%, rgba(255, 255, 255, 0) 100%)',
      left: 0,
      top: -50,
      transition: 'top .2s linear'
    },
    activeOvlay: {
      top: 0
    }
  }
}

export default class PhotoItem extends Component {
  constructor(props, context) {
    super(props, context)

    this.styles = getStyles()
    this.state = {
      action: 'pending',
      hover: null
    }

    this.findPhotoIndexByDigest = () => this.context.photos.findIndex(photo => photo.date === this.props.date)

    this.addHoverIconButton = () => {
      this.state.action === 'pending' && this.setState({ action: 'hover' })
      debug('this.addHoverIconButton', this.state.action)
    }

    this.removeHoverIconButton = () => {
      this.state.action === 'hover' && this.props.onDetectAllOffChecked() && this.setState({ action: 'pending' })
      debug('this.removeHoverIconButton', this.state.action)
    }

    this.changeState = () => {
      debug('this.changeState', this.state)
      const action = this.state.action
      action === 'hover'
        ? this.offSelectIconButton()
        : this.onSelectIconButton()
    }
      // props.lookPhotoDetail(this.findPhotoIndexByDigest())
    { /* action === 'hover' && props.onDetectAllOffChecked()
         ? props.lookPhotoDetail(this.findPhotoIndexByDigest())
         : action === 'on'
           ? this.offSelectIconButton()
           : this.onSelectIconButton()
      debug('this.changeState', this.state)
    }*/ }

    this.onSelectIconButton = (disabled) => {
      (this.state.action === 'hover'
        || this.state.action === 'pending')
      && this.setState({ action: 'on' }, () => !disabled && props.selected())
    }

    this.offSelectIconButton = (disabled, state = 'hover') => {
      if (this.state.action === 'on') {
        this.setState({
          action: state
        }, () => !disabled && props.unselected())
      }
      // setTimeout(() => {
      //   if (this.state.action === 'on') {
      //     this.setState({
      //       action: this.props.onDetectAllOffChecked() ? 'pending' : 'hover'
      //     }, () => !disabled && props.unselected())
      //   }
      // }, 0);
      // if (this.state.action === 'on') {
      //   this.setState({
      //     action: isTo || this.props.onDetectAllOffChecked() ? 'pending' : 'hover'
      //   }, () => !disabled && props.unselected());
      // }
    }
  }

  renderHover = () => (
    <div
      style={{
        position: 'absolute',
        zIndex: 100,
        left: 5,
        top: 5,
        width: 18,
        height: 18,
        borderRadius: '100%',
        backgroundColor: 'transparent',
        border: '1px solid rgba(255,255,255,.54)'
      }}
      onTouchTap={(e) => { this.onSelectIconButton(); e.stopPropagation() }}
    />)

  /* iconComponent = this.state.action === 'pending'
        ? <div />
        : this.state.action === 'hover'
        ? <div
          style={{
            position: 'absolute',
            zIndex: 100,
            left: 5,
            top: 5,
            width: 18,
            height: 18,
            borderRadius: '100%',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255,255,255,.54)'
          }}
          onTouchTap={(e) => { this.onSelectIconButton(); e.stopPropagation() }}>
          <div style={{ width: '100%', height: '100%' }} />
        </div>
          : (<SelectIconButton
            isReceive
            ref={`selectSingleItem${index}`}
            checked={this.state.action}
            style={{ position: 'absolute', left: 5, top: 5, width: 18, height: 18 }}
            selectBehavior={action => this[`${action}SelectIconButton`]()}
          />)
          */

  renderImage = (props) => {
    const path = props.path
    if (!path) {
      return <CircularProgress size={40} thickness={5} />
    }

    return (
      <div
        style={{ position: 'relative', cursor: 'pointer', width: '100%', height: '100%', overflow: 'hidden', textAlign: 'center' }}
        onTouchTap={this.changeState}
        onMouseEnter={() => this.setState({ hover: 'Enter' })}
        onMouseLeave={() => this.setState({ hover: null })}
      >
        {/* iconComponent */}
        <div style={{ height: '50%', width: 0, display: 'inline-block' }} />
        <img src={path} alt="img" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        <span style={Object.assign({}, this.styles.ovlay, this.state.action === 'hover' && this.styles.activeOvlay)} />
      </div>)
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //  return nextProps.path !== this.props.path
  // }

  render() {
    const { path, style, lookPhotoDetail, index, exifOrientation, width, height } = this.props
    debug('this.state.hover', this.state.hover)
    return (
      <div style={style}>
        <div
          style={{
            position: 'relative',
            height: '100%',
            width: '100%',
            overflow: 'hidden'
          }}
        >
          { this.state.hover && <this.renderHover /> }
          { <this.renderImage path={path} /> }
        </div>
      </div>
    )
  }
}

PhotoItem.propTypes = {
  digest: PropTypes.string.isRequired,
  lookPhotoDetail: PropTypes.func,
  showSelectIconButton: PropTypes.func
}

PhotoItem.contextTypes = {
  photos: PropTypes.Array
}

PhotoItem.defaultProps = {
  lookPhotoDetail: () => {}
}
