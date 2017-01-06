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
        <div style={{ clear: 'both' }}>
          <div style={{ float: 'left' }}>
            <button disabled style={{ display: 'inline-block', marginRight: 30, padding: '5px 10px', background: '#eee' }}>分享</button>
            <button disabled style={{ display: 'inline-block', marginRight: 30, padding: '5px 10px', background: '#eee' }}>相册</button>
            <button disabled style={{ display: 'inline-block', marginRight: 30, padding: '5px 10px', background: '#eee' }}>下载</button>
          </div>
          <div style={{ float: 'right' }}>
            <button style={{ display: 'inline-block', padding: '5px 10px', background: '#eee' }} onClick={this.props.onClearHoverToList}>清除全部</button>
          </div>
        </div>
      </div>
    );
  }
}

CarouselTopBar.propTypes = {
  style: PropTypes.object,
  onClearHoverToList: PropTypes.func
};
