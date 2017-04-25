/**
  CheckboxGroup(复选框容器组件)
**/

'use strict';

import React, { Component, PropTypes } from 'react';
import Checkbox from './Checkbox';
import {
  getType,
  objectToArray,
  values,
  replacePlaceholder,
  valuesToArray } from '../../utils';

class CheckboxGroup extends Component {
	constructor(props) {
		super(props);
		this.init();
	}

	init(nextProps) {
    this.defaultCheckedValues = (nextProps || this.props).defaultCheckedValues;
		this.data = this.formatData(nextProps);
	}

	componentWillReceiveProps(nextProps) {
		this.init(nextProps);
	}

  formatData(nextProps) {
    let {data, textTpl, valueTpl } = (nextProps || this.props);

    // 如果data是对象
    if (getType(data) === 'object')
			data = objectToArray(data, 'value', 'text');

		data = data.map((item, index) => {
			item.$text = replacePlaceholder(textTpl, item);
			item.$value = replacePlaceholder(valueTpl, item);
			item.$key = item.id || this.createID(index);
			item.$checked = this.defaultCheckedValues.indexOf(item.$value) >= 0;
			return item;
		});

		return data;
  }

	createID(index) {
		return 'c' + index;
	}

	setValues(value, checked, checkboxIndex) {
    const { separator } = this.props;
    const valueExp = new RegExp('\\'+ ( separator + value ) +'');

		if (checked)
      this.defaultCheckedValues = this.defaultCheckedValues.replace(valueExp, '');
    else
      this.defaultCheckedValues += (separator + value);
	}

	handleChange(value, checked, checkboxIndex) {
		const { cboxGroupCheck, separator } = this.props;

		this.setValues.apply(this, arguments);
		cboxGroupCheck(this.defaultCheckedValues);
	}

  renderItems() {
		const { readOnly, cboxCheck, cboxUnCheck } = this.props;

		return this.data.map((item, index) =>
			<Checkbox
				key={ item.$key }
				readOnly={ readOnly }
				changeEventHandle={ this.handleChange.bind(this) }
				checked={ item.$checked }
				text={ item.$text }
				autoFlush={ false }
				index={ index }
				value={ item.$value }>
			</Checkbox>
		);
  }

  render() {
		const { className, style } = this.props;

		return (
			<div className={ className } style={ style }>
				{ this.renderItems() }
			</div>
		);
  }
}

CheckboxGroup.propTypes = {
  className: PropTypes.string,							// class名
  style: PropTypes.object,								  // 样式
  data: PropTypes.oneOfType([							  // 子checkbox数据
    PropTypes.array,
    PropTypes.object
  ]),
  fetch: PropTypes.object,									// 请求远程信息
  direction: PropTypes.oneOf([							// 子checkbox排列方向
    'horizontal',
    'vertical'
  ]),
	defaultCheckedValues: PropTypes.oneOfType([ // 默认选中value为defaultCheckedValue指定的值的checkbox
		PropTypes.string,
		PropTypes.array
	]),
  changeEventHandle: PropTypes.func,				  // change event trigger
	cboxGroupCheck: PropTypes.func
};

CheckboxGroup.defaultProps = {
  data: [],
	defaultCheckedValues: '',
	separator: '|',
  order: 'horizontal',
  checked: false,
  readOnly: false,
	textTpl: '{text}',
	valueTpl: '{value}'
};

export default CheckboxGroup;
