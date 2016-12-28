/**
  PhotoItem
**/

import React, { Component, PropTypes } from 'react';
import HoverIconButton from './HoverIconButton';
import SelectIconButton from './SelectIconButton';
import loading from '../../../assets/images/index/loading.gif';

function getStyles () {
  return {
    root: {
      position: 'relative',
      boxSizing: 'border-box',
      border: '1px solid #e5e5e5',
      height: '100%',
      width: '100%',
      overflow: 'hidden'
    },
    thumb: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
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
    	transition: 'top .2s linear',
    },
    activeOvlay: {
      top: 0
    }
  }
}

export default class PhotoItem extends Component {
  constructor(props, context) {
    super(props, context);

    this.styles = getStyles();
    this.state = {
      action: 'pending'
    };

    this.findPhotoIndexByDigest = () =>
      this.context.photos.findIndex(photo => photo.digest === props.digest);

    this.addHoverIconButton = () => {
      this.state.action === 'pending' && this.setState({ action: 'hover' });
    };

    this.removeHoverIconButton = () => {
      this.state.action === 'hover' && this.setState({ action: 'pending' });
    };

    this.changeState = () => {
      const action = this.state.action;

      action === 'hover' && props.detectIsAllOffChecked()
        ? props.lookPhotoDetail(this.findPhotoIndexByDigest())
        : action === 'on'
          ? this.offSelectIconButton()
          : this.onSelectIconButton();
    };

    this.onSelectIconButton = (disabled) => {
      this.setState({ action: 'on' }, () => !disabled && props.selected());
    };

    this.offSelectIconButton = (disabled) => {
      this.setState({ action: 'pending' }, () => !disabled && props.unselected());
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.path !== this.props.path || nextState.action !== this.state.action;
  }

  render() {
    let component, iconComponent;
    const { path, style, lookPhotoDetail, index } = this.props;

    if (path) {
      iconComponent = this.state.action === 'pending'
        ? void 0
        : this.state.action === 'hover'
          ? (<HoverIconButton
            style={{ position: 'absolute', zIndex: 100, left: 5, top: 5, width: 18, height: 18, borderRadius: '100%', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,.54)' }}
            selectBehavior={ e => { this.onSelectIconButton(); e.stopPropagation(); } } />)
          : (<SelectIconButton
            isReceive={ true }
            ref={ 'selectSingleItem' + index }
            checked={ this.state.action }
            style={{ position: 'absolute', left: 5, top: 5, width: 18, height: 18 }}
            selectBehavior={ action => this[`${action}SelectIconButton`]() } />)

      component = (
        <div
          style={{ position: 'relative', width: '100%', height: '100%' }}
          onMouseOver={ this.addHoverIconButton }
          onMouseLeave={ this.removeHoverIconButton }
          onClick={ this.changeState }>

          { iconComponent }

          <img
            src={ path }
            style={ this.styles.thumb } />

          <span style={ Object.assign({}, this.styles.ovlay, this.state.action === 'hover' && this.styles.activeOvlay) }></span>
        </div>
      );
    } else {
      component = (<img src={ loading } style={ this.styles.loadingIcon } />);
    }

    return (
      <div style={ style }>
        <div style={ this.styles.root }>
          { component }
        </div>
      </div>
    );
  }

  // componentDidMount() {
  //   let { digest } = this.props;
  //
  //   ipcRenderer.send('getThumb', [{ digest }]);
  // }
}

PhotoItem.propTypes = {
  digest: PropTypes.string.isRequired,
  lookPhotoDetail: PropTypes.func,
  showSelectIconButton: PropTypes.func
};

PhotoItem.contextTypes = {
  photos: PropTypes.Array
};

PhotoItem.defaultProps = {
  lookPhotoDetail: () => {}
};
