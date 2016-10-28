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
import Dehaze from 'material-ui/svg-icons/image/dehaze'
import Left from 'material-ui/svg-icons/navigation/chevron-left'
import Right from 'material-ui/svg-icons/navigation/chevron-right'

//import CSS
import css  from  '../../../assets/css/login'
//import component
import UserList from './userList'

class Index extends React.Component {

	constructor(props) {
		super(props)
		this.state = {volume:false,step:1,type:1}
	}

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
			this.props.dispatch(Action.setSnack(message,true))
		})
	}

	componentWillUnmount() {
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

	submit() {
		let username = this.refs.username.input.value
		let password = this.refs.password.input.value
		// ipc.send('login','Alice','123456')
		// ipc.send('login','Bob','123456')
		ipc.send('login',username,password)
	}

	kenDown(e) {
		if (e.nativeEvent.which == 13) {
			this.submit()
		}
	}

	openAppifiInstall() {
		ipc.send('openAppifi')
	}

	openVolume() {
		this.setState({
			volume:true
		})
	}

	render() {
		let findDevice = this.props.state.view.findDevice
		return(
			<div className='login-frame' key='login'>
				{this.state.volume && this.getVolumeContent()}
				{!this.state.volume && this.getLoginContent()}
				<Snackbar open={this.props.state.snack.open} message={this.props.state.snack.text} autoHideDuration={3000} onRequestClose={this.cleanSnack.bind(this)}/>
			</div>
			)
			
	}

	getLoginContent() {
		let selectedIndex = this.props.state.login.selectIndex
		let selectedItem = this.props.state.login.device[selectedIndex]
		let content 
		//content
		if (this.props.state.login.device.length == 0) {
				content = <div>没有发现相关设备</div>
		}else {
				content = (
					<div>
						<div id='login-wellcome'>欢迎使用WISNUC</div>
						<div id='login-device-select'>
							<Left onClick={this.selectDevice.bind(this,selectedIndex-1,true)} className={selectedIndex==0?'login-invisible':''}></Left>
							<div className='login-device-icon'></div>
							<Right onClick={this.selectDevice.bind(this,selectedIndex+1,true)} className={selectedIndex==(this.props.state.login.device.length-1)?'login-invisible':''}></Right>
						</div>
						<div className='login-device-name'>{selectedItem.name.split('wisnuc-')[1]||selectedItem.name.split('wisnuc-')[0]}</div>
						<div>{selectedItem.address}</div>
					</div>
					)
		}
		return (
			<div className='login-wrap'>
				<div className='login-title'>
					<span>
						<span className='login-title-icon'></span>
						<span className='login-title-name'>登录</span>
					</span>
					<span>
						<Dehaze></Dehaze>
					</span>
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
			return <div>请添加设备</div>
		}else if (selectedItem.isCustom) {
			return (
					<div className='login-custom-container'>
						<TextField hintStyle={{color:'#999'}} ref='username' hintText="用户名" type="username" />
						<TextField hintStyle={{color:'#999'}} ref='password' hintText="密码" type="password" onKeyDown={this.kenDown.bind(this)}/>
						<FlatButton label='登录' onClick={this.submit.bind(this)}/>
					</div>
				)
		}else if (selectedItem.appifi && selectedItem.appifi.code == "ECONNREFUSED") {
			return <div className='login-appifi-button' onClick={this.openAppifiInstall.bind(this)}>请安装appifi</div>
		}else if (!selectedItem.fruitmix) {
			return <div onClick={this.openVolume.bind(this)}>please configure your volume</div>
		}else if (selectedItem.fruitmix && selectedItem.fruitmix == "ERROR") {
			return <div>fruitmix is error</div>
		}else if (selectedItem.fruitmix && selectedItem.users.length == 0) {
			return <div>the device has no users</div>
		}else if (selectedItem.fruitmix && selectedItem.users.length != 0) {
			return <UserList device={selectedItem}></UserList>
		}else {
			return <div>the device is not map any station</div>
		}
	}

	getVolumeContent() {
		let selectedIndex = this.props.state.login.selectIndex
		let selectedItem = this.props.state.login.device[selectedIndex]
		let content 
		if (!selectedItem) {
			return <div>not found</div>
		}
		return (
			<div className='login-volume-wrap'>
				<div className='login-title'>
					<span>
						<span className='login-title-icon'></span>
						<span className='login-title-name'>安装向导</span>
					</span>
					<span>
						<Dehaze></Dehaze>
					</span>
				</div>
				<div></div>
			</div>
			)
	}

}

Index.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired,
}

export default Index

