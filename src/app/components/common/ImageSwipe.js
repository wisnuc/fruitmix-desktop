/**
  图片切换
**/

import React, { Component, PropTypes } from 'react';
import { MenuItem } from 'material-ui';
import svg from '../../utils/SVGIcon';
import Share from '../mainContent/Share';

function getStyles (props) {
  const { width, height, arrowContainerWidth } = props;

  return {
    root: {
      position: 'fixed',
      left: '50%',
      top: '50%',
      WebkitTransform: 'translate(-50%, -50%)',
      width: width + arrowContainerWidth * 2,
      height,
      zIndex: 9999
    },
    rootInner: {
      boxSizing: 'border-box',
      position: 'absolute',
      overflow: 'hidden',
      width: width - 260,
      height,
      left: arrowContainerWidth,
      transition: 'transform .2s linear'
    },
    leftArrow: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: arrowContainerWidth,
      height
    },
    rightArrow: {
      position: 'absolute',
      right: 0,
      top: 0,
      width: arrowContainerWidth,
      height
    }
  }
}

export default class ImageSwipe extends Component {
  constructor(props) {
    super(props);

    this.imgLength = props.state.largeImages.data.length;
    this.currentImgIndex = this.findIndex();

    this.state = {
      arrowLeftStatus: this.currentImgIndex > 0,
      arrowRightStatus: this.currentImgIndex < this.imgLength - 1
    };
  }

  detectIndex(currentImgIndex) {
    const { state } = this.props;

    if (currentImgIndex >= this.imgLength - 1) {
      this.setState({ arrowRightStatus: false });
    } else if (currentImgIndex <= 0) {
      this.setState({ arrowLeftStatus: false });
    } else {
      this.setState({ arrowLeftStatus: true, arrowRightStatus: true });
    }

    return currentImgIndex;
  }

  findIndex() {
    const { state } = this.props;
    const currentThumbIndex = state.largeImages.currentThumbIndex;
    const date = state.largeImages.date;
    const els = Array.from(document.querySelectorAll('[data-date="'+ date +'"]'));

    return els.findIndex(el =>
      el.dataset.index == currentThumbIndex
    );
  }

  moveTo(nextIndex) {
    const { state } = this.props;

    this.currentImgIndex = this.detectIndex(nextIndex);

    ipc.send('getMediaImage', state.largeImages.data[this.currentImgIndex]);
  }

  leftClickHandle() {
    this.moveTo(this.currentImgIndex - 1);
  }

  rightClickHandle() {
    this.moveTo(this.currentImgIndex + 1);
  }

  createArrowComponent(mark) {
    const { leftArrow, rightArrow } = getStyles(this.props);
    const isLeftArrow = mark === 'left';

    return (
      <div style={ isLeftArrow ? leftArrow : rightArrow }>
        <MenuItem
          className={ isLeftArrow ? 'large-arrow' : 'large-arrow' }
          desktop={ true }
          onTouchTap={ isLeftArrow ? this.leftClickHandle.bind(this) : this.rightClickHandle.bind(this) }
          leftIcon={ isLeftArrow ? svg.leftArrow() : svg.rightArrow() }>
        </MenuItem>
      </div>
    );
  }

  render() {
    const { root, rootInner } = getStyles(this.props);
    const { state, height } = this.props;

    return (
      <div className="image-swipe-container" style={ root }>
        <div className="clearfix" style={{ padding: '0 100px' }}>
          <div style={ rootInner }>
            <img src={ state.view.currentMediaImage.path || '' } width="100%" height="100%" style={{ objectFit: 'cover' }} />
          </div>
          <div style={{ width: 260, boxSizing: 'border-box', padding: '0 40px', marginLeft: 700, height, backgroundColor: '#fff' }}>
            <div className="circle-header" style={{ padding: '40px 0 20px', fontSize: 16, textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,.12)' }}>
              相册分享
            </div>
            <div className="circle-body">
              {/* 分享组件 */}
              <Share dispatch={ dispatch } state={ state }></Share>
            </div>
          </div>
        </div>

        { this.state.arrowLeftStatus && this.createArrowComponent('left') }

        { this.state.arrowRightStatus && this.createArrowComponent('right') }
      </div>
    );
  }
}

ImageSwipe.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  currentImageHash: PropTypes.string.isRequired,
  imageHashs: PropTypes.array.isRequired,
  arrowContainerWidth: PropTypes.number
};

ImageSwipe.defaultProps = {
  arrowContainerWidth: 100
}
