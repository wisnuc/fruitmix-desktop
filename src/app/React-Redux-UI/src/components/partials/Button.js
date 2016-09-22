/**
  Button(按钮) | 不可再分组件
**/

'use strict';

import React, { Component, PropTypes } from 'react';

class Button extends Component {
  disable() {
		const { btnDisable } = this.props;
		btnDisable.call(this, true);
  }

	enable() {
		const { btnEnable } = this.props.btnEnable;
		btnEnable.call(this, false);
	}

	handleClick() {
		const { multied, clickEventHandle } = this.props;

		multied && this.disable();
		clickEventHandle.call(this);
	}

  render() {
		const { type, className, style, text, disabled } = this.props;

		return (
			<button
				type={ type }
				className={ className }
				style={ style }
				onClick={ this.handleClick.bind(this) }
				disabled={ disabled }>
		  { text }
			</button>
		);
  }
}

/**
  组件接收的props
**/
Button.propTypes = {
  btnDisable: PropTypes.func,                                  // 禁用action
  btnEnable: PropTypes.func,                                   // 可永action
  text: PropTypes.string,             										     // 文本
  className: PropTypes.string,            										 // class名
	style: PropTypes.object,																		 // 样式对象
 	type: PropTypes.oneOf(['submit', 'button']),                 // 按钮类型
	clickEventHandle: PropTypes.func,            								 // 事件处理程序
  disabled: PropTypes.bool,               										 // 是否禁用
	multied: PropTypes.bool																		   // 是否多次点击
};

export default Button;
