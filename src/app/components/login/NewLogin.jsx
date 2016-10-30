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
import { Paper, TextField, FlatButton, CircularProgress, Snackbar, SelectField, MenuItem, RadioButton, RadioButtonGroup } from 'material-ui'
import Dehaze from 'material-ui/svg-icons/image/dehaze'
import Left from 'material-ui/svg-icons/navigation/chevron-left'
import Right from 'material-ui/svg-icons/navigation/chevron-right'

//import CSS
import css  from  '../../../assets/css/login'
//import component
import UserList from './userList'

const styles = {
	icon : {
		marginRight:'10px',
		color:'#999',
		fill:'#3f51b5'
	},
	label : {
		width: 'calc(100%)',
		fontSize:'14px',
		color:'#999',
		marginRight:'30px'
	}

}
class Index extends React.Component {

	constructor(props) {
		super(props)
		this.state = {guide:false,maintenance:false,step:1,type:'1',volumes:{},disks:[],username:'',password:'',loading:false}
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

	openGuide() {
		this.setState({
			guide:true
		})
	}

	openMaintenance() {
		this.setState({
			maintenance:true
		})	
	}

	checkType(event,index) {
		this.setState({
			type:index
		})
	}

	guidePrev() {
		if (this.state.step == 1) {
			this.setState({
				guide : false,
				maintenance : false,
				volumes:{},
				disks:[]
			})
		}else {
			this.setState({
				step : (this.state.step - 1)
			})
		}
	}

	guideNext() {
		let selectedIndex = this.props.state.login.selectIndex
		let selectedItem = this.props.state.login.device[selectedIndex]
		if (this.state.step == 1) {
			if (this.isEmptyObject(this.state.volumes) && this.state.disks.length == 0 ) {
				ipc.emit('message',null,'请选择磁盘新建磁盘卷')
			}else {
				this.setState({step:2})
			}
		}
		
		if (this.state.step == 2) {
			let username = this.refs.username.input.value
			let password = this.refs.password.input.value
			let cpassword = this.refs.confirmPassword.input.value
			if(username.length == 0){
				ipc.emit('message',null,'用户名不能为空')
			}else if (password.length == 0 || cpassword.length == 0) {
				ipc.emit('message',null,'密码不能为空')
			}else if (password != cpassword) {
				ipc.emit('message',null,'请确认密码一致')
			}else {
				this.setState({
					step:3,
					username:username,
					password:password
				})
			}
		}

		if (this.state.step == 3) {
				let t = this.state.type == 1 ?'single':this.state.type == 2?'raid0':'raid1'
				let target = this.state.disks.map(item=>item.name)
				let init = {
					username: this.state.username,
					password: this.state.password
				}
				let mkfs = {
					type:'btrfs',
					mode:t
				}
				let time = (new Date()).getTime()
				ipc.once('mirFinish-'+time,(err,data) => {
					if (data == 'success') {
						this.setState({
							step : 4
						})
					}else {
						this.setState({
							step : 1
						})
					}
						
				})
				ipc.send('installVolume',selectedItem.address,target,init,mkfs,time)
				
		
		}
	}

	closeGuide() {
		this.setState({
			maintenance:false,
			guide:false,
			step : 1,
			username:'',
			password:'',
			disks:[],
			volumes:{},
			type:1
		})
	}

	selectDisk(disk) {
		c.log(disk.name)
		this.setState({
			disks:this.state.disks.concat([disk])
		})
		console.log(this.state)
	}

	selectVolume(volume) {
		c.log(volume)
		this.setState({
			disks:[],
			volumes:volume
		})
	}

	isEmptyObject(e) {  
    	var t
    	for (t in e)  
        	return false;  
    	return true
	}

	render() {
		let findDevice = this.props.state.view.findDevice
		return(
			<div className='login-frame' key='login'>
				{this.state.guide && this.getGuide()}
				{this.state.maintenance && this.getGuide()}
				{!this.state.guide && !this.state.maintenance && this.getLogin()}
				<Snackbar open={this.props.state.snack.open} message={this.props.state.snack.text} autoHideDuration={3000} onRequestClose={this.cleanSnack.bind(this)}/>
			</div>
			)
	}

	getLogin() {
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
		//登录中...
		if (busy) {
			return <div>loading...</div>
		}
		//没有发现设备
		if (!selectedItem) {
			return <div>请添加设备</div>
		}
		//自定义地址
		else if (selectedItem.isCustom) {
			return (
					<div className='login-custom-container'>
						<TextField hintStyle={{color:'#999'}} ref='username' hintText="用户名" type="username" />
						<TextField hintStyle={{color:'#999'}} ref='password' hintText="密码" type="password" onKeyDown={this.kenDown.bind(this)}/>
						<FlatButton label='登录' onClick={this.submit.bind(this)}/>
					</div>
				)
		}
		//appifi 没有安装
		else if (selectedItem.appifi == 'ERROR') {
			return <div className='login-appifi-button' onClick={this.openAppifiInstall.bind(this)}>请安装appifi</div>
		}
		//appifi 正常运行 但卷没有拉起来
		else if (selectedItem.fruitmix == 'ERROR' && selectedItem.boot && selectedItem.mir) {
			let hasWisnuc = false
			if (selectedItem.mir.volumes.length == 0) {
				hasWisnuc = false
			}else {
				selectedItem.mir.volumes.forEach(item => {
					if (item.wisnucInstalled) {
						hasWisnuc = true
					}
				})
			}
			if (hasWisnuc) {
				return <div className='login-appifi-button' onClick={this.openMaintenance.bind(this)}>管理</div>
			}else {
				return <div className='login-appifi-button' onClick={this.openGuide.bind(this)}>向导</div>
			}

			
		}
		//正常启动
		else if (selectedItem.fruitmix && selectedItem.users.length != 0) {
			return <UserList device={selectedItem}></UserList>
		}
		//appifi 正常运行 但没有用户
		else if (selectedItem.fruitmix && selectedItem.users.length == 0) {
			return <div onClick={this.openGuide.bind(this)}>the device has no users</div>
		}
		else if (!selectedItem.fruitmix) {
			return <div onClick={this.openVolume.bind(this)}>please configure your volume</div>
		}
		else if (selectedItem.fruitmix && selectedItem.fruitmix == "ERROR") {
			return <div>fruitmix is error</div>
		}
		else {
			return <div>the device is not map any station</div>
		}
	}

	getGuide() {
		let selectedIndex = this.props.state.login.selectIndex
		let selectedItem = this.props.state.login.device[selectedIndex]
		if (!selectedItem || !selectedItem.mir) {
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
				<div className='login-volume-content'>
					{this.getGuideContent()}
				</div>
				<div className='login-volume-footer'>
					{this.getGuideFooter()}
				</div>
			</div>
			)
	}

	getGuideContent() {
		let selectedIndex = this.props.state.login.selectIndex
		let selectedItem = this.props.state.login.device[selectedIndex]
		let content
		switch(this.state.step) {
			case 1:
				content = (
					<div className='login-volume-case1'>
						<div>选择磁盘存储模式</div>
						<div>
							<RadioButtonGroup valueSelected={this.state.type} name='typeSelect' onChange={this.checkType.bind(this)}>
								<RadioButton value='1' iconStyle={styles.icon} labelStyle={styles.label} label='普通模式(single)'/>
								<RadioButton value='2' iconStyle={styles.icon} labelStyle={styles.label} label='速度模式(RAID 0)'/>
								<RadioButton value='3' iconStyle={styles.icon} labelStyle={styles.label} label='安全模式(RAID 1)'/>
							</RadioButtonGroup>
						</div>
						{/*<div>卷信息:</div>
						<div>
							{selectedItem.mir.volumes.map(item => {
								return (
									<div className='login-volume-row' key={item.uuid}><span>{item.mountpoint}</span>
										<span onClick={this.selectVolume.bind(this,item)}>start</span>
									</div>
									)
							})}
						</div>*/}
						<div>选择磁盘:</div>
						<div>
							{selectedItem.mir.blocks.map(item => {
								let add = true
								let obj = this.state.disks.find(item2 => {
									return item.devname == item2.devname
								})
								if (obj) {
									add = false
								}
								return (
									<div className='login-disk-row' key={item.devname}>
										<span>{item.devname}</span>
										<span onClick={this.selectDisk.bind(this,item)}>添加{add?添加:已添加}</span>
									</div>
									)
							})}
						</div>
					</div>
					)
				break
			case 2:
				content = (
					<div className='login-volume-case2'>
						<header>建立您的管理员账户</header>
						<TextField ref='username'  hintText="Name"  floatingLabelText="用户名"/><br/>
						<TextField ref='password'  hintText="Password" type='password' floatingLabelText="密码"/><br/>
						<TextField ref='confirmPassword'  hintText="Confirm password" type='password' floatingLabelText="确认密码"/><br/>
					</div>
					)
				break
			case 3:
				c.log(this.state.disks)
					content = (
						<div className='login-volume-case3'>
							<header>您的磁盘配置信息</header>
							<div>
								<div>存储模式 : {this.state.type==1?'普通模式':this.state.type==2?'速度模式':'安全模式'}</div>
								<div>磁盘格式 : BtfFS</div>
								<div>磁盘信息 : </div>
								<div>
									{this.state.disks.map((item,index) => {
										return (
											<div key={item.devname}>磁盘{index+1} : {item.devname}</div>
											)
									})}
								</div>
							</div>
						</div>
					)	
				break
			case 4:
				content = (
					<div className='login-volume-case4'>
						<div>您已完成设备配置</div>
						<div onClick={this.closeGuide.bind(this)}>返回登录</div>
					</div>
				)
				break
			default:
				content = <div>default</div>
		}
		return content
	}

	getGuideFooter() {
		let selectedIndex = this.props.state.login.selectIndex
		let selectedItem = this.props.state.login.device[selectedIndex]
		if (this.state.step == 4) {
			return (
				null
				)
		}
		return (
				<div className='login-volume-footer-container'>
					<div onClick={this.guidePrev.bind(this)} className='login-volume-prev'>{this.state.step==1?'返回':'上一步'}</div>
					<div className='login-volume-point'>
						<span></span>
						<span></span>
						<span></span>
						<span></span>
					</div>
					<div onClick={this.guideNext.bind(this)} className='login-volume-next'>下一步</div>
				</div>
			)
	}

}

Index.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired,
}

export default Index

