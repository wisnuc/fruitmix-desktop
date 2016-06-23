/**
 * @component Setting
 * @description Setting
 * @time 2016-5-30
 * @author liuhua
 **/
  'use strict';
// require core module
 import React, { findDOMNode, Component, PropTypes } from 'react';
 import { connect, bindActionCreators } from 'react-redux';

 class Setting extends Component {
 	render() {
 		return (
 			<div className='Setting'>123</div>
 			)
 	}
 }

function mapStateToProps (state) {
	return {
		data: state.data
	}
}

export default connect(mapStateToProps)(Setting);