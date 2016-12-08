/**
 * @component Index
 * @description 首页组件
 * @time 2016-10-23
 * @author liuhua
**/

// require core module
import { ipcRenderer } from 'electron'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

import Action from '../../actions/action'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import { Checkbox, Divider, RaisedButton, Avatar, IconButton, LinearProgress, Paper, TextField, FlatButton, CircularProgress, Snackbar, SelectField, MenuItem } from 'material-ui'
import { Step, Stepper, StepLabel, StepContent } from 'material-ui/Stepper'

import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'  
import TransitionGroup from 'react-addons-transition-group'

import NavigationChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import NavigationChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import SocialPerson from 'material-ui/svg-icons/social/person'

import { command } from '../../lib/command' 
import { TweenMax } from 'gsap'

import UUID from 'node-uuid'

import {indigo900, cyan900, teal900, lightGreen900, lime900, yellow900} from 'material-ui/styles/colors'

import request from 'superagent'
import prettysize from 'prettysize'

//import CSS
import css  from  '../../../assets/css/login'
//import component
import UserList from './userList'

import Debug from 'debug'
const debug = Debug('main')

console.log(debug)

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

const Barcelona = ({style, fill, size}) => (
  <div style={Object.assign(style, {width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 300ms'})}>
    <svg style={{fill, width: Math.floor(size * 128 / 192), height: Math.floor(size * 176 / 192), transition: 'all 300ms'}}
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 352">
      <path d="m 218.80203,48.039815 c -14.29555,11.911857 -25.3383,24.549958 -45.64007,35.359768 -7.02132,4.468951 -23.85238,6.000285 -34.76376,2.406502 C 111.22305,78.031495 92.140083,67.296886 70.422926,57.663153 48.215526,46.811935 22.865307,36.618679 5.6439616,24.553833 -1.5344798,20.331611 -0.35135786,13.918033 13.868086,11.892977 43.143517,7.1450877 75.870493,6.5837609 107.132,4.6866422 147.52562,3.0153376 187.86409,-0.22170151 228.69047,0.37596259 242.35579,0.23107113 257.06988,3.8096879 254.79285,9.2910307 251.48569,20.8655 236.4618,31.431442 225.3584,42.204703 c -2.18031,1.945806 -4.36853,3.890424 -6.55637,5.835112 z" />
      <path d="M 0.71584761,36.189436 C 5.7333591,46.742429 28.494578,54.650053 44.647666,63.186203 c 29.265921,13.132026 55.055587,27.478913 89.289864,39.017527 22.53176,8.66966 45.71976,-2.309934 53.39004,-9.921384 23.06458,-18.643025 45.06127,-37.527084 63.37844,-56.857692 4.39395,-3.966197 5.48956,-13.906509 4.83954,-4.430211 -0.4744,81.122537 0.0256,162.248467 -0.49302,243.368927 -7.81768,16.05486 -29.68046,30.63968 -45.31272,45.8063 -12.79139,10.22313 -21.6348,21.65006 -43.34582,29.94174 -24.20287,5.91627 -44.5008,-6.09059 -59.21752,-11.5605 C 74.058118,323.37123 39.752306,308.43334 10.445173,292.23628 -5.6879281,283.85313 2.7946672,273.33309 0.66866322,263.84413 0.57030725,187.95925 0.87058396,112.0742 0.71584761,36.189436 Z" />
    </svg>
  </div>
)

const Computer = ({style, fill, size}) => (
  <div style={Object.assign(style, {width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 300ms'})}>
    <svg style={{fill, width: Math.floor(size * 128 / 192), height: Math.floor(size * 176 / 192), transition: 'all 300ms'}}
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 89.471 89.471">
      <path d="M67.998,0H21.473c-1.968,0-3.579,1.61-3.579,3.579v82.314c0,1.968,1.61,3.579,3.579,3.579h46.525 c1.968,0,3.579-1.61,3.579-3.579V3.579C71.577,1.61,69.967,0,67.998,0z M44.736,65.811c-2.963,0-5.368-2.409-5.368-5.368 c0-2.963,2.405-5.368,5.368-5.368c2.963,0,5.368,2.405,5.368,5.368C50.104,63.403,47.699,65.811,44.736,65.811z M64.419,39.704 H25.052v-1.789h39.367V39.704z M64.419,28.967H25.052v-1.789h39.367V28.967z M64.419,17.336H25.052V6.599h39.367V17.336z"/>
    </svg>
  </div>
)



const NamedAvatar = ({ style, name, onTouchTap }) => (
  <div style={style}>
    <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start'}}>
      <Avatar onTouchTap={onTouchTap}>{name.slice(0, 2).toUpperCase()}</Avatar>
      { false && <div style={{marginTop: 12, fontSize: 12, fontWeight: 'medium', opacity: 0.7}}>{name}</div> }
    </div> 
  </div>
)

class HoverNav extends React.Component {

  constructor(props) {
    super(props)
    this.state = { hover: false }

    this.onMouseEnter = () => 
      this.setState(state => Object.assign({}, this.state, { hover: true }))

    this.onMouseLeave = () =>
      this.setState(state => Object.assign({}, this.state, { hover: false }))

    this.style = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.54
    }
  }

  render() {

    const enabled = !!this.props.onTouchTap
    return (
      <div style={this.props.style}>
        <div 
          style={ (enabled && this.state.hover) ? Object.assign({}, this.style, { backgroundColor: '#000', opacity: 0.1 }) : this.style }
          onMouseEnter={enabled && this.onMouseEnter}
          onMouseLeave={enabled && this.onMouseLeave}
          onTouchTap={enabled && this.props.onTouchTap}
        >
          { enabled && this.props.children }
        </div>
      </div>
    )
  }
}

class BottomFrame extends React.Component {

  constructor(props) {
    super(props)
  }

/**
  componentWillEnter(callback) {
    debug('bottom frame will enter', this.props.KEY)    
    const el = ReactDOM.findDOMNode(this)
    TweenMax.fromTo(el, 0.33, {opacity: 0}, {opacity: 1, onComplete: () => {
      debug('bottom framewill enter callback')
      callback()
    }})
  }
**/

/**
  componentWillLeave(callback) {
    debug('bottom frame will leave', this.props.KEY)
    const el = ReactDOM.findDOMNode(this);
    TweenMax.fromTo(el, 0.1, {opacity: 1}, {opacity: 0, onComplete: callback})
  }
**/

  render() {
    return (
      <div>
        { this.props.children }
      </div>
    )
  }
}

const storeState = () => window.store.getState()

class Index extends React.Component {

	constructor(props) {

		super(props)
		this.state = {

      stations: [],

      guide:false,
      maintenance:false,
      step:1,type:'1',
      volumes:{},
      disks:[],
      username:'',
      password:'',
      loading:false,

      toggle: false,
      expanded: false,
      selectedDeviceIndex: 0,
      selectedUserIndex: -1
    }

    this.selectPrevDevice = () => {

      debug('selectPrevDevice, current', this.state.selectedDeviceIndex)

      let len = window.store.getState().login.device.length
      if (len === 0 || this.state.selectedDeviceIndex === 0) return
      this.setState(state => Object.assign({}, state, { 
        toggle: false,
        selectedDeviceIndex: state.selectedDeviceIndex - 1,
        selectedUserIndex: -1 
      }))    
    }

    this.selectNextDevice = () => {
    
      debug('selectNextDevice, current', this.state.selectedDeviceIndex) 

      let len = window.store.getState().login.device.length
      if (len === 0 || this.state.selectedDeviceIndex === len - 1) return
      this.setState(state => Object.assign({}, state, { 
        toggle: false,
        selectedDeviceIndex: state.selectedDeviceIndex + 1,
        selectedUserIndex: -1
      }))
    }
	}

	getChildContext() {
		const muiTheme = getMuiTheme(baseTheme)
		return {muiTheme}
	}

	componentDidMount() {

		setTimeout(()=> {
			ipcRenderer.send('getDeviceUsedRecently')
		}, 1000)

		setTimeout(()=> {
      if (this.state.selectedDeviceIndex == 0 && storeState().login.device.length != 0) {
        debug('Login didMount, device', window.store.getState().login.device)
        this.selectDevice.apply(this,[0,false, null])
      }
		}, 1500)

		ipcRenderer.on('message',(err,message,code)=>{
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

		if (index<0 || index==storeState().login.device.length) {
			console.log('index is over range')
			return
		}
		let s = isStorage==false?false:true
		let ip = storeState().login.device[index].address
		ipcRenderer.send('setServerIp', ip)
	}

	/*
	submit() {

		let username = this.refs.username.input.value
		let password = this.refs.password.input.value
		*/

/**
    sendCommand('user-login', {
      cmd: 'USER_LOGIN',
      args: {
        username, password
      } 
    }, err => {
      console.log(err) 
    })
**/
	/*
    	command('user-login', 'USER_LOGIN', { username, password }, err => console.log(err))
		ipcRenderer.send('login',username,password)
	}
	*/


	// kenDown(e) {
	// 	if (e.nativeEvent.which == 13) {
	// 		this.submit()
	// 	}
	// }

	openAppifiInstall() {
		ipcRenderer.send('openAppifi')
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
		let selectedDeviceIndex = this.state.selectIndex
		let selectedItem = storeState().login.device[selectedDeviceIndex]
		if (this.state.step == 1) {
			if (this.isEmptyObject(this.state.volumes) && this.state.disks.length == 0 ) {
				ipcRenderer.emit('message',null,'请选择磁盘新建磁盘卷')
			}else {
				this.setState({step:2})
			}
		}
		
		if (this.state.step == 2) {
			let username = this.refs.username.input.value
			let password = this.refs.password.input.value
			let cpassword = this.refs.confirmPassword.input.value
			if(username.length == 0){
				ipcRenderer.emit('message',null,'用户名不能为空')
			}else if (password.length == 0 || cpassword.length == 0) {
				ipcRenderer.emit('message',null,'密码不能为空')
			}else if (password != cpassword) {
				ipcRenderer.emit('message',null,'请确认密码一致')
			}else {
				this.setState({
					step:3,
					username:username,
					password:password
				})
			}
		}

		if (this.state.step == 3) {
				let t = this.state.type == 1 ? 'single':this.state.type == 2?'raid0':'raid1'
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
				ipcRenderer.once('mirFinish-'+time,(err,data) => {
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
				ipcRenderer.send('installVolume',selectedItem.address,target,init,mkfs,time)
				
		
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
		let index = this.state.disks.findIndex(item => {
			return item.devname == disk.devname
		})
		c.log(index)
		if (index != -1) {
			this.state.disks.splice(index,1)
			this.setState({
				disks:this.state.disks
			})	
		} 
    else {
			this.setState({
				disks:this.state.disks.concat([disk])
			})	
		}
		
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

		let findDevice = storeState().view.findDevice
		let selectedDeviceIndex = this.state.selectedDeviceIndex
		let selectedItem = storeState().login.device[selectedDeviceIndex]
		let busy = (storeState().login.state ==='BUSY')

    let model = (name) => name.split('-')[1].toUpperCase()
    let serial = (name) => name.split('-')[2].toUpperCase()

		return(
      <div 
        style={{
          backgroundImage: 'url(../src/assets/images/index/index.jpg)',
          width:'100%', 
          height: '100%',
          display:'flex', 
          flexDirection:'column', 
          alignItems:'center', 
          justifyContent: 'flex-start'
        }}
      >
        <div style={{height: `calc(15% + 40px)`}} />

        <div style={{width: 512}}>
          <Paper id='top-half-container'
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              backgroundColor: (this.state.selectedDeviceIndex % 2) === 0 ? '#455A64' : '#3F51B5'
            }}
          >

            { storeState().login.device.length === 0 && <div>没有发现相关设备</div> }
            { storeState().login.device.length !== 0 && (
            <div style={{width: '100%', display: 'flex', alignItems: 'stretch'}}>
              <HoverNav style={{flex: '0 0 64px'}} onTouchTap={this.selectPrevDevice}>
                <NavigationChevronLeft style={{width:32, height:32}} color='#FFF'/></HoverNav>
              <div style={{flexGrow: 1, transition: 'height 300ms'}}>
                <div style={{position: 'relative', width:'100%', height: '100%'}}>
                <Computer style={{position: 'absolute', top: this.state.toggle ? 24 : 64, right: this.state.toggle ? 0 : 152, transition: 'all 300ms'}} fill='#FFF' size={this.state.toggle ? 56 : 80} />
                <div style={{height: this.state.toggle ? 24 : 192, transition: 'height 300ms'}} />
                <div style={{position: 'relative', transition: 'all 300ms'}}>
                  <div style={{fontSize: 24, color: '#FFF', marginBottom: 12}}>{model(selectedItem.name)}</div>
                  <div style={{fontSize: 14, color: '#FFF', marginBottom: 16, opacity: 0.7}}>{selectedItem.address}</div>
                  { !this.state.toggle && <div style={{fontSize: 14, color: '#FFF', marginBottom: 16, opacity: 0.7}}>{selectedItem.serial}</div> }
                </div>
                </div>
              </div>
              <HoverNav style={{flex: '0 0 64px'}}
                onTouchTap={this.selectNextDevice}
              ><NavigationChevronRight style={{width:32, height:32}} color='#FFF'/></HoverNav>
            </div>)

            }
          </Paper>
          <Paper style={{width:'100%', paddingLeft:64, paddingRight:64}}>
            {(() => {
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
                debug('selectedItem', selectedItem.users)
                // return <UserList device={selectedItem}></UserList>
                return (
                  <div style={{width: '100%', height: '100%', paddingTop: 16, display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap'}}
                  >
                    { selectedItem && selectedItem.users.map((user, index) => <NamedAvatar 
                      key={user.uuid} 
                      style={{marginRight:16, marginBottom:16}} 
                      name={user.username} 
                      onTouchTap={() => {
                        this.setState(Object.assign({}, this.state, { toggle: true, selectedUserIndex: index })) 
                      }}/>) }
                  </div>
                )
              }
              //appifi 正常运行 但没有用户
              else if (selectedItem.fruitmix && selectedItem.users.length == 0) {
                return <div className='login-appifi-button' onClick={this.openGuide.bind(this)}>向导</div>
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
            })()}
          </Paper>
          { this.state.selectedUserIndex !== -1 &&
          <Paper style={{width:'100%'}}>
            <div style={{fontSize: 16}}>{(() => {

              if (this.state.selectedUserIndex === -1) return

              let devices = window.store.getState().login.device
              let device = devices[this.state.selectedDeviceIndex]

              if (!device) return
              if (!device.users) return
              
              let user = device.users[this.state.selectedUserIndex]
              if (user &&  user.username) return user.username
            })()}</div>
            <TextField fullWidth={false} />
          </Paper>
          }
          <Paper style={{width:'100%'}} />
          <Paper style={{width:'100%', display:'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <FlatButton onTouchTap={() => {
              this.setState(Object.assign({}, this.state, { toggle: !this.state.toggle }))
            }}/>
          </Paper>
        </div>
        <Snackbar 
          open={storeState().snack.open} 
          message={storeState().snack.text} 
          autoHideDuration={3000} 
          onRequestClose={this.cleanSnack.bind(this)}
        />
      </div>
	  )
	}

	getGuide() {
		let selectedDeviceIndex = this.state.selectedDeviceIndex
		let selectedItem = storeState().login.device[selectedDeviceIndex]
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
		let selectedDeviceIndex = this.state.selectedDeviceIndex
		let selectedItem = storeState().login.device[selectedDeviceIndex]
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
										<span onClick={this.selectDisk.bind(this,item)}>{add?'添加':'已添加'}</span>
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
		let selectedDeviceIndex = this.state.selectedDeviceIndex
		let selectedItem = storeState().login.device[selectedDeviceIndex]
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


class UserBox extends React.Component {

  constructor(props) {
    super(props)

    this.users = props.users

    this.state = {
      selectedIndex: -1
    }
  }

  renderBlank() {
    return <div style={{width: '100%', height: '100%'}} />
  }

  renderLoginBox() {
    return (
      <div style={{width: '100%', display: 'flex', flexDirection: 'column' }}>     
        <div style={{flex: '0 0 34px'}}/>
        <div style={{fontSize: 34, color: '#000', opacity: 0.54}}>{this.users[this.state.selectedIndex].username}</div>
        <div style={{flex: '0 0 8px'}}/>
        <TextField fullWidth={true} hintText='请输入密码' type='password'
          ref={ input => { input && input.focus() }}
          onChange={e => this.inputValue = e.target.value}
          onKeyDown={e => {
            if (e.which === 13) {
              ipcRenderer.send('login', this.users[this.state.selectedIndex].username, this.inputValue)
            }
          }}
          onBlur={() => {}}
        />
        <div style={{flex: '0 0 34px'}}/>
        <div style={{width: '100%', display: 'flex'}}>
          <div style={{flexGrow: 1}} />
          <FlatButton label='确认' primary={true} 
            onTouchTap={() => {
              ipcRenderer.send('login', this.users[this.state.selectedIndex].username, this.inputValue) 
            }}
          />
          <FlatButton style={{marginLeft: 16}} label='取消' primary={true} 
            onTouchTap={() => {
              this.setState(Object.assign({}, this.state, { selectedIndex: -1 }))
              this.props.onResize('VSHRINK')
            }} 
          />
        </div>
      </div>
    )
  }

  render() {

    return (
      <Paper key='login-user-box' style={this.props.style}>
        <div style={{boxSizing: 'border-box', width:'100%', paddingLeft:64, paddingRight:64, backgroundColor:'#FFF'}}>
          <div style={{width: '100%', height: '100%', paddingTop: 16, display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap'}}>
            { this.users && 
                this.users.map((user, index) => 
                  <NamedAvatar 
                    key={user.uuid} 
                    style={{marginRight:16, marginBottom:16}} 
                    name={user.username} 
                    onTouchTap={() => {

                      this.inputValue = ''
                      this.setState(Object.assign({}, this.state, { selectedIndex: index }))
                      this.props.onResize('VEXPAND')
                    }}

                  />)}
          </div>
        </div>
        <div style={{boxSizing: 'border-box', width: '100%', height: this.state.selectedIndex !== -1 ? 240 : 0, backgroundColor: '#FAFAFA', paddingLeft: 64, paddingRight: 64, overflow: 'hidden', transition: 'all 300ms'}}>
          { this.state.selectedIndex !== -1 && this.renderLoginBox() }
        </div>
      </Paper>
    )
  }
}

class FirstUserBox extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      expanded: false
    }
  }

  render() {
    return (
      <div style={{width: '100%'}}>
        <div style={{width: '100%', height: '100%'}}>
          <div style={{width: '100%', height: this.state.expanded ? 320 : 0, transition: 'height 300ms', overflow: 'hidden', backgroundColor: '#FFF',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', boxSizing: 'border-box', paddingLeft: 64}}>
            
            <div style={{marginTop: 34, fontSize: 24, color: '#000', opacity: 0.54}}>创建第一个用户</div>
            <div style={{marginTop: 8, marginBottom: 12, fontSize: 20, color: '#000', opacity: 0.54}}>该用户将成为系统中最高权限的管理员</div>
            <TextField hintText='用户名'/>
            <TextField hintText='密码' />
            <TextField hintText='确认密码' />
            <div style={{display: 'flex'}}>
              <FlatButton label='确认' />
              <FlatButton label='取消' onTouchTap={() => {
                this.setState(Object.assign({}, this.state, { expanded: false }))
                this.props.onResize('VSHRINK') 
              }}/>
            </div>
          </div>
          <div style={{width: '100%', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFA'}}>
            <div style={{marginLeft: 16}}>该设备已安装WISNUC OS，但尚未创建用户。</div>
            <FlatButton style={{marginRight: 16}} label='创建用户' disabled={this.state.expanded} onTouchTap={() => {
              this.setState(Object.assign({}, this.state, { expanded: true }))
              this.props.onResize('VEXPAND')
              // setTimeout(() => this.props.onResize('HEXPAND'), 350)
            }}/>
          </div>
        </div>
      </div>
    )
  }
}


class GuideBox extends React.Component {

  constructor(props) {

    super(props)
    this.state = {

      // multi-steps expansion / shrink animation
      expanded: false,
      showContent: false,

      // stepper
      finished: false,
      stepIndex: 0,

      //
      selection: [],
      mode: null, 
     
      //
      username: null,
      password: null,
      passwordAgain: null 
    }

    this.handleNext = () => {
      const {stepIndex} = this.state
      this.setState(Object.assign({}, this.state, {
        stepIndex: stepIndex + 1,
        finished: stepIndex >= 2,
      }))
    }

    this.handlePrev = () => {
      const {stepIndex} = this.state;
      if (stepIndex > 0) {
        this.setState(Object.assign({}, this.state, {stepIndex: stepIndex - 1}))
      }
    }

    this.renderStepActions = (step) => {

        const {stepIndex} = this.state;

        return (
          <div style={{margin: '12px 0'}}>
            <RaisedButton
              label={stepIndex === 2 ? '完成' : '下一步'}
              disableTouchRipple={true}
              disableFocusRipple={true}
              primary={true}
              onTouchTap={this.handleNext}
              style={{marginRight: 12}}
            />
            {step > 0 && (
              <FlatButton
                label="上一步"
                disabled={stepIndex === 0}
                disableTouchRipple={true}
                disableFocusRipple={true}
                onTouchTap={this.handlePrev}
              />
            )}
          </div>
        );
      }

    this.radioButtonOnClick = value => {
      
    }
  }

  renderRow (blk) {

    let model = blk.model ? blk.model : '未知型号'
    let name = blk.name
    let size = prettysize(blk.size * 512)
    let iface = blk.isATA ? 'ATA' :
                blk.isSCSI ? 'SCSI' :
                blk.isUSB ? 'USB' : '未知'

    let usage = blk.isFileSystem ? '文件系统' :
                blk.isPartitioned ? '有文件分区' : '未知'

    let valid = !blk.isRootFS && !blk.isActiveSwap && !blk.removable

    console.log(blk.isRootFS, blk.isActiveSwap, blk.removable, valid)

    let comment
    if (blk.isRootFS)
      comment = '该磁盘含有rootfs，不可用'
    else if (blk.isActiveSwap)
      comment = '该磁盘含有在使用的交换分区，不可用'
    else if (blk.removable)
      comment = '该磁盘为可移动磁盘，WISNUC OS不支持使用可移动磁盘建立磁盘卷'
    else
      comment = '该磁盘可以加入磁盘卷'
 
    return (
      <div key={name} style={{width: '100%', height: 48, display: 'flex', alignItems: 'center'}}>
        <div style={{flex: '0 0 64px'}}>
          { valid && <Checkbox style={{marginLeft: 16}} checked={this.state.selection.indexOf(name) !== -1}onCheck={() => {

            let nextState

            let index = this.state.selection.indexOf(name)
            if (index === -1) {
              nextState = Object.assign({}, this.state, {
                selection: [...this.state.selection, name]
              })
            }
            else {
              nextState = Object.assign({}, this.state, {
                selection: [...this.state.selection.slice(0, index),
                  ...this.state.selection.slice(index + 1)]
              })
            }

            if (nextState.selection.length === 1) {
              nextState.mode = 'single'
            }
            else if (nextState.selection.length === 0) {
              nextState.mode = null
            }

            this.setState(nextState)

          }}/>}
        </div>
        <div style={{flex: '0 0 160px'}}>{model}</div>
        <div style={{flex: '0 0 80px'}}>{name}</div>
        <div style={{flex: '0 0 80px'}}>{size}</div>
        <div style={{flex: '0 0 80px'}}>{iface}</div>
        <div style={{flex: '0 0 80px'}}>{usage}</div>
        <div style={{flex: '0 0 240px'}}>{comment}</div>
      </div> 
    )
  }

  render() {

    const {finished, stepIndex} = this.state;

    return (
      <div style={{width: '100%'}}>
        <div style={{width: '100%', height: '100%'}}>
          <div style={{width: '100%', height: this.state.expanded ? 640 : 0, transition: 'height 300ms', overflow: 'hidden', backgroundColor: '#FAFAFA', boxSizing: 'border-box', paddingLeft: 64, paddingRight: 64}}>
            <div style={{marginTop: 34, marginBottom: 12, fontSize: 34, color: '#000', opacity: 0.54}}>初始化向导</div>
            <div style={{opacity: this.state.showContent ? 1 : 0, transition:'opacity 150ms'}}>
              <Stepper activeStep={stepIndex} orientation="vertical">
                <Step>
                  <StepLabel>创建或选择已有的磁盘卷</StepLabel>
                  <StepContent style={{opacity: 0.87}}>
                    <p>WISNUC OS使用Btrfs文件系统，您可以选择一块或多块物理磁盘创建磁盘卷，<span style={{color: 'red'}}>所选磁盘上的数据都会被清除</span>。</p>
                      <div style={{width: 720, fontSize: 13}}>
                        <Divider />
                        <div style={{width: '100%', height: 48, display: 'flex', alignItems: 'center'}}>
                          <div style={{flex: '0 0 64px'}} />
                          <div style={{flex: '0 0 160px'}}>型号</div>
                          <div style={{flex: '0 0 80px'}}>设备名</div>
                          <div style={{flex: '0 0 80px'}}>容量</div>
                          <div style={{flex: '0 0 80px'}}>接口</div>
                          <div style={{flex: '0 0 80px'}}>使用</div>
                          <div style={{flex: '0 0 240px'}}>说明</div>
                        </div>
                        <Divider />
                        { this.props.storage && this.props.storage.blocks.filter(blk => blk.isDisk).map(blk => this.renderRow(blk)) }
                        <Divider />
                      </div>
                    <div style={{position: 'relative', marginTop: 12, marginBottom:12, display: 'flex'}}>
                      <div>选择磁盘卷模式：</div>
                      <div style={{width: 160}}>
                      <RadioButtonGroup style={{position: 'relative', display: 'flex'}} 
                        valueSelected={this.state.mode} 
                        onChange={(e, value) => {
                          this.setState(Object.assign({}, this.state, { mode: value })) 
                        }}>
                        <RadioButton value='single' label='single模式' disabled={this.state.selection.length === 0} />
                        <RadioButton value='raid0' label='raid0模式' disabled={this.state.selection.length < 2} />
                        <RadioButton value='raid1' label='raid1模式' disabled={this.state.selection.length < 2} />
                      </RadioButtonGroup>
                      </div>
                    </div>
                    <div style={{margin: '12px 0'}}>
                      <RaisedButton
                        label='下一步'
                        disabled={this.state.selection.length === 0 || !this.state.mode}
                        disableTouchRipple={true}
                        disableFocusRipple={true}
                        primary={true}
                        onTouchTap={this.handleNext}
                        style={{marginRight: 12}}
                      />
                    </div>
                  </StepContent>
                </Step>
                <Step>
                  <StepLabel>创建第一个用户</StepLabel>
                  <StepContent>
                    <p>请输入第一个用户的用户名和密码，该用户会成为系统权限最高的管理员。</p>
                    <div>
                      <TextField key='guide-box-username' hintText='用户名' 
                        value={this.state.username}
                        onChange={e => {
                        let nextState = Object.assign({}, this.state, { username: e.target.value })
                        console.log(nextState)
                        this.setState(nextState)
                      }}/>
                    </div>
                    <div>
                      <TextField key='guide-box-password' hintText='密码' 
                        value={this.state.password}
                        onChange={e => {
                        let nextState = Object.assign({}, this.state, { password: e.target.value })
                        console.log(nextState)
                        this.setState(nextState)
                      }}/>
                    </div>
                    <div>
                      <TextField key='guide-box-password-again' hintText='再次输入密码' 
                        value={this.state.passwordAgain}
                        onChange={e => {
                        this.setState(Object.assign({}, this.state, { passwordAgain: e.target.value }))
                      }}/>
                    </div>
                    <div style={{margin: '12px 0'}}>
                      <RaisedButton
                        label='下一步'

                        disabled={!(this.state.username && 
                          this.state.username.length > 0 && 
                          this.state.password &&
                          this.state.password === this.state.passwordAgain && 
                          this.state.password.length > 0)}

                        disableTouchRipple={true}
                        disableFocusRipple={true}
                        primary={true}
                        onTouchTap={this.handleNext}
                        style={{marginRight: 12}}
                      />
                      <FlatButton
                        label="上一步"
                        disableTouchRipple={true}
                        disableFocusRipple={true}
                        onTouchTap={this.handlePrev}
                      />
                    </div>
                  </StepContent>
                </Step>
                <Step>
                  <StepLabel>确认</StepLabel>
                  <StepContent>
                    <p>请确认您输入的信息无误，点击完成键应用设置。</p>
                    <div style={{margin: '12px 0'}}>
                      <RaisedButton
                        label='完成'
                        disableTouchRipple={true}
                        disableFocusRipple={true}
                        primary={true}
                        onTouchTap={() => {
                          this.handleNext()
                          console.log('this is finished button')
                          console.log('address', this.props.address)
                          console.log('selection', this.state.selection)
                          console.log('mode', this.state.mode)
                          console.log('username', this.state.username)
                          console.log('password', this.state.password)

                          request
                            .post(`http://${this.props.address}:3000/system/mir`)
                            .send({
                              target: this.state.selection,
                              mkfs: {
                                type: 'btrfs',
                                mode: this.state.mode,
                              },
                              init: {
                                username: this.state.username,
                                password: this.state.password
                              }
                            })
                            .set('Accept', 'application/json')
                            .end((err, res) => {
                              // FIXME error
                              // console.log(err || !res.ok || res.body)
                              if (err || !res.ok) {
                                console.log(err || !res.ok)
                                return
                              }

                              setTimeout(() => 
                                ipcRenderer.send('login', this.state.username, this.state.password), 1000)
                            })
                        }}
                        style={{marginRight: 12}}
                      />
                      <FlatButton
                        label="上一步"
                        disabled={stepIndex === 0}
                        disableTouchRipple={true}
                        disableFocusRipple={true}
                        onTouchTap={this.handlePrev}
                      />
                    </div>
                  </StepContent>
                </Step>
              </Stepper>
              { finished && (
                <div style={{width: '100%', height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 64}}>
                  <CircularProgress />
                  <div style={{marginTop: 16, fontSize: 24, opacity: 0.54}}>正在应用设置，请管理员同志耐心等待。</div>
                </div>
              )}
            </div>

          </div>

          <div style={{width: '100%', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFA'}}>
            <div style={{marginLeft: 16}}>该设备已安装WISNUC OS，但尚未初始化。</div>
            <FlatButton style={{marginRight: 16}} label={this.state.expanded ? '放弃' : '初始化'} 
              onTouchTap={() => {
                if (this.state.expanded) {
                  this.setState(Object.assign({}, this.state, { 
                    showContent: false,
                    finished: false,
                    stepIndex: 0,
                    selection: [],
                    mode: null,
                    username: null,
                    password: null,
                    passwordAgain: null
                  }))
                  setTimeout(() => {
                    this.props.onResize('HSHRINK')
                    setTimeout(() => {
                      this.setState(Object.assign({}, this.state, { expanded: false }))
                      this.props.onResize('VSHRINK')
                    }, 350)
                  }, 150)
                }
                else {
                  this.setState(Object.assign({}, this.state, { expanded: true }))
                  this.props.onResize('VEXPAND')
                  setTimeout(() => {
                    this.props.onResize('HEXPAND')
                    setTimeout(() => {
                      this.setState(Object.assign({}, this.state, { showContent: true }))
                    }, 350)
                  }, 350)
                }
              }}
            />
          </div>
        </div>
      </div>
    )
  }
}

class MaintenanceBox extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    return <div style={{width: '100%', backgroundColor: 'red', height: 64}}>This is MaintenanceBox</div>
  }
}

class KardContent extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    <div style={{width: '100%', height: 240, display: 'flex', justifyContent: 'space-between'}}>
      <div style={{width: '50%', backgroundColor: 'red'}} onTouchTap={this.props.onLeftTouchTap}/> 
      <div style={{width: '50%', backgroundColor: 'green'}} onTouchTap={this.props.onRightTouchTap}/>
    </div>
  }
}


class InfoCard extends React.Component {

  constructor(props) {
    super(props)
  }

  componentWillEnter(callback) {
    this.props.onWillEnter(ReactDOM.findDOMNode(this), callback) 
  }

  componentWillLeave(callback) {
    this.props.onWillLeave(ReactDOM.findDOMNode(this), callback)
  }

  render() {
    return (
      <div style={this.props.style}>
        <div style={{width: '100%', height: 288, backgroundColor: 'rgba(128, 128, 128, 0.8)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontSize: 21, color:'#FFF'}}>{this.props.text}</div>
          <div style={{flex: '0 0 24px'}} />
          <div style={{width: '70%'}}><LinearProgress /></div>
        </div>
      </div>
    )
  }
}

class DeviceCard extends React.Component {

  constructor(props) {

    super(props)

    this.state = {
      selectedUserIndex: -1,
      toggle: false,
      horizontalExpanded: false
    }

    this.model = '个人计算机'
    this.logoType = Computer
    this.serial = '未知序列号'
    this.address = props.address
    this.users = props.users

    debug('device card, props.name', props.name)

    if (props.name) {

      let split = props.name.split('-')
      if (split.length === 3 && split[0] === 'wisnuc') {

        if (split[1] === 'ws215i') {
          this.model = 'WS215i'
          this.logoType = Barcelona
        }

        this.serial = split[2]
      }
    } 

    ipcRenderer.send('setServerIp', props.address)

    if (!this.users) {
      request.get(`http://${props.address}:3000/system/storage`)
        .set('Accept', 'application/json')
        .end((err, res) => {

          console.log('device card load storage', err || !res.ok || res.body)

          let storage = (err || !res.ok) ? 'ERROR' : res.body
          this.setState(Object.assign({}, this.state, { storage }))
        })
    }

    this.onBoxResize = resize => {
      if ((resize === 'VEXPAND' && this.state.toggle === false) || (resize === 'VSHRINK' && this.state.toggle === true))
        this.setState(Object.assign({}, this.state, { toggle: !this.state.toggle }))
      else if (resize === 'HEXPAND' || resize === 'HSHRINK')
        this.props.onResize(resize)
    }
  }

  componentWillEnter(callback) {
    this.props.onWillEnter(ReactDOM.findDOMNode(this), callback) 
  }

  componentWillLeave(callback) {
    this.props.onWillLeave(ReactDOM.findDOMNode(this), callback)
  }

  selectedUsername() {
    if (this.users && this.users.length && this.state.selectedUserIndex >= 0 && this.state.selectedUserIndex < this.users.length) {
      return this.users[this.state.selectedUserIndex].username
    }
  }

  render() {

    let paperStyle = {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: this.props.backgroundColor || '#3F51B5',
      transition: 'all 300ms'
    }

    return (
      <div style={this.props.style}>

        {/* top container */}
        <Paper id='top-half-container' style={paperStyle} >
          <div style={{width: '100%', display: 'flex', alignItems: 'stretch'}}>
            <HoverNav style={{flex: '0 0 64px'}} onTouchTap={this.props.onNavPrev} >
              <NavigationChevronLeft style={{width:32, height:32}} color='#FFF'/>
            </HoverNav>
            <div style={{flexGrow: 1, transition: 'height 300ms'}}>
              <div style={{position: 'relative', width:'100%', height: '100%'}}>
              { 
                React.createElement(this.logoType, { 

                  style: this.state.toggle ?  {
                      position: 'absolute',
                      top: 12,
                      right:0,
                      transition: 'all 300ms'
                    } : {
                      position: 'absolute',
                      top: 64,
                      left: 0,
                      right: 0,
                      margin: 'auto',
                      transition: 'all 300ms'
                    },

                  fill: '#FFF',
                  size: this.state.toggle? 40 : 80
                }) 
              }
              <div style={{height: this.state.toggle ? 16 : 192, transition: 'height 300ms'}} />
              <div style={{position: 'relative', transition: 'all 300ms'}}>
                <div style={{
                  fontSize: this.state.toggle ? 14 : 24, 
                  fontWeight: 'medium',
                  color: '#FFF', 
                  marginBottom: this.state.toggle ? 0 : 12,
                }}>{this.model}</div>
                <div style={{fontSize: 14, color: '#FFF', marginBottom: 12, opacity: 0.7}}>{this.address}</div>
                { !this.state.toggle && <div style={{fontSize: 14, color: '#FFF', marginBottom: 16, opacity: 0.7}}>{this.serial}</div> }
              </div>
              </div>
            </div>
            <HoverNav style={{flex: '0 0 64px'}} onTouchTap={this.props.onNavNext} >
              <NavigationChevronRight style={{width:32, height:32}} color='#FFF'/>
            </HoverNav>
          </div>
        </Paper>

        { this.props.boot && this.props.boot.state === 'normal' && this.users && this.users.length !== 0 &&
          <UserBox 
            style={{width: '100%', backgroundColor: '#FFF', transition: 'all 300ms'}} 
            color={this.props.backgroundColor}
            users={this.users}
            username={this.selectedUsername()}
            onResize={this.onBoxResize}
          />
        }
        { this.props.boot && this.props.boot.state === 'normal' && this.users && this.users.length === 0 &&
          {/* <FruitmixInitBox />*/}
        }
        { this.props.boot && this.props.boot.state === 'maintenance' && !this.props.boot.lastFileSystem &&
          <GuideBox address={this.address} storage={this.state.storage} onResize={this.onBoxResize} />
        }
        { this.props.boot && this.props.boot.state === 'maintenance' && this.props.boot.lastFileSystem &&
          <MaintenanceBox />
        }
      </div>
    )
  }
}

const colorArray = [ indigo900, cyan900, teal900, lightGreen900, lime900, yellow900 ]

class Login extends React.Component {

  constructor(props) {

    const duration = 0.45

    super(props)
    this.state = {
      devices: [],
      uuid: UUID.v4(),
      selectedDeviceIndex: -1,
      expanded: false
    }

    this.initTimer = setInterval(() => {

      if (window.store.getState().login.device.length === 0) return
      
      clearInterval(this.initTimer)       
      delete this.initTimer

      console.log('init devices', window.store.getState().login.device)

      let nextState = Object.assign({}, this.state, { devices: window.store.getState().login.device, selectedDeviceIndex: 0 })
      this.setState(nextState)

      debug('devices initialized', nextState)

    }, 2000)

    this.selectNextDevice = () => {
     
      let { devices, selectedDeviceIndex } = this.state
      let index

      if (devices.length === 0) 
        index = -1
      else if (selectedDeviceIndex === -1)
        index = 0
      else if (selectedDeviceIndex >= devices.length - 2)
        index = devices.length - 1
      else 
        index = selectedDeviceIndex + 1

      if (index === selectedDeviceIndex) return

      let nextState = Object.assign({}, this.state, { selectedDeviceIndex: index, expanded: false })
      this.setState(nextState)

      debug('select next device', selectedDeviceIndex, index)
    }

    this.selectPrevDevice = () => {
     
      let { devices, selectedDeviceIndex } = this.state
      let index

      if (devices.length === 0) 
        index = -1
      else if (selectedDeviceIndex <= 1)
        index = 0
      else 
        index = selectedDeviceIndex - 1

      if (index === selectedDeviceIndex) return

      let nextState = Object.assign({}, this.state, { selectedDeviceIndex: index, expanded: false })
      this.setState(nextState)

      debug('select prev device', selectedDeviceIndex, index)
    }
    

    // for leaving children, there is no way to update props, but this state is required for animation
    // so we put it directly in container object, and pass callbacks which can access this state
    // to the children
    this.enter = 'right'

    this.cardWillEnter = (el, callback) => {

      if (this.enter === 'right') {
        TweenMax.from(el, duration, {
          delay: duration,
          opacity: 0, 
          right: -150,
          onComplete: () => callback()
        })
      }
      else {
        TweenMax.from(el, duration, {
          delay: duration,
          opacity: 0, 
          transformOrigin: 'left center',
          transform: 'translateZ(-64px) rotateY(45deg)',
          onComplete: () => callback()
        })
      }
    }

    this.cardWillLeave = (el, callback) => {

      if (this.enter === 'left') {
        TweenMax.to(el, duration, {
          opacity: 0, 
          right: -150,
          onComplete: () => callback()
        })
      }
      else {
        TweenMax.to(el, duration, {
          opacity: 0, 
          transformOrigin: 'left center',
          transform: 'translateZ(-64px) rotateY(45deg)',
          onComplete: () => callback()
        })
      }
    }

    this.navPrev = () => {
      this.enter = 'left'
      this.selectPrevDevice()
    }

    this.navNext = () => {
      this.enter = 'right'
      this.selectNextDevice()
    }
  }

  render() {

    let type, props = {

      style: { position: 'absolute', width:'100%', height: '100%'},
      onWillEnter: this.cardWillEnter,
      onWillLeave: this.cardWillLeave
    }
    
    if (this.state.devices.length === 0) {
      type = InfoCard
      Object.assign(props, { 
        key: 'init-scanning-device',
        text: '正在搜索网络上的WISNUC OS设备' 
      })
    }
    else {

      let device = this.state.devices[this.state.selectedDeviceIndex]

      console.log('device storage', device, device.storage)

      type = DeviceCard
      Object.assign(props, {

        key: `login-device-card-${this.state.selectedDeviceIndex}`,

        boot: device.boot,
        storage: device.storage,
        name: device.name,
        address: device.address,
        users: device.users,

        backgroundColor: colorArray[this.state.selectedDeviceIndex % colorArray.length],

        onNavPrev: this.state.selectedDeviceIndex === 0 ? null : this.navPrev,
        onNavNext: this.state.selectedDeviceIndex === this.state.devices.length - 1 ? null : this.navNext,

        onResize: resize => {
          if ((resize === 'HEXPAND' && !this.state.expanded) || (resize === 'HSHRINK' && this.state.expanded))
            this.setState(Object.assign({}, this.state, { expanded: !this.state.expanded }))
        }
      })
    }

    return (
      <div 
        style={{
          backgroundImage: 'url(../src/assets/images/index/index.jpg)',
          width: '100%', 
          height: '100%', 
          display:'flex', 
          flexDirection: 'column', 
          alignItems: 'center'
        }}
      >
        <div style={{marginTop: 160, width: this.state.expanded ? 1024 : 480, backgroundColor: '#BBB', transition: 'width 300ms'}}>
          <div style={{width: '100%', position: 'relative', perspective: 1000}}>
            <TransitionGroup>
              { React.createElement(type, props) }
            </TransitionGroup>
          </div>
        </div>
      </div>
    )
  }
}

export default Login

