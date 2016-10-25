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
import UserList from './userList'

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
					this.selectDevice.apply(this,[0,false, null])
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

	selectDevice(index, isStorage, e) {
		if (index<0 || index==this.props.state.login.device.length) {
			console.log('index is over range')
			return
		}
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
		let content 
		//content
		if (this.props.state.login.device.length == 0) {
				content = <div>not found</div>
		}else {
				content = (
					<div>
						<div onClick={this.selectDevice.bind(this,selectedIndex-1,true)} className={selectedIndex==0?'login-invisible':''}>prev</div>
						<div>{selectedItem.address}</div>
						<div onClick={this.selectDevice.bind(this,selectedIndex+1,true)} className={selectedIndex==(this.props.state.login.device.length-1)?'login-invisible':''}>next</div>
					</div>
					)
		}
		return (
			<div className='login-wrap'>
				<div className='login-title'>
					<span>WISNUC</span>
					<span>欢迎使用WISNUC</span>
					<span>setting</span>
				</div>
				<div className='login-content'>
					{content}
				</div>
				<div className='login-footer'>
					{this.getLoginFooter()}
				</div>
			</div>
			)
	}

	getLoginFooter() {
		let selectedIndex = this.props.state.login.selectIndex
		let selectedItem = this.props.state.login.device[selectedIndex]
		let busy = (this.props.state.login.state ==='BUSY')
		if (busy) {
			return <div>loading...</div>
		}
		if (!selectedItem) {
			return <div>please add new device</div>
		}else if (selectedItem.isCustom) {
			return <div>the device is added by users</div>
		}else if (selectedItem.appifi && selectedItem.appifi.code == "ECONNREFUSED") {
			return <div>please install appifi</div>
		}else if (!selectedItem.fruitmix) {
			return <div>please configure your volume</div>
		}else if (selectedItem.fruitmix && selectedItem.fruitmix == "ERROR") {
			return <div>fruitmix is error</div>
		}else if (selectedItem.fruitmix && selectedItem.users.length == 0) {
			return <div>the device has no users</div>
		}else if (selectedItem.fruitmix && selectedItem.users.length != 0) {
			return <div>
				<userList device={selectedItem}/>
			</div>
		}else {
			return <div>the device is not map any station</div>
		}
	}

}

Index.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired,
}

export default Index

