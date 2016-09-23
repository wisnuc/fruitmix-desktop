/**
  Radio(单选按钮) | 不可再分组件
**/

'use strict';

import React, { Component, PropTypes } from 'react';

class Radio extends Component {
	check() {
		const { radioCheck, radioUnCheck, checked } = this.props;

		!checked ? radioCheck(true) : radioUnCheck(false);
	}

	handleChange(e) {
		const { readOnly, changeEventHandle, value } = this.props;

		if (readOnly) {
		  return;	
		}

		this.check();

		if (changeEventHandle) {
			setTimeout(() => {
				const { checked } = this.props;

				changeEventHandle.call(this, value, checked);
			}, 0);
		}
	}

	render() {
		const {
			className,
			style,
			value,
			text,
			type,
			checked,
			readOnly
		} = this.props;

		return (
			<label className={ className } style={{ style }}>
				<input
					type={ type }
					value={ value }
					checked={ checked }
					readOnly={ readOnly }
					onChange={ this.handleChange.bind(this) } />
				{ text }
			</label>
		);
	}
}

Radio.propTypes = {
	radioCheck: PropTypes.func,
	radioUnCheck: PropTypes.func,
	className: PropTypes.string,
	style: PropTypes.object,
	text: PropTypes.string,
	changeEventHandle: PropTypes.func
};

Radio.defaultProps = {
	type: 'radio',
	checked: false,
	readOnly: false
};

export default Radio;
