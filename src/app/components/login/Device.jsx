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
	render() {
		return (
			<div>{this.props.item.addresses[0]}</div>
			)
	}
}

export default Device