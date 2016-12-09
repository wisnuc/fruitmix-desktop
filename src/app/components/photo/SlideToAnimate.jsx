/**
  SlideToAnimate.jsx
**/

import React, { Component, PropTypes } from 'react';

export default class SlideToAnimate extends Component {
  constructor() {
    super();

    this.style = {
      root: {
        position: 'relative',
        height: '100%',
        overflow: 'hidden'
      },
      dire: {
        background: '#eee',
        height: 20,
        position: 'absolute',
        width: 20,
        top: 35
      },
      leftDire: {
        left: -35
      },
      rightDire: {
        right: -35
      },
      translate: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: '100%',
      }
    };

    this.state = {
      live: true
    };

    this.leftDireStyle = Object.assign({}, this.style.dire, this.style.leftDire);
    this.rightDireStyle = Object.assign({}, this.style.dire, this.style.rightDire);

    this.translateLeft = () => {

    };

    this.translateRight = () => {

    };
  }

  render() {
    const { style, children } = this.props;

    return (
      <div style={ style }>
        <div style={ this.style.root }>
          <a href="javascript:;" style={ this.leftDireStyle } onClick={ this.translateLeft }></a>
          <a href="javascript:;" style={ this.rightDireStyle } onClick={ this.translateRight }></a>
          <div style={ this.style.translate }>
            { children }
          </div>
        </div>
      </div>
    );
  }
}

SlideToAnimate.propTypes = {
  style: PropTypes.object,
  translateDistance: PropTypes.number.isRequired,
  children: PropTypes.element.isRequired
};
