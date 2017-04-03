/**
 * @component Index
 * @description 首页组件
 * @time 2016-10-23
 * @author liuhua
**/

import { TweenMax } from 'gsap'
import Debug from 'debug'
const debug = Debug('component:Login')

import { ipcRenderer } from 'electron'

import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import TransitionGroup from 'react-addons-transition-group'

import { TextField } from 'material-ui'
import FlatButton from '../common/FlatButton'
import { indigo900, cyan500, cyan900, teal900, lightGreen900, lime900, yellow900 } from 'material-ui/styles/colors'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import NavigationRefresh from 'material-ui/svg-icons/navigation/refresh'

import InfoCard from './InfoCard'
import DeviceCard from './DeviceCard'

import { command } from '../../lib/command'
// import css  from  '../../../assets/css/login'

const colorArray = [ indigo900, cyan900, teal900, lightGreen900, lime900, yellow900 ]

class Login extends React.Component {

  constructor(props) {

    const duration = 0.4

    super(props)

    this.state = {
      selectIndex: -1,
      expanded: false,
      deviceName: null,
      dim: false
    }

    debug('this.state',this.state)

    this.selectNextDevice = () => {

      let { devices } = this.props
      let { selectIndex } = this.state
      let index

      if (devices.length === 0)
        index = -1
      else if (selectIndex === -1)
        index = 0
      else if (selectIndex >= devices.length - 2)
        index = devices.length - 1
      else
        index = selectIndex + 1

      if (index === selectIndex) return

      let nextState = Object.assign({}, this.state, { selectIndex: index, expanded: false })
      this.setState(nextState)

      debug('select next device', selectIndex, index)
    }

    this.selectPrevDevice = () => {

      let { devices } = this.props
      let { selectIndex } = this.state
      let index

      if (devices.length === 0)
        index = -1
      else if (selectIndex <= 1)
        index = 0
      else
        index = selectIndex - 1

      if (index === selectIndex) return

      let nextState = Object.assign({}, this.state, { selectIndex: index, expanded: false })
      this.setState(nextState)

      debug('select prev device', selectIndex, index)
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

    this.toggleDim = () => this.setState(state => ({ dim: !state.dim }))
  }

  componentWillReceiveProps(nextProps) {

    let curr = this.props.devices
    let next = nextProps.devices

    if (curr.length === 0 && next.length > 0) {
      this.setState({ selectIndex: 0 })
    }
    else if (curr.length > 0 && next.length === 0) {
      this.setState({ selectIndex: -1 })
    }
  }

	renderCard () {

		let props = {
			style: { position: 'absolute', width: '100%', height:'100%'},
			onWillEnter: this.cardWillEnter,
			onWillLeave: this.cardWillLeave
		}

		if (this.props.devices.length === 0){
			Object.assign(props,{
				key: 'init-scanning-device',
				text: '正在搜索网络上的WISNUC OS设备'
			})
			return  props
		}
		else{

			let device = this.props.devices[this.state.selectIndex]
      Object.assign(props, {

        key: `login-device-card-${this.state.selectIndex}`,

        device: this.props.devices.find(dev => dev.address === device.address),

        backgroundColor: colorArray[this.state.selectIndex % colorArray.length],

        onNavPrev: this.state.selectIndex === 0 ? null : this.navPrev,
        onNavNext: this.state.selectIndex === this.props.devices.length - 1 ? null : this.navNext,

        onResize: resize => {
          if ((resize === 'HEXPAND' && !this.state.expanded) || (resize === 'HSHRINK' && this.state.expanded))
            this.setState({ expanded: !this.state.expanded })
        },

        toggleDim: this.toggleDim
      })

			return props
		}
	}

	renderFooter() {

    if (this.state.boot === null || this.state.storage === null || this.state.users === null) {
      return (
        <div style={{width: '100%',height: 68,display: 'flex', alignItems: 'center', boxSizing: 'border-box',flexWrap: 'wrap'}}>
          <div style={{height: 4,width: 480}}><LinearProgress mode="indeterminate" /></div>
          <div style={{width: '100%', height: 64, backgroundColor: '#FFF',
            display: 'flex', alignItems: 'center', boxSizing: 'border-box', paddingLeft: 24}}>
            通讯中....
          </div>
        </div>
      )
    }

    if (this.state.boot instanceof Error || this.state.storage instanceof Error) {
      return (
        <div style={{width: '100%', height: 64, backgroundColor: '#FFF', display: 'flex', alignItems: 'center', boxSizing: 'border-box', paddingLeft: 24}}>
          无法与该设备通讯，它可能刚刚离线或正在启动。
        </div>
      )
    }
    // not both boot and storage are OK

    // if we have user array (not error)
    if (this.state.users && Array.isArray(this.state.users)) {
      if (this.state.users.length !== 0)
        return (
          <UserBox
            style={{width: '100%', transition: 'all 300ms', position:'relative'}}
            color={this.props.backgroundColor}
            users={this.state.users}
            onResize={this.onBoxResize}
            toggleDim={this.props.toggleDim}
            requestToken={this.requestToken}
          />
        )
			}
      else{
        //return (
        text = '系统不存在用户，请进入维护模式'

        return <MaintBox text={text} onMaintain={this.maintain} />
      }
   // now boot and storage ready, users should be error


    // if boot state is normal or alternative and users is ERROR, this is undefined case, should display errorbox
    if ((this.state.boot.state === 'normal' || this.state.boot.state === 'alternative') && this.state.users instanceof Error)
      return (
        <ErrorBox
          text='系统启动但应用服务无法连接，请重启服务器。'
          error={JSON.stringify({
            boot: this.state.boot,
            storage: this.state.storage,
            users: this.state.users
          }, null, '  ')}
        />
      )

    // now boot state should not be normal or alternative, must be maintenance, assert it!
    if (this.state.boot.state !== 'maintenance') {
      setTimeout(() => {
        throw new Error('Undefined State: boot state is not maintenance')
      }, 5000)
      return
    }

    let text = '系统未能启动上次使用的wisnuc应用'
    if (this.state.boot.lastFileSystem) {

      if (this.state.boot.bootMode === 'maintenance')
        text = '用户指定启动至维护模式'

      return <MaintBox text={text} onMaintain={this.maintain} />
    }

    // now this.state.boot.lastFileSystem is null
    // 1. if there is suspicious wisnuc, select maintenance
    let storage = this.state.storage
    let fileSystems = [...storage.volumes, ...storage.blocks.filter(blk => !blk.isVolumeDevice && blk.isFileSystem)]

    let suspicious = fileSystems
                      .filter(f => !!f.wisnuc)
                      .find(f => f.wisnuc === 'ERROR' || !f.wisnuc.intact)

    if (suspicious)
      return <MaintBox text={text} onMaintain={this.maintain} />

    // if (storage.volumes.find(v => v.isMissing))
    if (storage.volumes.length > 0)
      return <MaintBox text={text} onMaintain={this.maintain} />

    return (
      <GuideBox
        address={this.props.device.address}
        storage={this.state.storage}
        onResize={this.onBoxResize}
        onReset={this.reset}
        onMaintain={this.maintain}
      />
    )

    // there are following possibilities:
    // 1. user forced boot to maintenance mode.
    //    actions depends on system state, including:
    //    a) select one bootable system to boot, if any
    //    b) select one file system and re-init (delete old one)
    //    c) rebuild a file system to install new one
    //
    // 2. the lfs exists but not bootable, either volume missing, or fruitmix deleted.
    //    a) fix
    //    b) reinstall wisnuc
    //    c) rebuild a file system to install new one
    //
    // 3. no bootable file system
    //    a) reinstall or rebuild
    // 4. more than one bootable file system
    //    a) select one file system and boot
    //    b) reinstall or rebuild
  }



  render() {
    return (
      <div style={{ width: '100%', height: '100%', display:'flex', flexDirection: 'column', alignItems: 'center' }} >
        <img
          style={{
            width: '110%',
            top: '-5%',
            position: 'absolute',
            zIndex: -1000,
          }}
          src='../src/assets/images/index/index.jpg'
        />
        <div style={{width: '100%', height: '100%', top: 0, position: 'absolute', backgroundColor: '#000', zIndex: -999, opacity: this.state.dim ? 0.7 : 0, transition: 'opacity 300ms'}} />
        <div style={{
          marginTop: 160,
          width: this.state.expanded ? 1024 : 448,
          backgroundColor: '#BBB',
          transition: 'width 300ms'
        }}>
          <div style={{width: '100%', position: 'relative', perspective: 1000}}>
            <TransitionGroup>
              { this.props.devices.length === 0 
                  ? <InfoCard {...this.renderCard()}/> 
                  : <DeviceCard {...this.renderCard()}/> }
            </TransitionGroup>
          </div>
        </div>
      </div>
    )
  }
}

export default Login

