/**
 * @component Index
 * @description 首页组件
 * @time 2016-4-5
 * @author liuhua
 **/
 'use strict';
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react';
import { connect, bindActionCreators } from 'react-redux'
import Base from '../../utils/Base';
// require action
import Login from'../../actions/action';
//require material
import { Paper, TextField, FlatButton, CircularProgress } from 'material-ui'
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';

// require common mixins
import ImageModules from '../Mixins/ImageModules'; 
//import CSS
import css  from  '../../../assets/css/login';

// define Index component
class Index extends React.Component {

	mixins: [ImageModules]

	getChildContext() {
		const muiTheme = getMuiTheme(darkBaseTheme);
		return {muiTheme};
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.login.state == 'LOGGEDIN') {
			window.location.hash = '/main'
		}
	}

	componentDidMount() {
		ipc.on('loggedin',(err,user,allUser)=>{
			console.log(allUser);
			this.props.dispatch(Login.login(user));
		});

		ipc.on('loginFailed',()=>{
			this.props.dispatch(Login.loginFailed());
		})
	}

	submit() {
		// let username = this.refs.username.value;
		// let password = this.refs.password.value;
		// this.props.dispatch(Action.login(username,password));
		this.props.dispatch({
		      type: "LOGIN"
		})
		// 		setTimeout( () => {
		// 	this.props.dispatch(Login.login());
		// },2);
		ipc.send('login','111111','111111');
	}

	render() {
		var _this = this;
		const paperStyle = {
			display : 'flex',
			flexDirection : 'column',
			alignItems: 'center',
			justifyContent: 'center',
			height: 120,
			width: 300,
			padding: 10
		}
		var busy = (this.props.login.state ==='BUSY');
		return (
			<div className='index-frame' key='login'>
				<Paper style={paperStyle} zDepth={4}>
				{ !!busy && <CircularProgress /> }
				{ !busy && <TextField  stype={{marginBottom: 10}} hintText="password" type="password" fullWidth={true} />}
				{ !busy && <FlatButton style={{marginTop: 10}} label='UNLOCK' onTouchTap={this.submit.bind(this)} />}
				</Paper>
			{/*
				<label ref='username'>username</label><input type="text" ref="username"/><br/>
				<label ref="password">password</label><input type="password" ref="password"/><br/>
				<button onClick={this.submit}>submit</button>
				<div>{this.props.login.state}</div>
			*/}
			</div>
			);
	}
};

Index.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired,
};



function mapStateToProps (state) {
	return {
		login: state.login
	}
}

export default connect(mapStateToProps)(Index);
