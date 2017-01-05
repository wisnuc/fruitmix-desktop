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
        borderRadius: '100%',
        background: '#eee',
        height: 35,
        position: 'absolute',
        width: 35,
        top: '50%',
        transform: 'translateY(-50%)'
      },
      leftDire: {
        left: -50
      },
      rightDire: {
        right: -50
      },
      translate: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: '100%',
        transition: 'transform .2s cubic-bezier(0, 1, .5, 1)'
      }
    };

    this.leftDireStyle = Object.assign({}, this.style.dire, this.style.leftDire, { left: this.props.direLeft });
    this.rightDireStyle = Object.assign({}, this.style.dire, this.style.rightDire, { right: this.props.direRight });

    this.state = {
      currentIndex: props.activeIndex
    };

    this.translateLeft = () => {
      if (this.state.currentIndex - 1 < 0)
        return;

      const nextIndex = this.state.currentIndex - 1;

      if (this.props.translateLeftCallback(nextIndex) === false)
        return;

      this.setState({ currentIndex: nextIndex });
    };

    this.translateRight = () => {
      if (this.state.currentIndex + 1 >= this.translateCount)
        return;

      const prevIndex = this.state.currentIndex + 1;

      if (this.props.translateRightCallback(prevIndex) === false) {
        console.log('rt');
        return;
      }

      this.setState({ currentIndex: prevIndex });
    };

    this.transformTranslateStyle = () => {
      const { translateDistance, translateGrep } = this.props;
      let currentIndexDistance = -translateDistance * this.state.currentIndex;
      this.state.currentIndex && (currentIndexDistance -= translateGrep * this.state.currentIndex);

      return {
        transform: `translate3d(${currentIndexDistance}px, 0, 0)`
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
  style: PropTypes.object.isRequired,
  translateDistance: PropTypes.number.isRequired,
  translateGrep: PropTypes.number,
  translateCount: PropTypes.number.isRequired,
  children: PropTypes.element.isRequired,
  translateLeftCallback: PropTypes.func,
  translateRightCallback: PropTypes.func,
  activeIndex: PropTypes.number
};

SlideToAnimate.defaultProps = {
  activeIndex: 0,
  translateGrep: 0,
  translateLeftCallback: () => {},
  translateRightCallback: () => {}
};
