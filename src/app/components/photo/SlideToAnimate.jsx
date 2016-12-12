/**
  SlideToAnimate.jsx
**/

import React, { Component, PropTypes } from 'react';

export default class SlideToAnimate extends Component {
  constructor(props) {
    super(props);

    this.style = {
      root: {
        position: 'relative',
        height: '100%'
      },
      slidection: {
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
        transition: 'transform .35s linear'
      }
    };

    this.leftDireStyle = Object.assign({}, this.style.dire, this.style.leftDire);
    this.rightDireStyle = Object.assign({}, this.style.dire, this.style.rightDire);

    this.state = {
      activeIndex: 0
    };

    this.translateLeft = () => {
      if (this.state.activeIndex - 1 < 0)
        return;

      this.setState({ activeIndex: this.state.activeIndex - 1 });
    };

    this.translateRight = () => {
      if (this.state.activeIndex + 1 >= this.translateCount)
        return;

      this.setState({ activeIndex: this.state.activeIndex + 1 });
    };

    this.transformTranslateStyle = () => {
      const { translateDistance } = this.props;
      let activeIndexDistance = -translateDistance * this.state.activeIndex;

      this.state.activeIndex && (activeIndexDistance -= 10);
      
      return {
        transform: `translate3d(${activeIndexDistance}px, 0, 0)`
      };
    };

    this.reset = ({ translateCount }) => {
      this.translateCount = translateCount;
    };

    this.reset(props);
  }

  componentWillReceiveProps(nextProps) {
    this.reset(nextProps);
  }

  render() {
    const { style, children } = this.props;
    const slideStyle = Object.assign({}, this.style.translate, this.transformTranslateStyle());

    return (
      <div style={ style }>
        <div style={ this.style.root }>
          <a href="javascript:;" style={ this.leftDireStyle } onClick={ this.translateLeft }></a>
          <a href="javascript:;" style={ this.rightDireStyle } onClick={ this.translateRight }></a>
          <div style={ this.style.slidection }>
            <div style={ slideStyle }>
              { children }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

SlideToAnimate.propTypes = {
  style: PropTypes.object,
  translateDistance: PropTypes.number.isRequired,
  translateCount: PropTypes.number.isRequired,
  children: PropTypes.element.isRequired
};
