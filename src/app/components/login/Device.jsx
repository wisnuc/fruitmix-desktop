/**
 * @component Index
 * @description 查找设备
 * @time 2016-7-11
 * @author liuhua
 **/
 'use strict';
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react';

class Device extends React.Component {
	constructor(props) {
        super(props);
        this.state = { show: true };
    }
	render() {
		let setting = (
			<div>123</div>
			);
		return (
			<div>
				<div>
					<span>{this.props.item.addresses[0]}</span>
					<span></span>
				</div>
				{this.state.show && setting}
			</div>
			)
	}
}

export default Device