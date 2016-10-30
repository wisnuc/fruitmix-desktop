/**
  CheckBox(单选按钮) | 不可再分组件
**/

'use strict';

import React, { Component, PropTypes } from 'react';

function getStyles () {
	return {
		checkbox: {
			verticalAlign: 'middle',
			marginRight: 5
		}
	}
}

export default class Checkbox extends Component {
	constructor(props) {
		super(props);
		this.state = { checked: this.props.checked };
		this.changeHandler = this.changeHandler.bind(this);
	}

	changeHandler() {
		const {
			readOnly,
			value,
			onChange } = this.props;

		if (readOnly) {
			return;
		}

		this.setState({ checked: !this.state.checked });

		setTimeout(() => {
		  onChange && onChange(value, this.state.checked);
		}, 0);
	}

	render() {
		const {
			className,
			style,
			value,
			text,
			readOnly } = this.props;
		const { checkbox } = getStyles();

		return (
			<label style={ style }>
				<input
				  type="checkbox"
					className={ className }
					style={ checkbox }
					value={ value }
					checked={ this.state.checked }
					readOnly={ readOnly }
					onChange={ this.changeHandler } />
				{ text }
			</label>
		);
	}
}

Checkbox.propTypes = {
	checked: PropTypes.bool,
	readOnly: PropTypes.bool,
	style: PropTypes.object,
	value: PropTypes.string.isRequired,
	text: PropTypes.string,
	onChange: PropTypes.func
}

Checkbox.defaultProps = {
	checked: false,
	readOnly: false
};
