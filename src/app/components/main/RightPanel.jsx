/**
  右侧面板
**/

import React, { Component, PropTypes } from 'react';
import PhotoInfo from '../mainContent/PhotoInfo';
import Share from '../mainContent/Share';
import Comment from '../mainContent/Comment';

function getStyles () {
  return {
    root: {
      position: 'relative'
    },
    rootInner: {
      position: 'fixed',
      boxSizing: 'border-sizing',
      width: '100%',
      borderLeft: '1px solid #e0e0e0',
      right: 0,
      top: 120,
      bottom: 0,
      height: '100%',
      backgroundColor: '#263238'
    }
  }
}

export default class RightPanel extends Component {
  render() {
    const width = this.props.width;
    const { root, rootInner } = getStyles();
    const newRootInnerStyle = Object.assign({}, rootInner, { width: width });

    return (
      <div className="right-panel" style={ root }>
        <div
          className="right-panel-inner"
          style={ newRootInnerStyle }>

          {/* 照片信息组件 */}
          <PhotoInfo />

          {/* 分享组件 */}
          <Share />

          {/* 评论组件 */}
          <Comment />
        </div>
      </div>
    );
  }
}

RightPanel.propTypes = {
  /**
    component width
  **/
  width: PropTypes.string.isRequired
};
