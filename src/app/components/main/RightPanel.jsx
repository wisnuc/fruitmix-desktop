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
      borderSizing: 'border-sizing',
      width: '100%',
      borderLeft: '1px solid #e0e0e0',
      right: 0,
      top: 50,
      bottom: 0,
      height: '100%'
    },
    itemHeader: {
      display: 'block',
      textAlign: 'center',
			lineHeight: '38px',
			fontSize: 14,
      fontWeight: 700,
			color: '#949494',
      backgroundColor: '#f5f5f5'
    },
    itemBody: {
      overflow: 'hidden',
      transition: 'max-height .5s cubic-bezier(0, 1, .5, 1)',
      backgroundColor: '#fff'
    },
    photoItemBody: {
      height: 144,
      maxHeight: 144
    },
    shareItemBody: {
      height: 310,
      maxHeight: 310
    }
  }
}

export default class RightPanel extends Component {
  render() {
    const { dispatch, width, state } = this.props;
    const {
      root,
      rootInner,
      itemHeader,
      itemBody,
      photoItemBody,
      shareItemBody } = getStyles();
    const newRootInnerStyle = Object.assign({}, rootInner, { width: width });
    const newPhotoItemBodyStyle = Object.assign({}, itemBody, photoItemBody);
    const newShareItemBodyStyle = Object.assign({}, itemBody, shareItemBody);

    return (
      <div className="right-panel" style={ root }>
        <div className="right-panel-inner" style={ newRootInnerStyle }>

          <div className="right-panel-inner-item">
            <label htmlFor="photo_f" className="item-header" style={ itemHeader }>照片信息</label>
            <input id="photo_f" type="checkbox" className="slide-emit" />
            <div className="item-body" style={ newPhotoItemBodyStyle }>
              {/* 照片信息组件 */}
              <PhotoInfo></PhotoInfo>
            </div>
          </div>

          <div className="right-panel-inner-item" >
            <label htmlFor="share_f" className="item-header" style={ itemHeader }>分享</label>
            <input id="share_f" type="checkbox" className="slide-emit" />
            <div className="item-body" style={ newShareItemBodyStyle }>
              {/* 分享组件 */}
              <Share dispatch={ dispatch } state={ state }></Share>
            </div>
          </div>

          <div className="right-panel-inner-item" >
            <div className="item-header" style={ itemHeader }>评论</div>
              {/* 评论组件 */}
              <Comment></Comment>
          </div>
        </div>
      </div>
    );
  }
}

RightPanel.propTypes = {
  /**
    component width
  **/
  width: PropTypes.number.isRequired
};
