/**
  对话框
**/

import React, { Component, PropTypes } from 'react';

function getStyles(props) {
  const { dialogWidth } = props;

  return {
    root: {
      boxShadow: '0 0 15px rgba(0,0,0,.5)',
      backgroundColor: '#fff',
      left: '50%',
      top: '50%',
      position: 'fixed',
      width: dialogWidth,
      WebkitTransform: 'translate(-50%, -50%)'
    },
    head: {
      backgroundColor: '#5c6bc0',
      color: '#fff',
      fontSize: 20,
      height: 80,
      lineHeight: '80px',
      padding: '0 40px 0 80px',
      position: 'relative'
    },
    close: {
      position: 'absolute',
      top: 0,
      right: 40,
      fontSize: 30
    }
  }
}

export default class Dialog extends Component {
  render() {
    let { root, head, close } = getStyles(this.props);
    const { caption, onClose, content, foot, orientation, style } = this.props;

    if (orientation === 'custom') {
      root = Object.assign({}, root, style);
    }

    return (
      <div className="dialog" style={ root }>
        <div className="dialog-head" style={ head }>
          { caption }
          <label style={ close } onClick={ onClose }>x</label>
        </div>
        <div className="dialog-body">
          { content }
          { foot }
        </div>
      </div>
    );
  }
}

Dialog.propTypes = {
  dialogWidth: PropTypes.number,
  orientation: PropTypes.oneOf(['custom', 'center']),
  caption: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  content: PropTypes.node.isRequired,
  foot: PropTypes.node
};

Dialog.defaultProps = {
  orientation: 'center'
};
