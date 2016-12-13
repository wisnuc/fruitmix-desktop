/**
  图片切换
**/

import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';

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
      transition: 'right .5s cubic-bezier(0, 1, .5, 1)'
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

class ImageSwipe extends Component {
  constructor(props) {
    super(props);

    this.imgLength = props.largeImages.data.length;
    this.currentImgIndex = this.findIndex();
    this.state = {
      arrowLeftStatus: this.currentImgIndex > 0,
      arrowRightStatus: this.currentImgIndex < this.imgLength - 1,
      shareComponentEnterAnimateAble: false
    };

    this.mapOrientation = {
      8: -90,
      3: -180,
      6: 90
    };
  }

  // componentWillReceiveProps() {
  //   this.currentImgIndex = this.findIndex();
  //   this.setState({
  //     arrowLeftStatus: this.currentImgIndex > 0,
  //     arrowRightStatus: this.currentImgIndex < this.imgLength - 1
  //   });
  // }

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
    const currentHash = largeImages.hash;

    return largeImages.data.findIndex(hash => currentHash === hash);
  }

  moveTo(nextIndex) {
    const { largeImages } = this.props;

    this.currentImgIndex = this.detectIndex(nextIndex);
    console.log(this.currentImgIndex, 'ggggg');
    ipc.send('getMediaImage', largeImages.data[this.currentImgIndex]);
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
    const { view, height, shareRadio } = this.props;
    const shareComponentClassName = this.state.shareComponentEnterAnimateAble ? 'share-enter-animate' : '';
    const imageStyle = { objectFit: 'cover', transform: 'rotate('+ this.mapOrientation[view.currentMediaImage.exifOrientation] +'deg)' }

    return (
      <div className="image-swipe-container" style={ root }>
        <div style={ rootInner }>
          <img ref="img" src={ view.currentMediaImage.path } width="100%" height="100%" style={ imageStyle } />

          {/* 右侧功能面板 */}
          { /*<div className={ shareComponentClassName } style={ featurePanel }>
            <div className="circle-header" style={{ padding: '40px 0 20px', fontSize: 16, textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,.12)' }}>
              相册分享
            </div>
            <div className="circle-body">


              <Share dispatch={ dispatch } shareRadios={ shareRadio }></Share>
            </div>
          </div>*/}
        </div>

        { this.state.arrowLeftStatus && this.createArrowComponent('left') }

        { this.state.arrowRightStatus && this.createArrowComponent('right') }

        {/* this.createShareIcon() */}
      </div>
    );
  }
}

ImageSwipe.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number
};

const mapStateToProps = ({
  largeImages,
  shareRadio,
  view
}) => ({ largeImages, shareRadio, view });

export default connect(mapStateToProps)(ImageSwipe);
