/**
  PhotoDetail.jsx
**/

import { ipcRenderer } from 'electron';
import React, { Component, PropTypes } from 'react';
import SlideToAnimate from './SlideToAnimate';

const __PERCENT__ = '100%';
const __MAPORIENTATION__ = {
  8: -90,
  3: -180,
  6: 90
};

class MaskLayer extends Component {
  constructor() {
    super();

    this.style = {
      root: {
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,.95)',
        zIndex: 10001
      }
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div style={ this.style.root } onClick={ this.props.closeMaskLayer }></div>
    );
  }
}

class PhotoDetailItem extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.path !== nextProps.path;
  }

  render() {
    const { style, path, exifOrientation } = this.props;

    return (
      <div style={ style }>
        <img
          src={ path }
          style={{ width: __PERCENT__, height: __PERCENT__, objectFit: 'cover', transform: `rotate(${__MAPORIENTATION__[exifOrientation]})deg` }} />
      </div>
    )
  }
}

class PhotoDetailList extends Component {
  constructor() {
    super();

    this.style = {
      root: {
        width: __PERCENT__,
        height: __PERCENT__,
        flexShrink: 0,
        flexGrow: 0
      }
    };
    this.store = window.store;
  }

  render() {
    const { style, items } = this.props;

    return (
      <div style={ this.props.style }>
        { items.map((item, index) => (
          <PhotoDetailItem
            key={ item.digest }
            style={ this.style.root }
            exifOrientation={ this.store.getState().view.currentMediaImage.exifOrientation }
            path={ this.store.getState().view.currentMediaImage.path } />
        )) }
      </div>
    );
  }
}

export default class PhotoDetail extends Component {
  constructor() {
    super();

    this.style = {
      slideAnimate: {
        height: __PERCENT__
      },
      photoDetailList: {
        display: 'flex',
        flexFlow: 'row nowrap',
        justifyContent: 'flex-start',
        height: '100%'
      }
    };

    this.requestNext = (currentIndex) => {
      window.store.dispatch({ type: 'CLEAR_MEDIA_IMAGE' });
      ipcRenderer.send('getMediaImage', this.props.items[currentIndex].digest);
      setTimeout(() => {
        this.refs['slideToAnimate'].setState({ currentIndex });
      }, 10);

      return false;
    };

    this.buildPhotoDetailList = () => (
      <SlideToAnimate
        ref="slideToAnimate"
        style={ this.style.slideAnimate }
        direLeft={ -45 }
        direRight={ -45 }
        activeIndex={ this.props.seqIndex }
        translateLeftCallback={ this.requestNext }
        translateRightCallback={ this.requestNext }
        translateDistance={ document.documentElement.clientWidth - 120 }
        translateCount={ this.props.items.length }>
        <PhotoDetailList
          style={ this.style.photoDetailList }
          items={ this.props.items }/>
      </SlideToAnimate>
    );
  }

  shouldComponentUpdate(nextProps) {
    return window.store.getState().view.currentMediaImage.path !== '';
  }

  componentWillMount() {
    this.requestNext(this.props.seqIndex);
  }

  render() {
    return (
      <div>
        <MaskLayer closeMaskLayer={ this.props.closeMaskLayer } />
        <div style={ this.props.style }>
          { this.buildPhotoDetailList() }
        </div>
      </div>
    );
  }
}

PhotoDetail.propTypes = {
  style: PropTypes.object.isRequired,
  items: PropTypes.object.isRequired,
  activeIndex: PropTypes.number.isRequired,
  closeMaskLayer: PropTypes.func.isRequired
};
