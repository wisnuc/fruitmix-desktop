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
      height: '100%',
      width: '100%',
      overflow: 'hidden'
    },
    thumb: {
      width: 'auto',
      height: 'auto',
      maxWidth: '100%',
      maxHeight: '100%',
      verticalAlign: 'middle'
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

const __MAPORIENTATION__ = {
  8: -90,
  3: -180,
  6: 90
};

export default class PhotoItem extends Component {
  constructor(props, context) {
    super(props, context);

    this.styles = getStyles();
    this.state = {
      action: 'pending'
    };

    this.findPhotoIndexByDigest = () => {
      return this.context.photos.findIndex(photo => photo.date === this.props.date)
    };

    this.addHoverIconButton = () => {
      this.state.action === 'pending' && this.setState({ action: 'hover' });
    };

    this.removeHoverIconButton = () => {
      this.state.action === 'hover' && this.props.onDetectAllOffChecked() && this.setState({ action: 'pending' });
    };

    this.changeState = () => {
      const action = this.state.action;
      props.lookPhotoDetail(this.findPhotoIndexByDigest());
      // action === 'hover' && props.onDetectAllOffChecked()
      //   ? props.lookPhotoDetail(this.findPhotoIndexByDigest())
      //   : action === 'on'
      //     ? this.offSelectIconButton()
      //     : this.onSelectIconButton();
    };

    this.onSelectIconButton = (disabled) => {
      (this.state.action === 'hover'
        || this.state.action === 'pending')
      && this.setState({ action: 'on' }, () => !disabled && props.selected());
    };

    this.offSelectIconButton = (disabled, state = 'hover') => {
      if (this.state.action === 'on') {
        this.setState({
          action: state
        }, () => !disabled && props.unselected());
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
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.path !== this.props.path;
  }

  render() {
    let component, iconComponent;
    const {
      path, style, lookPhotoDetail,
      index, exifOrientation, width, height } = this.props;

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
            /*
            onMouseOver={ this.addHoverIconButton }
            onMouseLeave={ this.removeHoverIconButton }
            */
      // let actualWidth, actualHeight;
      // // let clipTop, clipLeft;
      //
      // if (width > height) {
      //   actualWidth = 280;
      //   actualHeight = 210;
      // } else {
      //   actualWidth = 210;
      //   actualHeight = 280;
      // }

      // if (actualWidth === 280) {
      //   clipLeft = 280 - 150;
      //   clipTop = 210 - 158;
      // } else {
      //   clipLeft = 210 - 150;
      //   clipTop = 280 - 158;
      // }

      component = (
        <div
          style={{ position: 'relative', cursor: 'pointer', width: '100%', height: '100%', overflow: 'hidden', textAlign: 'center' }}
          onClick={ this.changeState }>

          {/* iconComponent */}
          <div style={{ height: '50%', width: 0, display: 'inline-block' }}></div>

          {/*<div style={{ position: 'absolute', backgroundPosition: `-${clipLeft}px, -${clipTop}px`, backgroundSize: 'cover', backgroundImage: `url(${path})`, width: actualWidth, height: actualHe
          ight }}></div>*/}
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
