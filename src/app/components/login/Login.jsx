import Debug from 'debug'
const debug = Debug('component:Login')

import React, { Component, PureComponent, PropTypes } from 'react'
import { indigo900, cyan500, cyan900, teal900, lightGreen900, lime900, yellow900 
} from 'material-ui/styles/colors'
import { FlatButton, CircularProgress } from 'material-ui'

import CrossNav from './CrossNav'
import InfoCard from './InfoCard'
import DeviceCard from './DeviceCard'
import ErrorBox from './ErrorBox' 
import GuideBox from './GuideBox'

import { command } from '../../lib/command'

const colorArray = [indigo900, cyan900, teal900, lightGreen900, lime900, yellow900]

// props.overly: dim, white, or whatever
class Background extends PureComponent {

  render() {
    return (
      <div style={{position: 'absolute', width: '100%', height: '100%'}}> 
        <img style={{ position: 'absolute', width: '100%', height: '100%', 
          zIndex: -1000 }} src='../src/assets/images/index/index.jpg' />
        <div style={{ position: 'absolute', width: '100%', height: '100%', 

          backgroundColor: this.props.overlay === 'white'
            ? 'rgba(255,255,255,1)' 
            : this.props.overlay === 'dim'
              ? 'rgba(0,0,0,0.7)'
              : 'rgba(0,0,0,0)',

          zIndex: -999, transition: 'backgroundColor 300ms'
        }}/>
      </div>
    )
   }
}

// This component is responsible for
// 1. device card navigation
// 2. card animation
// 3. background dim
// 4. card color
class Login extends React.Component {

  constructor(props) {
    super(props)
    this.state = { enter: 'bottom', dim: false }

    this.navPrevBound = this.navPrev.bind(this)
    this.navNextBound = this.navNext.bind(this)
    this.dimBound = this.toggleDim.bind(this)
  }

  toggleDim() {
    this.setState({ dim: !this.state.dim })
  }

  navPrev() {
    let { mdns, selectedDevice, selectDevice } = this.props
    let index = mdns.findIndex(mdev => mdev === selectedDevice.mdev)
    if (index <= 0) return
    this.props.selectDevice(mdns[index - 1])
  }

  navNext() {
    let { mdns, selectedDevice, selectDevice } = this.props
    let index = mdns.findIndex(mdev => mdev === selectedDevice.mdev)
    if (index >= mdns.length - 1) return
    selectDevice(mdns[index + 1])
  }

  isFirst() {
    let { mdns, selectedDevice } = this.props
    return mdns[0] === selectedDevice.mdev
  }

  isLast() {
    let { mdns, selectedDevice } = this.props
    return mdns[mdns.length - 1] === selectedDevice.mdev
  }

  // card change detection is implemented here to conform to 
  // `stateless` and `unidirection dataflow`
  componentWillReceiveProps(nextProps) {
      
    let currProps = this.props

    // device card enter from bottom
    if (!currProps.selectedDevice && nextProps.selectedDevice)
      this.setState({ enter: 'bottom' })

    // device card leave from top
    else if (currProps.selectedDevice && !nextProps.selectedDevice)
      this.setState({ enter: 'top' })

    // device card change
    else if (currProps.selectedDevice && nextProps.selectedDevice) {

      if (currProps.selectedDevice.mdev === nextProps.selectedDevice.mdev) return

      let currIndex = this.props.mdns.findIndex(mdev => mdev === this.props.selectedDevice.mdev)
      let nextIndex = nextProps.mdns.findIndex(mdev => mdev === nextProps.selectedDevice.mdev)

      this.setState({ enter: nextIndex >= currIndex ? 'right' : 'left' })
    }

    // don't know final sequence TODO
    else {
      this.setState({ enter: 'bottom' })
    }
  }

  deviceFooter() {

    let status = this.props.selectedDevice.status()

    console.log('Login, deviceFooter, status', status)

    let pullError = () => {
      let { boot, storage, users } = this.props.selectedDevice
      let obj = {
        boot: boot.isFulfilled() ? boot.value() : boot.reason(),
        storage: storage.isFulfilled() ? storage.value() : storage.reason(),
        users: users.isFulfilled() ? users.value() : users.reason()
      }
      return JSON.stringify(obj, null, '  ')
    }

    if (Array.isArray(status)) {
      if (status.length > 0)
        return (
          <UserBox
            style={{width: '100%', transition: 'all 300ms', position:'relative'}}
            color={this.props.backgroundColor}
            device={this.props.device}
            users={this.state.users}
            onResize={this.onBoxResize}
            toggleDim={this.props.toggleDim}
            requestToken={this.requestToken}
          />
        )
      else 
        return null // TODO FirstUserBox
    }

    if (status === 'unintialized')
      return <GuideBox />

    let text, busy, maint, error
    switch (status) {
    case 'probing':
      text = '通讯中....' 
      busy = true
      break
    case 'systemError':
      text = '系统错误：无法与该设备通讯，它可能刚刚离线或正在启动'
      error = pullError()
      break
    case 'fruitmixError':
      text = '应用错误：系统启动但应用服务无法连接'
      error = pullError() 
      break
    case 'userMaint':
      text = '用户指定进入维护模式'
      maint = true
      break
    case 'failLast':
      text = '启动错误：未能启动上次使用的系统'
      maint = true
      break
    case 'failMulti':
      text = '启动错误：存在多个可用系统'
      maint = true
      break
    case 'failNoAlt':
      text = '启动错误：未能发现可用系统'
      maint = true
      break
    case 'unknownMaint':
    default:
      text = '未知错误'
      maint = true
      break
    }

    const boxStyle = {
      width: '100%', height: 64, backgroundColor: '#FAFAFA',
      display:'flex', alignItems: 'center', justifyContent: 'space-between',
      boxSizing: 'border-box', paddingLeft: 24, paddingRight: 24
    }

    if (busy) 
      return (
        <div style={Object.assign({}, boxStyle, { 
          paddingLeft: 16, justifyContent: 'start' 
        })}>
          <CircularProgress style={{ flexBasis: 32 }} size={28} />
          <div style={{ flexBasis: 16 }} />
          <div>{text}</div>
        </div>
      )
    else if (maint) 
      return (
        <div style={boxStyle}>
          <div>{text}</div>
          <FlatButton label='维护模式' onTouchTap={this.props.onMaintain} />
        </div>
      )
    else if (error) 
      return <ErrorBox style={boxStyle} text={text} error={error} /> 
    else // idle
      return <div style={boxStyle} /> 
  }

  render() {

    let { mdns, selectedDevice } = this.props

    if (selectedDevice) {
      console.log('====')
      console.log(selectedDevice.boot)
      console.log(selectedDevice.storage)
      console.log(selectedDevice.users)
      console.log('====')
    }

    let cardProps
    if (selectedDevice === null) {
      cardProps = {
        key: 'info-card',
        text: '正在搜索网络上的WISNUC OS设备' 
      }
    }
    else {
      cardProps = {
        key: `device-card-${selectedDevice.mdev.name}`,
        device: selectedDevice.mdev,
        selectedDevice,
        backgroundColor: colorArray[1],
        onNavPrev: (!selectedDevice || this.isFirst()) ? null : this.navPrevBound,
        onNavNext: (!selectedDevice || this.isLast()) ? null : this.navNextBound,
        toggleDim: this.dimBound,
      }
    }

    return (
      <div style={{width: '100%', height: '100%'}}>
        <Background overlay={this.state.dim ? 'dim' : 'none'} />
        <div style={{width: '100%', height: '100%', 
          display:'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{flexBasis: '160px'}} />
          <CrossNav duration={0.35} enter={this.state.enter}>
            { selectedDevice === null
              ? <InfoCard {...cardProps} />
              : <DeviceCard {...cardProps}>{this.deviceFooter()}</DeviceCard> }
          </CrossNav>
        </div>
      </div>
    )
  }
}

export default Login

