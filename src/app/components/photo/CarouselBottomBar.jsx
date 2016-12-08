/**
  CarouselBottomBar.jsx
**/

import React, { Component, PropTypes } from 'react';

export default class CarouselBottomBar extends Component {
  constructor() {
    super();

    this.style = {
      root: {
        fontSize: 14,
        opacity: .87
      },
      specialFont: {
        fontSize: 16,
        fontWeight: 700
      }
    };
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.count !== this.props.count;
  }

  render() {
    const { style, count } = this.props;

    return (
      <div style={ style }>
        <span style={ this.style.root }>选中<b>{ count }</b>张照片</span>
      </div>
    );
  }
}

CarouselBottomBar.propTypes = {
  style: PropTypes.object,
  count: PropTypes.number
};
