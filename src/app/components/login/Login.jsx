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

//import material module
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import { Checkbox, Divider, RaisedButton, Avatar, IconButton, LinearProgress, Paper, TextField, FlatButton, CircularProgress, Snackbar, SelectField, MenuItem } from 'material-ui'
import { Step, Stepper, StepLabel, StepContent } from 'material-ui/Stepper'
import { Tabs, Tab } from 'material-ui/Tabs'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import NavigationChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import NavigationChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import SocialPerson from 'material-ui/svg-icons/social/person'
import ToggleRadioButtonChecked from 'material-ui/svg-icons/toggle/radio-button-checked'
import ToggleRadioButtonUnchecked from 'material-ui/svg-icons/toggle/radio-button-unchecked'

import {indigo900, cyan500, cyan900, teal900, lightGreen900, lime900, yellow900} from 'material-ui/styles/colors'

//import react transition module
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'  
import TransitionGroup from 'react-addons-transition-group'

//import file module
import Action from '../../actions/action'
import { command } from '../../lib/command' 

import { TweenMax } from 'gsap'
import UUID from 'node-uuid'
import request from 'superagent'
import prettysize from 'prettysize'

//import CSS
import css  from  '../../../assets/css/login'

import Debug from 'debug'
const debug = Debug('component:login')

import InfoCard from './InfoCard'
import UserBox from './UserBox'
import GuideBox from './GuideBox'

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

const Docker = ({style, fill, size}) => (
  <div style={Object.assign(style, {width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 300ms'})}>
    <svg style={{fill, width: Math.floor(size * 176 / 192), height: Math.floor(size * 128 / 192), transition: 'all 300ms'}}
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 352">
      <path d="m 35.342575,103.40594 c -7.386153,0.40907 -12.720571,-9.266577 -7.439462,-14.894382 5.069711,-6.521328 17.337886,-2.768809 17.00382,5.785471 0.03854,5.014639 -4.675211,9.158751 -9.564358,9.108911 z M 152.84753,53.762374 c -0.93488,-8.409321 -7.15165,-14.808034 -13.66337,-19.58416 -7.73073,7.983312 -8.58014,21.433093 -2.27722,30.514852 -10.40378,6.28869 -22.73566,4.173144 -34.26638,4.554456 -33.970613,0 -67.94123,0 -101.91184709,0 -1.84691781,10.773383 -0.15488452,22.43413 5.46534669,31.881188 6.4558514,12.35342 19.2275544,20.86878 32.5949364,24.41393 17.883348,4.46994 36.924859,2.51821 54.467584,-2.56682 25.12815,-7.28259 45.88364,-26.773895 55.49194,-50.995624 10.24032,0.808494 22.00694,-2.96169 26.40672,-13.040897 2.00666,-3.882791 -7.32229,-5.019983 -10.13077,-5.927476 -4.05372,-0.568579 -8.2215,-0.294547 -12.17694,0.750551 z M 94.095053,46.475245 c -5.920792,0 -11.841584,0 -17.762376,0 0,5.920792 0,11.841584 0,17.762376 5.920792,0 11.841584,0 17.762376,0 0,-5.920792 0,-11.841584 0,-17.762376 z m 0,-22.316833 c -5.920792,0 -11.841584,0 -17.762376,0 0,5.920792 0,11.841585 0,17.762377 5.920792,0 11.841584,0 17.762376,0 0,-5.920792 0,-11.841585 0,-17.762377 z m 0,-22.7722782 c -5.920792,0 -11.841584,0 -17.762376,0 0,5.9207924 0,11.8415852 0,17.7623772 5.920792,0 11.841584,0 17.762376,0 0,-5.920792 0,-11.8415848 0,-17.7623772 z M 115.95644,46.475245 c -5.92079,0 -11.84158,0 -17.762377,0 0,5.920792 0,11.841584 0,17.762376 5.920797,0 11.841587,0 17.762377,0 0,-5.920792 0,-11.841584 0,-17.762376 z m -66.039606,0 c -5.920792,0 -11.841585,0 -17.762377,0 0,5.920792 0,11.841584 0,17.762376 5.920792,0 11.841585,0 17.762377,0 0,-5.920792 0,-11.841584 0,-17.762376 z m 22.316832,0 c -5.920792,0 -11.841585,0 -17.762377,0 0,5.920792 0,11.841584 0,17.762376 5.920792,0 11.841585,0 17.762377,0 0,-5.920792 0,-11.841584 0,-17.762376 z m -44.17822,0 c -5.920792,0 -11.841584,0 -17.762376,0 0,5.920792 0,11.841584 0,17.762376 5.920792,0 11.841584,0 17.762376,0 0,-5.920792 0,-11.841584 0,-17.762376 z m 44.17822,-22.316833 c -5.920792,0 -11.841585,0 -17.762377,0 0,5.920792 0,11.841585 0,17.762377 5.920792,0 11.841585,0 17.762377,0 0,-5.920792 0,-11.841585 0,-17.762377 z m -22.316832,0 c -5.920792,0 -11.841585,0 -17.762377,0 0,5.920792 0,11.841585 0,17.762377 5.920792,0 11.841585,0 17.762377,0 0,-5.920792 0,-11.841585 0,-17.762377 z" />
    </svg>
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

class InstallBox extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        
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

class DeviceCard extends React.Component {

  constructor(props) {

    super(props)

    this.state = {

      selectedUserIndex: -1,
      toggle: false,
      horizontalExpanded: false,
    }

    this.mounted = false

    this.model = '个人计算机'
    this.logoType = Computer
    this.serial = '未知序列号'
    this.address = props.address
    this.users = props.users

    debug('device card, props.device', props.device)

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

  componentDidMount() {
    this.mounted = true
  }

  componentWillUnmount() {
    this.mounted = false
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

  renderFooter() {

    if (this.props.boot && (this.props.boot.state === 'normal' || this.props.boot.state === 'alternative') && this.users && this.users.length !== 0) 
      return (
        <UserBox 
          style={{width: '100%', backgroundColor: '#FFF', transition: 'all 300ms'}} 
          color={this.props.backgroundColor}
          users={this.users}
          username={this.selectedUsername()}
          onResize={this.onBoxResize}
        />
      )

    if (!this.state.storage) return <div /> // busybox

    if (this.props.boot && this.props.boot.state === 'maintenance') {
      if (!this.props.boot.lastFileSystem)
        return <GuideBox address={this.address} storage={this.state.storage} onResize={this.onBoxResize} />
      else
        return <MaintenanceBox />
    } 
    return <div />
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

        { this.renderFooter() }
      </div>
    )
  }
}

const colorArray = [ indigo900, cyan900, teal900, lightGreen900, lime900, yellow900 ]

class Login extends React.Component {

  constructor(props) {

    const duration = 0.4

    super(props)

    this.state = {
      devices: [],
      selectedDeviceIndex: -1,
      expanded: false,
      deviceName: null 
    }

    this.initTimer = setInterval(() => {

      if (window.store.getState().login.device.length === 0) return
      
      clearInterval(this.initTimer)       
      delete this.initTimer

      debug('init devices', window.store.getState().login.device)

      let nextState = Object.assign({}, this.state, { devices: window.store.getState().login.device})
      if (this.state.selectedDeviceIndex == -1) {
      	Object.assign(nextState,{selectedDeviceIndex:0})
      }
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.devices !== this.props.devices)
      debug('devices changed', this.props.devices, nextProps.devices)
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

      type = DeviceCard
      Object.assign(props, {

        key: `login-device-card-${this.state.selectedDeviceIndex}`,

        device: this.props.devices.find(dev => dev.address === device.address),

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

