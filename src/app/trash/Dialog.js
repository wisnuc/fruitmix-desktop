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
      backgroundColor: '#f6f7f9',
      color: '#7f7f7f',
      fontSize: 16,
      lineHeight: '55px',
      padding: '0 20px',
      textAlign: 'center',
      position: 'relative'
    },
    close: {
      backgroundColor: '#7f7f7f',
      position: 'absolute',
      top: 18,
      width: 13,
      height: 2,
      right: 20,
      fontSize: 0,
      transform: 'rotate(45deg) translate(8px, 4px)'
    },
    failClose: {
      display: 'inline-block',
      width: 13,
      height: 2,
      backgroundColor: '#7f7f7f',
      transform: 'rotate(-85deg) translate(25px,-2px)'
    }
  }
}

export default class Dialog extends Component {
  render() {
    let { root, head, close, failClose } = getStyles(this.props);
    const {
       caption,
       onClose,
       content,
       foot,
       orientation,
       style
     } = this.props;

    if (orientation === 'custom') {
      root = Object.assign({}, root, style);
    }

    return (
      <div className="dialog" style={ root }>
        <div className="dialog-head" style={ head }>
          { caption }
          <label style={ close } onClick={ onClose }>
            <i style={ failClose }></i>
          </label>
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
