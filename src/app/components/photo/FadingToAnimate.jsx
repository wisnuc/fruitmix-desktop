/**
  FadingToAnimate.jsx
**/

import React, { PropTypes } from 'react';

function getStyles(duration, opacity) {
  return {
    width: '100%',
    height: '100%',
    transition: `opacity ${duration}s cubic-bezier(0, 1, .5, 1)`,
    opacity
  }
}

const FadingToAnimate = ({ children, duration, flag, style }) => (
  <div style={ style }>
    <div style={ getStyles(duration, flag === 'in' ? 1 : 0) }>
      { children }
    </div>
  </div>
);

FadingToAnimate.propTypes = {
  style: PropTypes.object,
  children: PropTypes.node.isRequired,
  duration: PropTypes.number,
  flag: PropTypes.bool
};

FadingToAnimate.defaultProps = {
  duration: 1.5,
  flag: 'in'
};

export default FadingToAnimate;
