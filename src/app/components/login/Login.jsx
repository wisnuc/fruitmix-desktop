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
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

//import CSS
import css  from  '../../../assets/css/login';
//import Action
import Action from '../../actions/action';
//import component
import Device from './Device'
import {orange500, blue500} from 'material-ui/styles/colors';

// define Index component
class Index extends React.Component {

	getChildContext() {
		const muiTheme = getMuiTheme(baseTheme);
		return {muiTheme};
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.login.state == 'LOGGEDIN') {
			window.location.hash = '/main';
		}
	}

	componentDidMount() {
		ipc.send('getDeviceUsedRecently');
		ipc.send('beginFind');
		ipc.on('loggedin',(err,user)=>{
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

		ipc.on('device',(err,device)=>{;
			this.props.dispatch(Login.setDevice(device));
		});

		ipc.on('setDeviceUsedRecently',(err,ip)=>{
			this.props.dispatch(Action.setDeviceUsedRecently(ip));
		});

		ipc.on('setDownloadPath',(err,path)=>{
			this.props.dispatch({type:'SET_DOWNLOAD_PATH',path:path});
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
		ipc.send('login',username,password);
		// ipc.send('login','admin','123456');
		// ipc.send('login','a','a');
	}

	render() {
		var _this = this;
		let findDevice = this.props.login.findDevice;
		let loginContent;
		let busy = (this.props.login.state ==='BUSY');
		let device = this.props.login.device; 
		const styles = {
  errorStyle: {
    color: orange500,
  },
  underlineStyle: {
    borderColor: orange500,
  },
  floatingLabelStyle: {
    color: orange500,
  },
  floatingLabelFocusStyle: {
    color: blue500,
  },
};
		//login
		if (!busy) {
			loginContent = (
				<div className='login-container'>
					<div className='login-device-title'>已发现 {device.length} 台 wisnuc</div>
					<div className='login-device-list'>
						
							<SelectField iconStyle={{fill:'#666'}} underlineStyle={{borderColor:'rgba(255,255,255,0)'}}  value={this.getValue()} onChange={this.selectDevice.bind(this)}>
								{device.map(item=>(
									<MenuItem key={item.addresses[0]} value={item.addresses[0]} primaryText={item.admin&&item.fruitmix?item.host:item.host+"(未配置)"}></MenuItem>
									))}
							</SelectField>
			
						<TextField underlineStyle={{borderColor:'#999'}} underlineFocusStyle={styles.underlineStyle} hintStyle={{color:'#999'}} ref='username' style={{marginBottom: 10}} hintText="用户名" type="username" />
						<TextField underlineStyle={{borderColor:'#999'}} underlineFocusStyle={styles.underlineStyle} hintStyle={{color:'#999'}} ref='password' style={{marginBottom: 10}} hintText="密码" type="password" onKeyDown={this.kenDown.bind(this)}/>
						<div className='login-button'>
							<div onTouchTap={this.toggleDevice.bind(this)}>设置</div>
							<div onTouchTap={this.submit.bind(this)}>登录</div>
							
						</div>
					</div>
				</div>
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
				<TextField underlineStyle={{borderColor:'#999'}} underlineFocusStyle={styles.underlineStyle} hintStyle={{color:'#999'}} ref='serverIP' hintText='serverIP' fullWidth={true}/>
				<div className='login-button'>

							<div onTouchTap={this.toggleAddDevice.bind(this)}>取消</div>
							<div onTouchTap={this.submitServer.bind(this)}>提交</div>
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
				<div className='find-device-container' style={{maxHeight:document.body.clientHeight}}>
					<div className='add-device-title'>已发现 {device.length} 台 wisnuc</div>
					<div className='add-device-content'>
						{this.props.login.addDevice?addDevice:deviceList}
					</div>
					<div className='add-device-button' style={this.props.login.addDevice?{display:'none'}:{}}>
						
						<span  onClick={this.toggleDevice.bind(this)}>返回</span>
						<span onClick={this.toggleAddDevice.bind(this)}>添加设备</span>
					</div>
				</div>
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
		this.props.dispatch(Action.toggleAddDevice());
	}

	selectDevice(e,index) {
		let ip = this.props.login.device[index].addresses[0];
		ipc.send('setServeIp',ip,false);
		this.props.dispatch(Action.setDeviceUsedRecently(ip));
	}

	getValue() {
		if (this.props.login.deviceUsedRecently != '') {
			return this.props.login.deviceUsedRecently;
		}else {
			// if (this.props.login.device.length == 0) {
			// 	return
			// }else {
			// 	c.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
			// 	c.log(this.props.login.device);
			// 	let ip = this.props.login.device[0].addresses[0];
			// 	ipc.send('setServeIp',ip,false);
			// 	return ip
			// }
		}
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
