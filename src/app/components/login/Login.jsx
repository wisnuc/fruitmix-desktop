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
import { Paper, TextField, FlatButton, CircularProgress, Snackbar } from 'material-ui'
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
			// this.props.dispatch(Login.cleanSnack());
			window.location.hash = '/main';
		}
	}

	componentDidMount() {
		ipc.on('loggedin',(err,user,allUser)=>{
			this.props.dispatch(Login.login(user));
		});

		ipc.on('loginFailed',()=>{
			this.props.dispatch(Login.loginFailed());
		})
		ipc.on('message',(err,message,code)=>{
			this.props.dispatch(Login.setSnack(message,true));
			if (code == 0 ) {
				this.props.dispatch(Login.loginFailed());		
			}
		});
	}

	submit() {
		let username = this.refs.username.input.value;
		let password = this.refs.password.input.value;
		this.props.dispatch({
		      type: "LOGIN"
		})
		// ipc.send('login',username,password);
		// ipc.send('login','aaa','aaa');
		ipc.send('login','admin','123456');
		// ipc.send('login','22','22');
		// ipc.send('login','1','1');
	}

	render() {
		var _this = this;
		const paperStyle = {
			display : 'flex',
			flexDirection : 'column',
			alignItems: 'center',
			justifyContent: 'center',
			height: 170,
			width: 300,
			padding: 10
		}
		var busy = (this.props.login.state ==='BUSY');
		return (
			<div className='index-frame' key='login'>
				<Paper style={paperStyle} zDepth={4}>
				{ !!busy && <CircularProgress /> }
				{ !busy && <TextField ref='username'  stype={{marginBottom: 10}} hintText="username" type="username" fullWidth={true} />}
				{ !busy && <TextField ref='password' stype={{marginBottom: 10}} hintText="password" type="password" fullWidth={true} />}
				{ !busy && <FlatButton style={{marginTop: 10}} label='UNLOCK' onTouchTap={this.submit.bind(this)} />}
				</Paper>
			{/*
				<label ref='username'>username</label><input type="text" ref="username"/><br/>
				<label ref="password">password</label><input type="password" ref="password"/><br/>
				<button onClick={this.submit}>submit</button>
				<div>{this.props.login.state}</div>
			*/}
			<Snackbar open={this.props.snack.open} message={this.props.snack.text} autoHideDuration={3000}/>
			</div>
			);
	}
};

Index.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired,
};



function mapStateToProps (state) {
	return {
		login: state.login,
		snack: state.snack
	}
}
	
export default connect(mapStateToProps)(Index);
