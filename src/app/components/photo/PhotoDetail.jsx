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
        width: __PERCENT__,
        height: __PERCENT__,
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
      <div style={this.style.root}></div>
    );
  }
}

class PhotoDetailItem extends Component {
  constructor() {
    super();

    this.getStyles = (clientRect) => ({
      position: 'absolute',
      width: `${clientRect.width}px`,
      height: `${clientRect.height}px`,
      left: `${clientRect.left}px`,
      top: `${clientRect.top}`
      // position: 'absolute',
      // left: `${clientRect.left}`,
      // top: `${clientRect.top}`,
      // width: `${clientRect.width}`,
      // height: `${clientRect.height}`
    });
  }

  shouldComponentUpdate(nextProps) {
    return this.props.path !== nextProps.path;
  }

  render() {
    let {
      style, path, exifOrientation,
      width, height, deltaWidth, deltaHeight
     } = this.props;

    let temp;
    const rotate = __MAPORIENTATION__[exifOrientation];

    // if (rotate) {
    //   temp = height;
    //   height = width;
    //   width = temp;
    // }
    // if (rotate == 90) {}

    const ratio = width / height;
    let actualWidth, actualHeight, actualLeft, actualTop;

    if (ratio < 1) {
      // 如果是高图片
      actualHeight = deltaHeight;
      actualWidth = deltaHeight * ratio;
      actualLeft = (deltaWidth - actualWidth) / 2;
      actualTop = 0;
    } else {
      // 如果是宽图片
      actualWidth = deltaWidth;
      actualHeight = deltaWidth / ratio;
      actualLeft = 0;
      actualTop = (deltaHeight - actualHeight) / 2;
    }

    const clientRect = {
      width: actualWidth,
      height: actualHeight,
      left: actualLeft,
      top: actualTop
    };
    //console.log(window.store.getState().view.currentMediaImage.exifOrientation, 'www');
    return (
      <div style={ style } data-width={ width } data-height={height} data-exifOrientation={exifOrientation}>
        <div style={ this.getStyles(clientRect) }>
          <img
            src={ path }
            style={{ width: __PERCENT__, height: __PERCENT__, objectFit: 'cover', transform: `rotate(${__MAPORIENTATION__[exifOrientation]}deg)` }} />
        </div>
      </div>
    )
  }
}

class PhotoDetailList extends Component {
  constructor() {
    super();

    this.style = {
      root: {
        position: 'relative',
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
        {
          items.map((item, index) => {
            return (
              <PhotoDetailItem
                key={item.digest}
                width={item.width}
                height={item.height}
                deltaWidth={this.props.deltaWidth}
                deltaHeight={this.props.deltaHeight}
                style={this.style.root}
                exifOrientation={this.store.getState().view.currentMediaImage.exifOrientation}
                path={this.store.getState().view.currentMediaImage.path} />
            );
          })
       }
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
        this.refs['slideToAnimate'].setState(
          { currentIndex }
        );
      }, 500);

      return false;
    };

    this.buildPhotoDetailList = () => (
      <SlideToAnimate
        ref="slideToAnimate"
        style={ this.style.slideAnimate }
        onClose={ this.props.closeMaskLayer }
        activeIndex={ this.props.seqIndex }
        translateLeftCallback={ this.requestNext }
        translateRightCallback={ this.requestNext }
        translateDistance={ this.props.delta }
        translateCount={ this.props.items.length }>
        <PhotoDetailList
          deltaWidth={ this.props.deltaWidth }
          deltaHeight={ this.props.deltaHeight }
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
        <MaskLayer />
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
