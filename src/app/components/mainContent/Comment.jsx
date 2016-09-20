/**
  @description 评论组件
  @author zengwenbing
  @date 2016-9-19
**/

import React, { Component, PropTypes } from 'react';

function getStyles () {
  return {
    header: {
      textAlign: 'center',
			lineHeight: '40px',
			fontSize: 12,
			color: '#fff',
			backgroundColor: 'rgba(0,0,0,.2)',
			borderBottom: '1px solid rgba(0,0,0,.25)',
      borderTop: '1px solid rgba(0,0,0,.25)'
    },
    body: {

    }
  };
}

export default class Comment extends Component {
  render() {
    const { header } = getStyles();

    return (
      <div className="comment-box">
        <div className="comment-header" style={ header }>评论</div>
      </div>
    );
  }
}
