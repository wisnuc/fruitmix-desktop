/**
  PhotoDetail.jsx
**/

import { ipcRenderer } from 'electron';
import { findDOMNode } from 'react-dom';
import React, { Component, PropTypes } from 'react';
import SlideToAnimate from './SlideToAnimate';
import { add, remove } from '../scrollLazyload/utils/eventListeners';

const __PERCENT__ = '100%';
const __MAPORIENTATION__ = {
  1: 0,
  8: -90,
  3: 180,
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

    this.state = {
      path: ''
    };

    this.getStyles = (clientRect = { width: 0, height: 0, left: 0, top: 0 }) => ({
      position: 'absolute',
      left: 40,
      right: 40,
      top: 40,
      bottom: 40,
      height: 'calc(100% - 80px)',
      textAlign: 'center',
      // textAlign: 'center'
      // width: `${clientRect.width}px`,
      // height: `${clientRect.height}px`,
      // left: `${clientRect.left}px`,
      // top: `${clientRect.top}`,
      overflow: 'hidden'
      // position: 'absolute',
      // left: `${clientRect.left}`,
      // top: `${clientRect.top}`,
      // width: `${clientRect.width}`,
      // height: `${clientRect.height}`
    });
    this.getClientRect = (width, height) => {
      let { deltaWidth, deltaHeight } = this.props;
      let actualWidth, actualHeight, actualLeft, actualTop;
      const ratio = width / height;

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

      return {
        width: actualWidth,
        height: actualHeight,
        left: actualLeft,
        top: actualTop
      };
    };
  }

  shouldComponentUpdate(nextProps) {
    return this.props.path !== nextProps.path;
  }

  render() {
    let { style, width, height, path } = this.props;
    let exifOrientation = window.store.getState().view.currentMediaImage.exifOrientation;
    console.log(__MAPORIENTATION__[exifOrientation], 'ooxx');
    return (
      <div style={ style } data-orientation={ exifOrientation } data-width={ width } data-height={ height }>
        {/*<div style={this.getStyles()}>
          <div>transform: 'rotate('+ __MAPORIENTATION__[exifOrientation] +'deg)'
              ref={ el => this.el = el }
              src={ path }
              style={{ display: 'inline-block', width: __PERCENT__, height: __PERCENT__ }} />*/}
          <div style={Object.assign({}, this.getStyles(), { transform: `rotate(${__MAPORIENTATION__[exifOrientation] || 0}deg)` })}>
            <div style={{ width: '0', height: '50%', display: 'inline-block' }}></div>
            <img
              ref={ el => this.el = el }
              src={ path }
              style={{ display: 'inline-block', width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%', verticalAlign: 'middle' }} />
          </div>
        </div>
    )
  }

  // componentDidMount() {
  //   const node = findDOMNode(this.el);
  //   const handler = () => {
  //     const naturalWidth = node.naturalWidth;
  //     const naturalHeight = nodeName.naturalHeight;
  //     const clientRect = this.getClientRect(naturalWidth, naturalHeight);
  //     console.log(clientRect, 'xxoo')
  //     node.style.width = `${clientRect['width']}px`
  //     node.style.height = `${clientRect['height']}px`
  //     node.style.top = `${clientRect['top']}px`
  //     node.style.left = `${clientRect['left']}px`
  //
  //     //remove(node, 'load', handler);
  //   };
  //
  //   //add(node, 'load', handler);
  // }

  //componentDidMount() {
  //   const node = findDOMNode(this.el);
  //   const eventListener = () => {
  //     const clientRect = this.getClientRect();
  //     const naturalWidth = node.naturalWidth;
  //     const naturalHeight = node.naturalHeight;
  //     const canvas = document.createElement('canvas');
  //     const ctx = canvas.getContext('2d');
  //     canvas.width = naturalWidth;
  //     canvas.height = naturalHeight;
  //     ctx.drawImage(node, 0, 0, naturalWidth, naturalHeight);
  //
  //     const img = new megapixImage.MegapixImage(node);
  //     img.render(canvas, {
  //       maxWidth: clientRect.width,
  //       maxHeight: clientRect.height,
  //       quality: .8,
  //       orientation: this.props.exifOrientation
  //     });
  //
  //     node.setAttribute('src', canvas.toDataURL('image/jpeg', .8));
  //     remove(node, 'load', eventListener);
  //   };
  //
  //   add(node, 'load', eventListener);
  // }
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
    const { style, items, seqIndex } = this.props;

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

  componentDidUpdate() {
    window.store.dispatch({ type: 'CLEAR_MEDIA_IMAGE' });
  }

  shouldComponentUpdate(nextProps) {
    return window.store.getState().view.currentMediaImage.path !== '';
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
      ipcRenderer.send('getMediaImage', this.props.items[currentIndex].digest);
      setTimeout(() => {
        this.refs['slideToAnimate'].setState({ currentIndex });
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
        translateDistance={ 0 }
        translateCount={ this.props.items.length }>
        <PhotoDetailList
          deltaWidth={ this.props.deltaWidth }
          deltaHeight={ this.props.deltaHeight }
          style={ this.style.photoDetailList }
          seqIndex={ this.props.seqIndex }
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
