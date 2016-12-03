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
import { Avatar, IconButton, Paper, TextField, FlatButton, CircularProgress, Snackbar, SelectField, MenuItem, RadioButton, RadioButtonGroup } from 'material-ui'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'  
import TransitionGroup from 'react-addons-transition-group'

import NavigationChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import NavigationChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import { command } from '../../lib/command' 
import { TweenMax } from 'gsap'

//import CSS
import css  from  '../../../assets/css/login'
//import component
import UserList from './userList'

import Debug from 'debug'
const debug = Debug('view:login')

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

const Barcelona = ({fill, size}) => (
  <div style={{width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <svg style={{fill, width: Math.floor(size * 128 / 192), height: Math.floor(size * 176 / 192)}}
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 352">
      <path d="m 218.80203,48.039815 c -14.29555,11.911857 -25.3383,24.549958 -45.64007,35.359768 -7.02132,4.468951 -23.85238,6.000285 -34.76376,2.406502 C 111.22305,78.031495 92.140083,67.296886 70.422926,57.663153 48.215526,46.811935 22.865307,36.618679 5.6439616,24.553833 -1.5344798,20.331611 -0.35135786,13.918033 13.868086,11.892977 43.143517,7.1450877 75.870493,6.5837609 107.132,4.6866422 147.52562,3.0153376 187.86409,-0.22170151 228.69047,0.37596259 242.35579,0.23107113 257.06988,3.8096879 254.79285,9.2910307 251.48569,20.8655 236.4618,31.431442 225.3584,42.204703 c -2.18031,1.945806 -4.36853,3.890424 -6.55637,5.835112 z" />
      <path d="M 0.71584761,36.189436 C 5.7333591,46.742429 28.494578,54.650053 44.647666,63.186203 c 29.265921,13.132026 55.055587,27.478913 89.289864,39.017527 22.53176,8.66966 45.71976,-2.309934 53.39004,-9.921384 23.06458,-18.643025 45.06127,-37.527084 63.37844,-56.857692 4.39395,-3.966197 5.48956,-13.906509 4.83954,-4.430211 -0.4744,81.122537 0.0256,162.248467 -0.49302,243.368927 -7.81768,16.05486 -29.68046,30.63968 -45.31272,45.8063 -12.79139,10.22313 -21.6348,21.65006 -43.34582,29.94174 -24.20287,5.91627 -44.5008,-6.09059 -59.21752,-11.5605 C 74.058118,323.37123 39.752306,308.43334 10.445173,292.23628 -5.6879281,283.85313 2.7946672,273.33309 0.66866322,263.84413 0.57030725,187.95925 0.87058396,112.0742 0.71584761,36.189436 Z" />
    </svg>
  </div>
)

const NamedAvatar = ({ style, name }) => (
  <div style={style}>
    <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start'}}>
      <Avatar>{name.slice(0, 3).toUpperCase()}</Avatar>
      { false && <div style={{marginTop: 12, fontSize: 12, fontWeight: 'medium', opacity: 0.7}}>{name}</div> }
    </div> 
  </div>
)

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
      expanded: false
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
      if (storeState().login.selectIndex == 0 && storeState().login.device.length != 0) {
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
		let selectedIndex = storeState().login.selectIndex
		let selectedItem = storeState().login.device[selectedIndex]
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
		}else {
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
		let selectedIndex = storeState().login.selectIndex
		let selectedItem = storeState().login.device[selectedIndex]
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

        <div style={{width: 480}}>
          <Paper id='top-half-container'
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              backgroundColor: '#455A64'
            }}
          >

            { storeState().login.device.length === 0 && <div>没有发现相关设备</div> }
            { storeState().login.device.length !== 0 && (

            <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{width: '100%', marginTop:64, marginBottom:32, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <IconButton style={{marginLeft: 24}} iconStyle={{color:'#FFF'}}
                  onTouchTap={this.selectDevice.bind(this,selectedIndex-1,true)}
                ><NavigationChevronLeft /></IconButton>
                <Barcelona fill='#FFF' size={80} />
                <IconButton style={{marginRight: 24}} iconStyle={{color:'#EEE'}}
                  onTouchTap={this.selectDevice.bind(this,selectedIndex+1,true)}
                ><NavigationChevronRight /></IconButton>
              </div>
              <div style={{fontSize: 24, color: '#FFF', marginBottom: 12}}>{model(selectedItem.name)}</div>
              <div style={{fontSize: 14, color: '#FFF', marginBottom: 24, opacity: 0.7}}>{selectedItem.address}</div>
            </div> )

            }
          </Paper>
          <Paper style={{width:'100%'}}>
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
                  <div style={{width: '100%', height: '100%', padding:10, display: 'flex', 
                    justifyContent: 'center', flexWrap: 'wrap'}}
                  >
                    { selectedItem && selectedItem.users.map(user => 
                      <NamedAvatar key={user.uuid} style={{margin:10}} name={user.username} />) }
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
          <Paper style={{width:'100%', display:'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <IconButton style={{marginLeft: 24}} iconStyle={{color:'#FFF'}}
              onTouchTap={this.selectDevice.bind(this,selectedIndex-1,true)}
            ><NavigationChevronLeft /></IconButton>
            <IconButton style={{marginRight: 24}} iconStyle={{color:'#EEE'}}
              onTouchTap={this.selectDevice.bind(this,selectedIndex+1,true)}
            ><NavigationChevronRight /></IconButton>
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
		let selectedIndex = storeState().login.selectIndex
		let selectedItem = storeState().login.device[selectedIndex]
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
		let selectedIndex = storeState().login.selectIndex
		let selectedItem = storeState().login.device[selectedIndex]
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
		let selectedIndex = storeState().login.selectIndex
		let selectedItem = storeState().login.device[selectedIndex]
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

