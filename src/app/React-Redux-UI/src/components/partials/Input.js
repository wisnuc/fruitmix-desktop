/**
  Input(输入框) | 不可再分组件
**/

'use strict';

import React, { Component, PropTypes } from 'react';
import { numberExp, pick } from '../../utils';

class Input extends Component {
	handleChange(e) {
		/*
  	 * readOnly 是否只读
		 * isValidateValue 是否验证value
		 * isRealtime 是否实时请求
		*/
	  const {
			type,
			readOnly,
			isValidateValue,
			isRealtimeRequest,
		  changeEventHandle,
		  iptGetValue } = this.props;

		if (readOnly) {
		  return;
		}

		const value = e.target.value;

		// 如果input类型是输字输入框，并且需要进行输入值验证
		if (isValidateValue && type === 'number') {
			if (!numberExp.test(value))
			  return;
		}
		
		// 如果需要每次输入就请求
		if (isRealtimeRequest) {

		}

		iptGetValue && iptGetValue(value);
		changeEventHandle && changeEventHandle.call(this, value);
	}

  render() {
		const inputProps = [
			'className',
			'style',
			'type',
			'value',
			'placeholder',
			'readOnly',
			'onFocus',
			'onBlur'
		];

    return (
			<input
			{ ...pick(this.props, inputProps) }
			onChange={ this.handleChange.bind(this) } />
		);
	}
}

Input.propTypes = {
	type: PropTypes.oneOf([
		'text',
		'password',
		'number'
	]),
	className: PropTypes.string,
	style: PropTypes.object,
	value: PropTypes.any,
	placeholder: PropTypes.string,
	readOnly: PropTypes.bool,
	isValidateValue: PropTypes.bool,
	isRealtimeRequest: PropTypes.bool,
	fetch: PropTypes.object,
	onFocus: PropTypes.func,
	onBlur: PropTypes.func,
	changeEventHandle: PropTypes.func,
	iptGetValue: PropTypes.func
};

Input.defaultProps = {
	type: 'text',
	value: '',
	readOnly: false,
	isValidateValue: false,
	isRealtimeRequest: false
};

export default Input;
