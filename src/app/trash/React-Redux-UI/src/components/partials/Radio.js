/**
  Radio(单选按钮) | 不可再分组件
**/

'use strict';

import React, { Component, PropTypes } from 'react';

function getStyles () {
	return {
		radio: {
			verticalAlign: 'middle',
			marginRight: 5
		}
	}
}

class Radio extends Component {
	constructor() {
		super();

		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e) {
		const {
			readOnly,
			checked,
			changeEventHandle,
			value } = this.props;

		if (readOnly) {
		  return;
		}

		changeEventHandle && changeEventHandle(value, checked);
	}

	render() {
		const {
			className,
			style,
			value,
			text,
			type,
			checked,
			readOnly } = this.props;

		const { radio } = getStyles();

		return (
			<label className={ className } style={ style }>
				<input
					type="radio"
					style={ radio }
					value={ value }
					checked={ checked }
					readOnly={ readOnly }
					onChange={ this.handleChange } />
				{ text }
			</label>
		);
	}
}

Radio.propTypes = {
	className: PropTypes.string,
	checked: PropTypes.bool,
	readOnly: PropTypes.bool,
	style: PropTypes.object,
	text: PropTypes.string,
	changeEventHandle: PropTypes.func
};

Radio.defaultProps = {
	checked: false,
	readOnly: false
};

export default Radio;
