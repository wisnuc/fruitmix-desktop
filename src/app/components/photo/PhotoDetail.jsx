/**
  PhotoDetail.jsx
**/

import { ipcRenderer } from 'electron';
import React, { Component, PropTypes } from 'react';
import SlideToAnimate from './SlideToAnimate';

const __PERCENT__ = '100%';

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
        backgroundColor: 'rgba(0,0,0,.45)',
        zIndex: 999
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
    const { style, path } = this.props;

    return (
      <div style={ style }>
        <img
          src={ path }
          style={{ width: __PERCENT__, height: __PERCENT__, objectFit: 'cover' }} />
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
    const { style, activeIndex, items } = this.props;

    return (
      <div style={ this.props.style }>
        { items.map((item, index) => (
          <PhotoDetailItem
            key={ item.digest }
            style={ this.style.root }
            path={ activeIndex == index ? this.store.getState().view.currentMediaImage.path : item.path } />
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
        justifyContent: 'flex-start'
      }
    };

    this.requestNext = (activeIndex) => {
      ipcRenderer.send('getMediaImage', this.props.items[activeIndex].digest)
    };

    this.buildPhotoDetailList = () => (
      <SlideToAnimate
        style={ this.style.slideAnimate }
        activeIndex={ this.props.activeIndex }
        translateLeftCallback={ this.requestNext }
        translateRightCallback={ this.requestNext }
        translateDistance={ this.props.style.width }
        translateCount={ this.props.items.length }>
        <PhotoDetailList
          style={ this.style.photoDetailList }
          activeIndex={ this.props.activeIndex }
          items={ this.props.items }/>
      </SlideToAnimate>
    );
  }

  componentWillMount() {
    this.requestNext(this.props.activeIndex);
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
