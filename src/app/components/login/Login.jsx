import Debug from 'debug'
const debug = Debug('component:Login')

import React, { Component, PureComponent, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { 
  indigo900, cyan500, cyan900, teal900, lightGreen900, lime900, yellow900 
} from 'material-ui/styles/colors'

import { FlatButton, CircularProgress } from 'material-ui'

import CrossNav from './CrossNav'
import InfoCard from './InfoCard'
import UserBox from './UserBox'
import ErrorBox from './ErrorBox' 
import GuideBox from './GuideBox'
import CardDisplay from './ModelNameCard'
import InitWizard from './InitStep'

import { command } from '../../lib/command'

const colorArray = [indigo900, cyan900, teal900, lightGreen900, lime900, yellow900]

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

// pure animation frame !
class DeviceCard extends PureComponent {

  componentWillEnter(callback) {
    this.props.onWillEnter(ReactDOM.findDOMNode(this), callback)
  }

  componentWillLeave(callback) {
    this.props.onWillLeave(ReactDOM.findDOMNode(this), callback)
  }

  render() {
    return (
      <div style={this.props.style}>
        { this.props.children }
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

    this.state = { 
      enter: 'bottom', 
      expanded: false,
      vexpand: false,
      hexpand: false,
      compact: false,
      dim: false,

      pin: null, // pin child UI view, prevent auto dispatch, see footer
    }

    this.navPrevBound = this.navPrev.bind(this)
    this.navNextBound = this.navNext.bind(this)

    this.toggleDisplayBound = this.toggleDisplay.bind(this)
    this.toggleExpandedBound = this.toggleExpanded.bind(this)
  }

  toggleDisplay(done) {
    this.setState({ compact: !this.state.compact, dim: !this.state.dim }) 
    if (done) setTimeout(() => done(), 300) 
  }

  async toggleExpandedAsync() {

    let { vexpand, hexpand, expanded } = this.state
    if (vexpand !== hexpand || hexpand !== expanded) return

    if (!expanded) {
      this.setState({ vexpand: true, compact: true, dim: true })  
      await Promise.delay(300)
      this.setState({ hexpand: true }) 
      await Promise.delay(300)
      this.setState({ expanded: true, pin: 'initWizard' })
    } 
    else {
      this.setState({ hexpand: false })
      await Promise.delay(300)
      this.setState({ vexpand: false })
      await Promise.delay(300)
      this.setState({ expanded: false, pin: undefined })
    }
  }

  toggleExpanded() {
    this.toggleExpandedAsync().asCallback()
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

  footer() {

    const pullError = () => {
      let { boot, storage, users } = this.props.selectedDevice
      let obj = {
        boot: boot.isFulfilled() ? boot.value() : boot.reason(),
        storage: storage.isFulfilled() ? storage.value() : storage.reason(),
        users: users.isFulfilled() ? users.value() : users.reason()
      }
      return JSON.stringify(obj, null, '  ')
    }

    const boxStyle = {
      width: '100%', height: 64, backgroundColor: '#FAFAFA',
      display:'flex', alignItems: 'center', justifyContent: 'space-between',
      boxSizing: 'border-box', paddingLeft: 24, paddingRight: 24
    }

    ////////////////////////////////////////////////////////////////////////////

    let status = this.props.selectedDevice.systemStatus()

    if (this.state.pin === 'initWizard' || status === 'uninitialized') {
      
      let { hexpand, vexpand, expanded } = this.state

      if (hexpand === vexpand && vexpand === expanded) {
        if (expanded) {
          return (
            <InitWizard 
              device={this.props.selectedDevice}
              showContent={true}
              requestClose={this.toggleExpandedBound}
            />
          )
        }
        else {
          return (
            <div style={boxStyle}>
              <div>该设备尚未初始化</div>
              <FlatButton label='初始化' onTouchTap={this.toggleExpandedBound} />
            </div>
          )
        }
      }
      else 
        return null
    }

    if (status === 'ready') {
      let users = this.props.selectedDevice.users.value()
      if (users.length > 0)
        return (
          <UserBox
            style={{width: '100%', transition: 'all 300ms', position:'relative'}}
            color={this.props.backgroundColor}
            device={this.props.device}
            users={users}
            onResize={this.onBoxResize}
            toggleDim={this.props.toggleDim}
            requestToken={this.requestToken}
            toggleDisplay={this.toggleDisplayBound}
          />
        )
      else 
        return null // TODO FirstUserBox
    }

    let text, busy, maint, error, uninit
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

    if (busy) 
      return (
        <div style={Object.assign({}, boxStyle, { paddingLeft: 16, justifyContent: 'start' })}>
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

    let cardProps, displayProps, cardInnerStyle
    if (selectedDevice === null) {
      cardProps = {
        key: 'info-card',
        text: '正在搜索网络上的WISNUC OS设备' 
      }
    }
    else {

      cardProps = { key: `device-card-${selectedDevice.mdev.name}` }

      displayProps = {

        toggle: this.state.compact,

        device: selectedDevice.mdev,
        backgroundColor: colorArray[1],

        onNavPrev: (!selectedDevice || this.isFirst()) ? null : this.navPrevBound,
        onNavNext: (!selectedDevice || this.isLast()) ? null : this.navNextBound,
      }

      cardInnerStyle = {
        backgroundColor: '#FAFAFA',
        width: this.state.hexpand ? 1152 : '100%', 
        transition: 'width 300ms',
      }
    
      // if (this.state.vexpand) cardInnerStyle.height = 680
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
              : <DeviceCard {...cardProps}>
                  <div style={cardInnerStyle}>
                    <CardDisplay {...displayProps} />
                    {this.footer()}
                  </div>
                </DeviceCard> }
          </CrossNav>

        </div>
      </div>
    )
  }
}

export default Login

