/**
  CarouselTopBar.jsx
**/

import React, { Component, PropTypes } from 'react';

export default class CarouselTopBar extends Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div style={ this.props.style }>
        <div style={{ lineHeight: 1 }}>
          <button>分享</button>
          <button>相册</button>
          <button>下载</button>
        </div>
      </div>
    );
  }
}

CarouselTopBar.propTypes = {
  style: PropTypes.object
};
