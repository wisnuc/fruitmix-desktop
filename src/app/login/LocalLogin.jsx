import React from 'react'
import Debug from 'debug'
import Radium from 'radium'
import ReactDOM from 'react-dom'
import { CircularProgress, Divider } from 'material-ui'
import { cyan900 } from 'material-ui/styles/colors'

import CrossNav from './CrossNav'
import InfoCard from './InfoCard'
import UserBox from './UserBox'
import ErrorBox from './ErrorBox'
import CardDisplay from './ModelNameCard'
import InitWizard from './InitStep'

import FlatButton from '../common/FlatButton'
import { Computer, Barcelona } from '../common/Svg'

const debug = Debug('component:Login')
const duration = 300

@Radium
class DeviceList extends React.PureComponent {
  render() {
    const { device, primaryColor } = this.props

    return (
      <div
        style={{
          height: 72,
          width: '100%',
          paddingLeft: 24,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          ':hover': { backgroundColor: '#EEEEEE' }
        }}
        onTouchTap={() => this.props.touchTap(device)}
      >
        <div style={{ width: 32 }}>
          {
            device.model === 'ws215i'
            ? <Barcelona color={primaryColor} style={{ width: 32, height: 32 }} />
            : <Computer color={primaryColor} style={{ width: 32, height: 32 }} />
          }
        </div>
        <div style={{ marginLeft: 24 }}>
          <div style={{ color: 'rgba(0,0,0,0.87)', lineHeight: '24px' }}>
            { device.model === 'ws215i' ? 'WISNUC' : '个人计算机' }
          </div>
          <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14, lineHeight: '20px' }}>
            { device.address }
          </div>
        </div>
      </div>
    )
  }
}

// pure animation frame !
class DeviceCard extends React.PureComponent {

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

      index: 0,
      hello: true,
      selected: false,

      enter: 'none',
      expanded: false,
      vexpand: false,
      hexpand: false,
      compact: false,
      dim: false,

      pin: '', // initWizard, pin child UI view, prevent auto dispatch, see footer

      bye: false,
      byebye: false
    }

    this.navPrevBound = this.navPrev.bind(this)
    this.navNextBound = this.navNext.bind(this)

    this.toggleDisplayBound = this.toggleDisplay.bind(this)
    this.toggleExpandedBound = this.toggleExpanded.bind(this)

    this.initWizardOnCancelBound = this.initWizardOnCancel.bind(this)
    this.initWizardOnFailBound = this.initWizardOnFail.bind(this)
    this.initWizardOnOKBound = this.initWizardOnOK.bind(this)

    this.refresh = () => {
      debug('this.refresh')
    }

    this.backToList = () => {
      this.setState({ selected: false })
    }

    this.touchTapDevice = (device) => {
      this.setState({ selected: true })
      this.props.selectDevice(device)
    }
  }

  toggleDisplay(done) {
    this.setState({ compact: !this.state.compact, dim: !this.state.dim })
    if (done) setTimeout(() => done(), duration)
  }

  async toggleExpandedAsync() {
    const { vexpand, hexpand, expanded } = this.state
    if (vexpand !== hexpand || hexpand !== expanded) return

    if (!expanded) {
      this.setState({ vexpand: true, compact: true, dim: true })
      await Promise.delay(duration)
      this.setState({ hexpand: true })
      await Promise.delay(duration)
      this.setState({ expanded: true, pin: 'initWizard' })
    } else {
      this.setState({ vexpand: false })
      await Promise.delay(duration)
      this.setState({ hexpand: false })
      await Promise.delay(duration)
      this.setState({ expanded: false, compact: false, dim: false, pin: undefined })
      await Promise.delay(duration)
    }
  }

  toggleExpanded() {
    this.toggleExpandedAsync().asCallback()
  }

  navPrev() {
    const { mdns, selectedDevice, selectDevice } = this.props
    const index = mdns.findIndex(mdev => mdev === selectedDevice.mdev)
    if (index <= 0) return
    this.props.selectDevice(mdns[index - 1])
  }

  navNext() {
    const { mdns, selectedDevice, selectDevice } = this.props
    const index = mdns.findIndex(mdev => mdev === selectedDevice.mdev)
    if (index >= mdns.length - 1) return
    selectDevice(mdns[index + 1])
  }

  isFirst() {
    const { mdns, selectedDevice } = this.props
    return mdns[0] === selectedDevice.mdev
  }

  isLast() {
    const { mdns, selectedDevice } = this.props
    return mdns[mdns.length - 1] === selectedDevice.mdev
  }

  // card change detection is implemented here to conform to
  // `stateless` and `unidirection dataflow`
  componentWillReceiveProps(nextProps) {
    const currProps = this.props

    // device card enter from bottom
    if (!currProps.selectedDevice && nextProps.selectedDevice) { this.setState({ enter: 'none' }) }

    // device card leave from top
    else if (currProps.selectedDevice && !nextProps.selectedDevice) { this.setState({ enter: 'none' }) }

    // device card change
    else if (currProps.selectedDevice && nextProps.selectedDevice) {
      if (currProps.selectedDevice.mdev === nextProps.selectedDevice.mdev) return

      const currIndex = this.props.mdns.findIndex(mdev => mdev === this.props.selectedDevice.mdev)
      const nextIndex = nextProps.mdns.findIndex(mdev => mdev === nextProps.selectedDevice.mdev)

      this.setState({ enter: nextIndex >= currIndex ? 'right' : 'left' })
    }

    // don't know final sequence TODO
    else {
      this.setState({ enter: 'none' })
    }
  }

  componentDidMount() {
    setTimeout(() => this.setState({ hello: false }), 0)
  }

  initWizardOnCancel() {
    this.toggleExpandedAsync().asCallback()
  }

  initWizardOnFail() {
    // FIXME
    this.toggleExpandedAsync().asCallback()
  }

  async doneAsync(view, device, user) {
    this.setState({ bye: true, dim: false, enter: 'none' })
    await Promise.delay(360)

    this.setState({ byebye: true })
    await Promise.delay(360)

    if (view === 'maintenance') { this.props.maintain() } else {
      this.props.ipcRenderer.send('LOGIN', device, user)
      this.props.login()
    }
  }

  done(view, device, user) {
    this.doneAsync(view, device, user).asCallback()
  }

  initWizardOnOK() {
    const view = 'LOGIN'
    debug('this.props.selectedDevice', this.props.selectedDevice)
    const device = this.props.selectedDevice
    const user = device.users.value()[0]
    this.done(view, device, user)
  }

  footer() {
    const pullError = () => {
      const { boot, storage, users } = this.props.selectedDevice
      const obj = {
        boot: boot.isFulfilled() ? boot.value() : boot.reason(),
        storage: storage.isFulfilled() ? storage.value() : storage.reason(),
        users: users.isFulfilled() ? users.value() : users.reason()
      }
      return JSON.stringify(obj, null, '  ')
    }

    const boxStyle = {
      width: '100%',
      height: 64,
      backgroundColor: '#FAFAFA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      paddingLeft: 24,
      paddingRight: 24
    }

    const status = this.props.selectedDevice.systemStatus()

    if (this.state.pin === 'initWizard' || status === 'uninitialized') {
      const { hexpand, vexpand, expanded } = this.state

      if (hexpand === vexpand && vexpand === expanded) {
        if (expanded) {
          return (
            <InitWizard
              device={this.props.selectedDevice}
              showContent
              onCancel={this.initWizardOnCancelBound}
              onFail={this.initWizardOnFailBound}
              onOK={this.initWizardOnOKBound}
            />
          )
        }

        return (
          <div style={boxStyle}>
            <div>该设备尚未初始化</div>
            <FlatButton label="初始化" onTouchTap={this.toggleExpandedBound} />
          </div>
        )
      }
      return null
    }

    if (status === 'ready') {
      const users = this.props.selectedDevice.users.value()
      const style = { width: '100%', transition: 'all 300ms', position: 'relative' }

      if (users.length > 0) {
        return (
          <UserBox
            style={style}
            device={this.props.selectedDevice}
            toggleDisplay={this.toggleDisplayBound}
            done={this.done.bind(this)}
          />
        )
      }
    }

    let text
    let busy
    let maint
    let error
    let uninit

    switch (status) {
      case 'ready': // users.length === 0 need to add FirstUser Box TODO
        text = '系统错误：未发现用户'
        error = pullError()
        break
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

    if (busy) {
      return (
        <div style={Object.assign({}, boxStyle, { paddingLeft: 16, justifyContent: 'start' })}>
          <CircularProgress style={{ flexBasis: 32 }} size={28} />
          <div style={{ flexBasis: 16 }} />
          <div>{text}</div>
        </div>
      )
    } else if (maint) {
      return (
        <div style={boxStyle}>
          <div>{text}</div>
          <FlatButton label="维护模式" onTouchTap={() => this.done('maintenance')} />
        </div>
      )
    } else if (error) { return <ErrorBox style={boxStyle} text={text} error={error} /> }
    return <div style={boxStyle} />
  }

  renderNoDevice() {
    return (
      <div>
        <div style={{ height: 16 }} />
        <div style={{ fontSize: 16, marginBottom: 12, color: 'rgba(0,0,0,0.87)' }}>
          未发现WISNUC OS设备
        </div>
        <div style={{ fontSize: 14, marginBottom: 12, color: 'rgba(0,0,0,0.54)' }}>
          局域网登录仅支持同一网段的WISNUC设备登录
        </div>
        <div style={{ height: 24 }} />
        <div style={{ fontSize: 16, marginBottom: 12, color: 'rgba(0,0,0,0.87)' }}>
          1. 请确保WISNUC设备电源开启并已连接网络
        </div>
        <div style={{ height: 24 }} />
        <div style={{ fontSize: 16, marginBottom: 12, color: 'rgba(0,0,0,0.87)' }}>
          2. 请尝试微信扫码登录
        </div>
        <div style={{ height: 24 }} />
        <div style={{ fontSize: 16, marginBottom: 12, color: 'rgba(0,0,0,0.87)' }}>
          3. 请刷新再次搜索
        </div>
      </div>
    )
  }

  renderDevice(selectedDevice) {
    if (!selectedDevice) return (<div />)

    const cardProps = { key: `device-card-${selectedDevice.mdev.name}` }

    const displayProps = {
      toggle: this.state.compact,
      device: selectedDevice.mdev,
      ws215i: selectedDevice.device && selectedDevice.device.data && !!selectedDevice.device.data.ws215i,
      backgroundColor: '#006064',
      onNavPrev: (!selectedDevice || this.isFirst()) ? null : this.navPrevBound,
      onNavNext: (!selectedDevice || this.isLast()) ? null : this.navNextBound
    }

    const cardInnerStyle = {
      backgroundColor: '',
      width: this.state.hexpand ? 1152 : '100%',
      transition: `all ${duration}ms`
    }

    return (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column'
        }}
      >
        <CrossNav duration={0.35} enter={this.state.enter}>
          <DeviceCard {...cardProps}>
            <div id="card inner style" style={cardInnerStyle}>
              <CardDisplay {...displayProps} />
              {this.footer()}
            </div>
          </DeviceCard>
        </CrossNav>
      </div>
    )
  }

  render() {
    const { mdns, selectedDevice } = this.props
    debug('mdns, selectedDevice', mdns, selectedDevice)

    return (
      <div
        style={{
          width: this.state.selected ? 448 : 380,
          height: this.state.selected ? 376 : 540,
          backgroundColor: this.state.selected ? '' : '#FAFAFA',
          zIndex: 100,
          transition: `all ${duration}ms`
        }}
      >
        {
          mdns.length > 0 && this.state.selected ? this.renderDevice(selectedDevice)
            : <div>
              <div style={{ height: 8 }} />
              <div
                style={{
                  marginLeft: 24,
                  width: this.state.selected ? 400 : 332,
                  height: this.state.selected ? 316 : 480,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: `all ${duration}ms`
                }}
              >
                <div style={{ fontSize: 16, color: 'rgba(0,0,0,0.87)' }}>
                  { '局域网登录' }
                </div>
                <div style={{ height: 8 }} />
                <Divider />
                <div style={{ height: 8 }} />

                {/* content */}
                {
                  mdns.length > 0
                    ? mdns.map(device => (
                      <DeviceList
                        device={device}
                        primaryColor={this.props.primaryColor}
                        touchTap={this.touchTapDevice}
                      />))
                    : this.renderNoDevice()
                }

                <div style={{ flexGrow: 1 }} />
                <Divider />
              </div>

              {/* button */}
              <div style={{ height: 8 }} />
              <div style={{ display: 'flex' }}>
                <div style={{ flexGrow: 1 }} />
                <FlatButton
                  label={'刷新'}
                  labelStyle={{ color: '#424242', fontWeight: 500 }}
                  onTouchTap={this.refresh}
                />
              </div>
            </div>
        }
      </div>
    )
  }
}

export default Login
