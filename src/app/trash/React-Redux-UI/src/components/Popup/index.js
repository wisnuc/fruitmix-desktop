/**
  弹出框基类组件 | 容器组件
**/

'use strict';

import React, { Component, PropTypes } from 'react';
import './index.less';

class Popup extends Component {
  hide() {
    this.el.parentNode.removeChild(this.el);
  }
}

Popup.propTypes = {
  /**
   * class
  */
  className: PropTypes.string,

  /**
   * 是否是模式弹出层
  */
  isModal: PropTypes.bool,

  /**
   * 是否含关闭按钮
  */
  isCloseBtn: PropTypes.bool,

  /**
   * 是否延时自动关闭
  */
  isDelayAutoClose: PropTypes.bool,

  /**
   * 样式
  */
  style: PropTypes.object
};

Popup.defaultProps = {
  isModal: true,
  isDelayAutoClose: false,
  isCloseBtn: true
};

export default Popup;
