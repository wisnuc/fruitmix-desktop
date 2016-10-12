/**
  对话框
**/

import React, { Component, PropTypes } from 'react';

function getStyles(props) {
  return {
    root: {
      boxShadow: '0 0 15px rgba(0,0,0,.5)',
      backgroundColor: '#fff',
      left: '50%',
      top: '50%',
      position: 'fixed',
      width: props.dialogWidth,
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
    contentStyle: {
      padding: '40px 80px'
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
    const { root, head, close, contentStyle } = getStyles(this.props);
    const { caption, onClose, content, foot } = this.props;

    return (
      <div className="dialog" style={ root }>
        <div className="dialog-head" style={ head }>
          { caption }
          <label style={ close } onClick={ onClose }>x</label>
        </div>
        <div className="dialog-body" style={ contentStyle }>
          { content }
          { foot }
        </div>
      </div>
    );
  }
}

Dialog.propTypes = {
  dialogWidth: PropTypes.number.isRequired,
  caption: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  content: PropTypes.node.isRequired,
  foot: PropTypes.node
};
