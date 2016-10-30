// AlbumOrPhotoShareView.jsx

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PhotoItem from '../common/PhotoItem';
import ImageSwipe from '../common/ImageSwipe';
import loadingIcon from '../../../assets/images/index/loading.gif';
import Mask from '../../React-Redux-UI/src/components/partials/Mask';
import Action from '../../actions/action';

function getStyles () {
  return {
    rootStyle: {
      paddingTop: 38
    },
    itemStyle: {
      boxSizing: 'border-box',
      border: '1px solid #e5e5e5',
      float: 'left',
      position: 'relative',
      width: 140,
      height: 140,
      marginRight: 10,
      marginBottom: 10
    },
    figureStyle: {
      width: '100%',
      height: '100%',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '0 0',
      backgroundSize: 'cover',
    },
    loadingStyle: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      marginLeft: -8,
      marginTop: -8,
      width: 16,
      height: 16,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '0 0'
    }
  }
}

class AlbumOrPhotoShareView extends Component {
  makeAlbumPhotoItemList() {
    const { albumHash, mediaShare } = this.props;
    const { itemStyle } = getStyles();

    return mediaShare
      .filter(media => media.digest === albumHash)[0]
      .doc
      .contents
      .map((media, index) => {
        return (
          <div key={ media.digest } data-hash={ media.digest } data-date={ media.digest } style={ itemStyle } onClick={ this.viewLargeImageHandle.bind(this, media.digest, index) }>
            <PhotoItem
              digest={ media.digest }
              albumDigest={ albumHash }
              path={ media.path }>
            </PhotoItem>
            { this.makeLoadingIcon(media.path) }
          </div>
        );
      });
  }

  shutdownMaskHandle() {
    const { dispatch } = this.props;

    dispatch(Action.toggleMedia(false));
    dispatch(Action.removeLargeImageList());
  }

  viewLargeImageHandle(digest, currentThumbIndex) {
    const { dispatch } = this.props;

    dispatch(Action.getLargeImageList(document.querySelectorAll('[data-date="'+ digest +'"]'), currentThumbIndex, digest));
    ipc.send('getMediaImage', { digest });
  }

  makeImageSwipeComponent() {
    const { largeImages, shareComponentEnterAnimateAble, view, shareRadios } = this.props;

    if (largeImages.data && largeImages.data.length) {
      return (
        <ImageSwipe
          width={ 960 }
          height={ 700 }
          shareComponentEnterAnimateAble={ shareComponentEnterAnimateAble }
          largeImages={ largeImages }
          view={ view }
          shareRadios={ shareRadios }>
        </ImageSwipe>
      );
    }
  }

  makeMaskComponent() {
    const { largeImages } = this.props;

    if (largeImages.data && largeImages.data.length) {
      return (
        <Mask className="large-image-mask" onShutdown={ this.shutdownMaskHandle.bind(this) }></Mask>
      );
    }
  }

  makeLoadingIcon(path) {
    const { loadingStyle } = getStyles();

    if (!path) {
      return (
        <img
          src={ loadingIcon }
          style={ loadingStyle } />
      );
    }
  }

  render() {
    const { rootStyle } = getStyles();

    return (
      <div className="clearfix" style={ rootStyle }>
        { this.makeAlbumPhotoItemList() }
        { this.makeMaskComponent() }
        { this.makeImageSwipeComponent() }
      </div>
    );
  }
}

const mapStateToProps = ({
  albumHash,
  media: { mediaShare },
  largeImages,
  shareComponentEnterAnimateAble,
  view,
  shareRadios
}) => ({
  albumHash,
  mediaShare,
  largeImages,
  shareComponentEnterAnimateAble,
  view,
  shareRadios
});

export default connect(mapStateToProps)(AlbumOrPhotoShareView);
