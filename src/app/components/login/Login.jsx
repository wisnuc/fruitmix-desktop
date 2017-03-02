/**
 * @component Index
 * @description 首页组件
 * @time 2016-10-23
 * @author liuhua
**/

import { ipcRenderer } from 'electron'
import { TweenMax } from 'gsap'
import Debug from 'debug'
const debug = Debug('component:Login')

import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import TransitionGroup from 'react-addons-transition-group'

import { TextField } from 'material-ui'
import FlatButton from '../common/FlatButton'
import { indigo900, cyan500, cyan900, teal900, lightGreen900, lime900, yellow900 } from 'material-ui/styles/colors'
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
      devices: [],
      selectedDeviceIndex: -1,
      expanded: false,
      deviceName: null,
      dim: false
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

    this.toggleDim = () => this.setState(state => ({ dim: !state.dim }))
  }

  componentWillUnmount() {
    clearInterval(this.initTimer)
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

        backgroundColor: colorArray[this.state.selectedDeviceIndex % colorArray.length],

        onNavPrev: this.state.selectedDeviceIndex === 0 ? null : this.navPrev,
        onNavNext: this.state.selectedDeviceIndex === this.state.devices.length - 1 ? null : this.navNext,

        onResize: resize => {
          if ((resize === 'HEXPAND' && !this.state.expanded) || (resize === 'HSHRINK' && this.state.expanded))
            this.setState({ expanded: !this.state.expanded })
        },

        toggleDim: this.toggleDim
      })
    }

    return (
      <div style={{ width: '100%', height: '100%', display:'flex', flexDirection: 'column', alignItems: 'center' }} >
        <img 
          style={{
            width: '110%',
            top: '-5%',
            position: 'absolute',
            zIndex: -1000,
            filter: 'blur(5px)',
            transition: 'filter 300ms linear'
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
              { React.createElement(type, props) }
            </TransitionGroup>
          </div>
        </div>
      </div>
    )
  }
}

export default Login

