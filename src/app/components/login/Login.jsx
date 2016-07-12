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
import { Paper, TextField, FlatButton, CircularProgress, Snackbar, SelectField, MenuItem } from 'material-ui';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';

// require common mixins
import ImageModules from '../Mixins/ImageModules'; 
//import CSS
import css  from  '../../../assets/css/login';
//import Action
import Action from '../../actions/action';
//import component
import Device from './Device'
//import svg
import svg from '../../utils/SVGIcon';

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
		ipc.send('getDeviceUsedRecently');
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

		ipc.on('device',(err,device)=>{
			this.props.dispatch(Login.setDevice(device));
		});

		ipc.on('setDeviceUsedRecently',(err,ip)=>{
			this.props.dispatch(Action.setDeviceUsedRecently(ip));
		});
	}

	submit() {
		let username = this.refs.username.input.value;
		let password = this.refs.password.input.value;
		this.props.dispatch({
		      type: "LOGIN"
		})
		ipc.send('login',username,password);
		// ipc.send('login','admin','123456');
		// ipc.send('login','a','a');
	}

	render() {
		var _this = this;
		
		
		let findDevice = this.props.login.findDevice;
		let findDeviceContent = (
				<Paper className='find-device-container'>
					{/*
					<Tabs style={{backgrountColor:'rgb(48,48,48)'}}>
						<Tab label="自动匹配">
							<Paper>
							{this.props.login.device.map(item=>(
								<Device key={item.addresses[0]} item={item}></Device>
								))}
							</Paper>
						</Tab>
						<Tab label="手动匹配">
							<Paper className='setting-serverIP-container'>
								<TextField  ref='serverIP' hintText='serverIP' fullWidth={true}/>
								<FlatButton style={{marginTop: 10,width:'100px'}} label='提交' onTouchTap={this.submitServer.bind(this)} />
							</Paper>
						</Tab>
					</Tabs>
					*/}
					123
				</Paper>
			);

		let loginContent;
		let busy = (this.props.login.state ==='BUSY');
		let device = this.props.login.device; 
		if (!busy) {
			loginContent = (
				<Paper className='login-container' zDepth={4}>
					<div className='login-device-title'>已发现 {device.length} 台 wisnuc</div>
					<div className='login-device-list'>
						<SelectField value={this.props.login.deviceUsedRecently} autoWidth={true} onChange={this.selectDevice.bind(this)}>
							{device.map(item=>(
								<MenuItem key={item.addresses[0]} value={item.addresses[0]} primaryText={item.host}></MenuItem>
								))}
						</SelectField>
						<span className='open-device-icon' onClick={this.toggleDevice.bind(this)}>{svg.settings()}</span>
					</div>
					<TextField ref='username'  stype={{marginBottom: 10}} hintText="username" type="username" fullWidth={false} />
					<TextField onKeyDown={this.kenDown.bind(this)} ref='password' stype={{marginBottom: 10}} hintText="password" type="password" fullWidth={false} />
					<FlatButton style={{marginTop: 10}} label='UNLOCK' onTouchTap={this.submit.bind(this)} />
				</Paper>
				)
		}else {
			loginContent= (
				<Paper style={{alignItems:'center'}} className='login-container' zDepth={4}>
					<CircularProgress />
				</Paper>
				)
		}

		return (
			<div className='index-frame' key='login'>
				{!!findDevice && findDeviceContent}
				{!findDevice && loginContent}
				<Snackbar open={this.props.snack.open} message={this.props.snack.text} autoHideDuration={3000} onRequestClose={this.cleanSnack.bind(this)}/>
			</div>
			);
	}

	kenDown(e) {
		if (e.nativeEvent.which == 13) {
			this.submit();
		}
	}

	//close snackbar
	cleanSnack() {
		this.props.dispatch(Action.cleanSnack());
	}

	toggleDevice() {
		this.props.dispatch(Action.toggleDevice());
	}

	submitServer() {
		let ip = this.refs.serverIP.input.value;
		ipc.send('setServeIp',ip);
		this.props.dispatch(Action.setDeviceUsedRecently(ip));
	}

	selectDevice(e,index) {
		let ip = this.props.login.device[index].addresses[0];
		c.log(ip);
		ipc.send('setServeIp',ip);
		this.props.dispatch(Action.setDeviceUsedRecently(ip));

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
