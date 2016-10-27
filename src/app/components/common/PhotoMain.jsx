// PhotoMain

import React, { Component, PropTypes } from 'react';

import Mask from '../../React-Redux-UI/src/components/partials/Mask';
import ImageSwipe from '../common/ImageSwipe';
import PhotoItem from './PhotoItem';

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
    }
  }
}

export default class PhotoMain extends Component {
  createPhotoItems() {
    const { isSingle, photoList, albumDigest } = this.props;
    const { manyItemStyle, singleItemStyle } = getStyles();

    if (isSingle) {
      return (
        <div style={ singleItemStyle }>
          <PhotoItem digest={ photoList[0].digest } albumDigest={ albumDigest } path={ photoList[0].path } />
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

  render() {
    return (
      <div>
        { this.createPhotoItems() }
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
