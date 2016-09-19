/**
  CheckBox(单选按钮) | 不可再分组件
**/

'use strict';

import React, { Component, PropTypes } from 'react';

class Checkbox extends Component {
	check() {
		const { cboxCheck, cboxUnCheck, checked } = this.props;
		!checked ? cboxCheck(true) : cboxUnCheck(false);
	}

  handleChange(e) {
    const { readOnly, changeEventHandle, value, autoFlush } = this.props;

    if (readOnly)
      return;

    if (autoFlush) {
		  this.check();	
		}

		if (changeEventHandle) {
			setTimeout(() => {
				const { checked, index } = this.props;
				changeEventHandle.call(this, value, checked, index);
			}, 0);
		}
  }

  render() {
    const {
      className,
      style,
      type,
      text,
      value,
      checked,
      readOnly
    } = this.props;

    return (
      <label className={ className } style={ style }>
        <input
          type={ type }
          value={ value }
          readOnly={ readOnly }
          checked={ checked }
          onChange={ this.handleChange.bind(this) } />
        { text }
      </label>
    );
  }
}

Checkbox.propTypes = {
	cboxCheck: PropTypes.func,												// 选中动作
	cboxUnCheck: PropTypes.func,										  // 取消选中动作
  className: PropTypes.string,                      // class名
  style: PropTypes.object,                          // 样式对象
  text: PropTypes.string,                           // 文本
  value: PropTypes.string,                          // value
	index: PropTypes.number,													// 索引
  changeEventHandle: PropTypes.func                 // 选中状态改变处理器
};

Checkbox.defaultProps = {
  type: 'checkbox',                                 // checkbox 单选框
  checked: false,                                   // 不选中
  readOnly: false,                                  // 可进行选中操作
  autoFlush: true                                   // 是否由组件刷新
}

export default Checkbox;
