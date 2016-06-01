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
 import { TextField, FlatButton } from 'material-ui';

 class Setting extends Component {
 	render() {
 		return (
 			<div className='Setting'>
	 			<div className='register-container'>
	 				<TextField
		 			hintText="用户名" ref='username'
		 			/><br />
		 			<TextField
		 			hintText="密码" ref='password'
		 			/><br />
		 			<TextField
		 			hintText="邮箱" ref='email'
		 			/><br />
		 			<FlatButton label="重置" primary={true} onTouchTap={this.reset.bind(this)}/>
    					<FlatButton label="注册" secondary={true} onTouchTap={this.register.bind(this)}/>
	 			</div>
 			</div>
 			)
 	}

 	reset() {

 	}

 	register() {
 		let u = this.refs.username.input.value;
 		let p = this.refs.password.input.value;
 		let e = this.refs.email.input.value
 		ipc.send('create-new-user',u,p,e);
 	}
 }

function mapStateToProps (state) {
	return {
		data: state.data,
		user: state.user
	}
}

export default connect(mapStateToProps)(Setting);