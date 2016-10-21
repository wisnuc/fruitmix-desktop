// 图片项

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import loadingIcon from '../../../assets/images/index/loading.gif';

function getStyles() {
  return {
    imgStyle: {
      display: 'block',
      height: '100%',
      objectFit: 'cover',
      width: '100%'
    },
    loadingIconStyle: {
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
  };
}

class PhotoItem extends Component {
  render() {
    const { imgStyle, loadingIconStyle } = getStyles();
    const { path, isLargeImageVisible, largeImagePath } = this.props;
    const isPath = isLargeImageVisible ? !!largeImagePath : !!path;

    return (
      <img
        style={ isPath ? imgStyle : loadingIconStyle }
        src={ isPath ? isLargeImageVisible ? largeImagePath : path : loadingIcon }>
      </img>
    );
  }

  componentDidMount() {
    const { digest, path, largeImagePath, albumDigest, isLargeImageVisible } = this.props;

    if (isLargeImageVisible) {
      if (!largeImagePath) {
        ipc.send('getMediaImage', digest);
      }
    } else {
      if (!path) {
        ipc.send('getAlbumThumb', { digest }, albumDigest);
      }
    }
  }
}

PhotoItem.propTypes = {
  digest: PropTypes.string.isRequired,
  albumDigest: PropTypes.string.isRequired,
  path: PropTypes.any,
  isLargeImageVisible: PropTypes.bool
};

PhotoItem.propTypes = {
  isLargeImageVisible: false
};

const mapStateToProps = ({ view: { currentMediaImage: { path } } }) => ({ largeImagePath: path });

export default connect(mapStateToProps)(PhotoItem);
