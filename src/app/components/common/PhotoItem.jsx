// 图片项

import React, { Component, PropTypes } from 'react';

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

export default class PhotoItem extends Component {
  render() {
    const { imgStyle, loadingIconStyle } = getStyles();
    const { path } = this.props;
    const isPath = !!path;

    return (
      <img
        style={ isPath ? imgStyle : loadingIconStyle }
        src={ isPath ? path : loadingIcon }>
      </img>
    );
  }

  componentDidMount() {
    const { digest, path, albumDigest } = this.props;
    !path && ipc.send('getAlbumThumb', { digest }, albumDigest);
  }
}

PhotoItem.propTypes = {
  digest: PropTypes.string.isRequired,
  albumDigest: PropTypes.string.isRequired,
  path: PropTypes.any
};
