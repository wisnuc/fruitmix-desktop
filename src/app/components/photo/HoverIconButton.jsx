/**
  HoverIconButton.jsx
**/

import React, { PropTypes } from 'react';

export default function HoverIconButton({ style, selectBehavior }) {
  return (
    <div style={ style } onClick={ selectBehavior }>
      <div style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

HoverIconButton.propTypes = {
  selectBehavior: PropTypes.func
}
