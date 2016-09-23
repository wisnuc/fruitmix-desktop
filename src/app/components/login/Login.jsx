/**
 * @component Index
 * @description 首页组件
 * @time 2016-4-5
 * @author liuhua
 **/
 'use strict'
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react'
import Base from '../../utils/Base'
// require action
import Login from'../../actions/action'
//require material
import { Paper, TextField, FlatButton, CircularProgress, Snackbar, SelectField, MenuItem } from 'material-ui'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme'
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'

//import CSS
import css  from  '../../../assets/css/login'
//import Action
import Action from '../../actions/action'
//import component
import Device from './Device'
import {orange500, blue500} from 'material-ui/styles/colors'

// define Index component
class Index extends React.Component {

	getChildContext() {
		const muiTheme = getMuiTheme(baseTheme)
		return {muiTheme}
	}

	componentDidMount() {

		setTimeout(()=>{
			ipc.send('getDeviceUsedRecently')
		},1000)

		ipc.send('findFruitmix')
		this.find = setInterval(function(){
			ipc.send('findFruitmix')
		},500)

		setTimeout(()=>{
			if (this.props.state.login.deviceUsedRecently == '') {
				if (this.props.state.login.device.length == 0) {
					return
				}else {
					this.selectDevice.apply(this,[null,0])
				}
			}
		},3000)
		ipc.on('message',(err,message,code)=>{
			this.props.dispatch(Login.setSnack(message,true))
			// if (code == 0 ) {
			// 	this.props.dispatch(Login.loginFailed())		
			// }
		})

	}

	componentWillUnmount() {
		clearInterval(this.find)
	}

	submit() {
		let username = this.refs.username.input.value
		let password = this.refs.password.input.value
		ipc.send('login',username,password)
		// ipc.send('login','Alice','123456')
	}

	render() {
		var _this = this
		let findDevice = this.props.state.view.findDevice
		let loginContent
		let busy = (this.props.state.login.state ==='BUSY')
		let device = this.props.state.login.device 
		const styles = {
		  underlineStyle: {
		    borderColor: orange500,
		  },
		}
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
			)
		let deviceList = (
				<div className='add-device-list-container'>
						{device.map(item=>(
							<Device key={item.addresses[0]+item.host} item={item}></Device>
						))}
						</div>
			)

		let findDeviceContent = (
				<div className='find-device-container' style={{maxHeight:document.body.clientHeight}}>
					<div className='add-device-title'>已发现 {device.length} 台 wisnuc</div>
					<div className='add-device-content'>
						{this.props.state.view.addDevice?addDevice:deviceList}
					</div>
					<div className='add-device-button' style={this.props.state.login.addDevice?{display:'none'}:{}}>
						<span  onClick={this.toggleDevice.bind(this)}>返回</span>
						<span onClick={this.toggleAddDevice.bind(this)}>添加设备</span>
					</div>
				</div>
			)

		return (
			<div className='index-frame' key='login'>
				{!!findDevice && findDeviceContent}
				{!findDevice && loginContent}
				<Snackbar open={this.props.state.snack.open} message={this.props.state.snack.text} autoHideDuration={3000} onRequestClose={this.cleanSnack.bind(this)}/>
			</div>
			)
	}

	kenDown(e) {
		if (e.nativeEvent.which == 13) {
			this.submit()
		}
	}

	//close snackbar
	cleanSnack() {
		this.props.dispatch(Action.cleanSnack())
	}

	toggleDevice() {
		this.props.dispatch(Action.toggleDevice())
	}

	toggleAddDevice() {
		this.props.dispatch(Action.toggleAddDevice())
	}

	submitServer() {
		let ip = this.refs.serverIP.input.value
		ipc.send('setServeIp',ip,true)
		this.props.dispatch(Action.toggleAddDevice())
	}

	selectDevice(e,index) {
		let ip = this.props.state.login.device[index].addresses[0]
		ipc.send('setServeIp',ip,false)
	}

	getValue() {
			return this.props.state.login.deviceUsedRecently
	}
}

Index.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired,
}
	
export default Index
