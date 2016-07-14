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
		c.log('sos');
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

	componentWillUnmount() {
		ipc.removeAllListeners();
	}

	submit() {
		let username = this.refs.username.input.value;
		let password = this.refs.password.input.value;
		this.props.dispatch({
		      type: "LOGIN"
		})
		// ipc.send('login',username,password);
		ipc.send('login','admin','123456');
		// ipc.send('login','a','a');
	}

	render() {
		var _this = this;
		let findDevice = this.props.login.findDevice;
		let loginContent;
		let busy = (this.props.login.state ==='BUSY');
		let device = this.props.login.device; 
		//login
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
					<TextField ref='username'  stype={{marginBottom: 10}} hintText="用户名" type="username" fullWidth={false} />
					<TextField onKeyDown={this.kenDown.bind(this)} ref='password' stype={{marginBottom: 10}} hintText="密码" type="password" fullWidth={false} />
					<FlatButton style={{marginTop: 10}} label='登录' onTouchTap={this.submit.bind(this)} />
				</Paper>
				)
		}else {
			loginContent= (
				<Paper style={{alignItems:'center'}} className='login-container' zDepth={4}>
					<CircularProgress />
				</Paper>
				)
		}

		//add device
		let addDevice = (
			<div className='setting-serverIP-container'>
				<TextField  ref='serverIP' hintText='serverIP' fullWidth={true}/>
				<div>
					<FlatButton style={{marginTop: 10,width:'100px'}} label='取消' onTouchTap={this.toggleAddDevice.bind(this)} />
					<FlatButton style={{marginTop: 10,width:'100px'}} label='提交' onTouchTap={this.submitServer.bind(this)} />
				</div>
			</div>
			);
		let deviceList = (
				<div className='add-device-list-container'>
						{device.map(item=>(
							<Device key={item.addresses[0]+item.host} item={item}></Device>
						))}
						</div>
			);

		let findDeviceContent = (
				<Paper className='find-device-container' style={{maxHeight:document.body.clientHeight}}>
					<div className='add-device-title'>已发现 {device.length} 台 wisnuc</div>
					<div className='add-device-content'>
						{this.props.login.addDevice?addDevice:deviceList}
					</div>
					<div className='add-device-button' style={this.props.login.addDevice?{display:'none'}:{}}>
						<span onClick={this.toggleAddDevice.bind(this)}>添加设备</span>
						<span  onClick={this.toggleDevice.bind(this)}>返回</span>
					</div>
				</Paper>
			);

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

	toggleAddDevice() {
		this.props.dispatch(Action.toggleAddDevice());
	}

	submitServer() {
		let ip = this.refs.serverIP.input.value;
		ipc.send('setServeIp',ip,true);
		this.props.dispatch(Action.setDeviceUsedRecently(ip));
	}

	selectDevice(e,index) {
		let ip = this.props.login.device[index].addresses[0];
		ipc.send('setServeIp',ip,false);
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
