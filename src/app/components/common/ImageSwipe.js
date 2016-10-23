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
      width: width,
      height,
      zIndex: 9999
    },
    rootInner: {
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
      width: width,
      height
    },
    featurePanel: {
      backgroundColor: '#fff',
      boxSizing: 'border-box',
      top: 0,
      padding: '0 40px',
      position: 'absolute',
      right: -260,
      height: '100%',
      width: 260,
      transition: 'right .2s linear'
    },
    leftArrow: {
      position: 'absolute',
      left: -100,
      top: 0,
      width: arrowContainerWidth
    },
    rightArrow: {
      position: 'absolute',
      right: -100,
      top: 0,
      width: arrowContainerWidth
    },
    icon: {
      bottom: 2,
      height: 24,
      right: -70,
      position: 'absolute',
      width: 24
    }
  }
}

export default class ImageSwipe extends Component {
  constructor(props) {
    super(props);

    this.imgLength = props.largeImages.data.length;
    this.currentImgIndex = this.findIndex();

    this.state = {
      arrowLeftStatus: this.currentImgIndex > 0,
      arrowRightStatus: this.currentImgIndex < this.imgLength - 1,
      shareComponentEnterAnimateAble: false
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
    const { largeImages } = this.props;
    const currentThumbIndex = largeImages.currentThumbIndex;
    const date = largeImages.date;
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

  showedSharePanelHandle() {
    this.setState({
      shareComponentEnterAnimateAble: !this.state.shareComponentEnterAnimateAble
    });
  }

  createArrowComponent(mark) {
    const { leftArrow, rightArrow } = getStyles(this.props);
    const isLeftArrow = mark === 'left';

    return (
      <div style={ isLeftArrow ? leftArrow : rightArrow }>
        <MenuItem
          className={ isLeftArrow ? 'large-arrow large-arrow-left' : 'large-arrow large-arrow-right' }
          desktop={ true }
          onTouchTap={ isLeftArrow ? this.leftClickHandle.bind(this) : this.rightClickHandle.bind(this) }
          leftIcon={ isLeftArrow ? svg.leftArrow() : svg.rightArrow() }>
        </MenuItem>
      </div>
    );
  }

  createShareIcon() {
    const { icon } = getStyles(this.props);

    return (
      <div className="icon-feature" style={ icon } onClick={ this.showedSharePanelHandle.bind(this) }>
        <MenuItem
          desktop={ true }
          leftIcon={ svg.share() }>
        </MenuItem>
      </div>
    );
  }

  render() {
    const { root, rootInner, featurePanel } = getStyles(this.props);
    const { shareComponentEnterAnimateAble, view, height, shareRadios } = this.props;
    const shareComponentClassName = shareComponentEnterAnimateAble ? 'share-enter-animate' : '';

    return (
      <div className="image-swipe-container" style={ root }>
        <div style={ rootInner }>
          <img src={ view.currentMediaImage.path } width="100%" height="100%" style={{ objectFit: 'cover' }} />

          {/* 右侧功能面板 */}
          <div className={ shareComponentClassName } style={ featurePanel }>
            <div className="circle-header" style={{ padding: '40px 0 20px', fontSize: 16, textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,.12)' }}>
              相册分享
            </div>
            <div className="circle-body">

              {/* 分享组件 */}
              <Share dispatch={ dispatch } shareRadios={ shareRadios }></Share>
            </div>
          </div>
        </div>

        { this.state.arrowLeftStatus && this.createArrowComponent('left') }

        { this.state.arrowRightStatus && this.createArrowComponent('right') }

        { this.createShareIcon() }
      </div>
    );
  }
}

ImageSwipe.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number
};
