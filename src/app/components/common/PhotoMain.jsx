// PhotoMain

import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';

import Mask from '../../React-Redux-UI/src/components/partials/Mask';
import ImageSwipe from '../common/ImageSwipe';
import PhotoItem from './PhotoItem';

import Action from '../../actions/action';

function getStyles() {
  return {
    manyItemStyle: {
      float: 'left',
      position: 'relative',
      height: 224,
      width: 224,
      marginTop: 9,
      marginRight: 9
    },
    singleItemStyle: {
      position: 'relative',
      height: '100%'
    },
    photoLargeItemStyle: {
      position: 'fixed',
      width: 960,
      height: 700,
      left: '50%',
      top: '50%',
      zIndex: 1200,
      WebkitTransform: 'translate(-50%, -50%)'
    }
  }
}

class PhotoMain extends Component {
  viewLargeImageHandle() {
    const { dispatch } = this.props;

    dispatch(Action.getLargeImageList([ findDOMNode(this.refs['photoitem']) ]))
  }

  shutdownMaskHandle() {
    const { dispatch } = this.props;

    dispatch(Action.toggleMedia(false));
    dispatch(Action.removeLargeImageList());
  }

  makePhotoLargeItem() {
    const { largeImages, albumDigest, photoList } = this.props;
    const { photoLargeItemStyle } = getStyles();

    if (largeImages.data && largeImages.data.length) {
      return (
        <div style={ photoLargeItemStyle }>
          <PhotoItem
            isLargeImageVisible={ true }
            digest={ largeImages.data[0] }
            albumDigest={ albumDigest }
            path={ photoList[0].path }>
          </PhotoItem>
        </div>
      )
    }
  }

  createPhotoItems() {
    const { isSingle, photoList, albumDigest } = this.props;
    const { manyItemStyle, singleItemStyle } = getStyles();

    if (isSingle) {
      return (
        <div ref="photoitem" style={ singleItemStyle } data-hash={ photoList[0].digest } onClick={ this.viewLargeImageHandle.bind(this) }>
          <PhotoItem
            digest={ photoList[0].digest }
            albumDigest={ albumDigest }
            path={ photoList[0].path } />
        </div>
      );
    } else {
      return photoList.map((photo, index) => {
        const isPath = photo.path;
        const isLastColumnByRow = index % 3 === 2;
        const isFirstRowByColumn = index < 3;
        let newManyItemStyle = isLastColumnByRow
          ? Object.assign({}, manyItemStyle, { marginRight: 0 })
          : manyItemStyle;
        newManyItemStyle = isFirstRowByColumn
          ? Object.assign({}, newManyItemStyle, { marginTop: 0 })
          : newManyItemStyle;

        return (
          <div key={ photo.digest } style={ newManyItemStyle }>
            <PhotoItem digest={ photo.digest } albumDigest={ albumDigest } path={ photo.path } />
          </div>
        );
      });
    }
  }

  makeZask() {
    const { largeImages } = this.props;

    if (largeImages.data && largeImages.data.length) {
      return (
        <Mask
          className="large-image-mask"
          onShutdown={ this.shutdownMaskHandle.bind(this) }>
        </Mask>
      );
    }
  }

  render() {
    return (
      <div>
        { this.createPhotoItems() }
        { this.makeZask() }
        { this.makePhotoLargeItem() }
      </div>
    );
  }
}

PhotoMain.propTypes = {
  /**
   是否只显示单张图片
  **/
  isSingle: PropTypes.bool.isRequired,

  /**
   相册digest
  **/
  albumDigest: PropTypes.string.isRequired,

  /**
   显示图片列表
  **/
  photoList: PropTypes.array.isRequired
};

const mapStateToProps = ({ largeImages }) => ({ largeImages });

export default connect(mapStateToProps)(PhotoMain);
