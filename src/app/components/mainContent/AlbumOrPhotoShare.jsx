// AlbumOrPhotoShare

import React, { Component } from 'react';
import { connect } from 'react-redux';


class AlbumOrPhotoShare extends Component {
  render() {
    return (
      <div>
        分享
      </div>
    );
  }
}

const mapStateToProps = ({ media }) => ({

});

export default connect(mapStateToProps)(AlbumOrPhotoShare);
