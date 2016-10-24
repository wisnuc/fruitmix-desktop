/**
 * @component Index
 * @description 首页组件
 * @time 2016-10-23
 * @author liuhua
**/

// require core module
import React, { findDOMNode, Component, PropTypes } from 'react'
//import Action
import Action from '../../actions/action'
//require material
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import { Paper, TextField, FlatButton, CircularProgress, Snackbar, SelectField, MenuItem } from 'material-ui'
//import CSS
import css  from  '../../../assets/css/login'
//import component
import Device from './Device'

class Index extends React.Component {

	getChildContext() {
		const muiTheme = getMuiTheme(baseTheme)
		return {muiTheme}
	}

	componentDidMount() {
		setTimeout(()=>{
			ipc.send('getDeviceUsedRecently')
		},1000)

		setTimeout(()=>{
				if (this.props.state.login.selectIndex == 0 && this.props.state.login.device.length != 0) {
					this.selectDevice.apply(this,[null,0,false])
				}
		},1500)

		ipc.on('message',(err,message,code)=>{
			this.props.dispatch(Login.setSnack(message,true))
		})
	}

	componentWillUnmount() {
	}

	//submit login
	submit() {
		let username = this.refs.username.input.value
		let password = this.refs.password.input.value
		ipc.send('login','Alice','123456')
		// ipc.send('login',username,password)
	}

	//close snackbar
	cleanSnack() {
		this.props.dispatch(Action.cleanSnack())
	}

	selectDevice(e,index, isStorage) {
		let s = isStorage==false?false:true
		let ip = this.props.state.login.device[index].address
		ipc.send('setServeIp',ip,false, isStorage)
	}

	render() {
		let findDevice = this.props.state.view.findDevice
		return(
			<div className='login-frame' key='login'>
				{this.getLoginContent()}
				<Snackbar open={this.props.state.snack.open} message={this.props.state.snack.text} autoHideDuration={3000} onRequestClose={this.cleanSnack.bind(this)}/>
			</div>
			)
			
	}
	//get jsx content 
	getLoginContent() {
		let selectedIndex = this.props.state.login.selectIndex
		let selectedItem = this.props.state.login.device[selectedIndex]
		return (
			<div className='login-wrap'>
				<div className='login-title'>
					<span>WISNUC</span>
					<span>欢迎使用WISNUC</span>
					<span>123</span>
				</div>
				<div className='login-content'>

				</div>
				<div className=''>123</div>
			</div>
			)
	}

}

Index.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired,
}

export default Index

