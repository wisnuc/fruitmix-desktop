import Debug from 'debug'
import React, { Component, PureComponent } from 'react'
import ReactDOM from 'react-dom'
import { FlatButton, CircularProgress, Divider, IconButton, TextField } from 'material-ui'
import { indigo900, cyan500, cyan900, teal900, lightGreen900, lime900, yellow900, teal500
} from 'material-ui/styles/colors'
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh'

import CrossNav from './CrossNav'
import UserBox from './UserBox'
import ErrorBox from './ErrorBox'
import DeviceInfo from './ModelNameCard'
import InitWizard from './InitWizard'
import MaintGuide from './MaintGuide'
import NoDevice from './NoDevice'
import UsernamePassword from './UsernamePassword'

import PureDialog from '../common/PureDialog'
import WeChatBind from '../control/WeChatBind'

const debug = Debug('component:Login')
const colorArray = [indigo900, cyan900, teal900, lightGreen900, lime900, yellow900]
const duration = 300

const StateUp = base => class extends base {
  setSubState(name, nextSubState) {
    const state = this.props.state || this.state
    const subState = state[name]
    const nextSubStateMerged = Object.assign(new subState.constructor(), subState, nextSubState)
    const nextState = { [name]: nextSubStateMerged }
    this.props.setState
      ? this.props.setState(nextState)
      : this.setState(nextState)
  }

  setSubStateBound(name) {
    const obj = this.setSubStateBoundObj || (this.setSubStateBoundObj = {})
    return obj[name] ? obj[name] : (obj[name] = this.setSubState.bind(this, name))
  }

  bindVState(name) {
    return {
      state: this.props.state ? this.props.state[name] : this.state[name],
      setState: this.setSubStateBound(name)
    }
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
class Login extends StateUp(React.Component) {
  constructor(props) {
    super(props)

    this.state = {
      enterUserpass: false,
      maint: false,
      hello: true,
      enter: 'bottom',
      expanded: false,
      vexpand: false,
      hexpand: false,
      compact: false,
      dim: false,

      pin: '', // initWizard, pin child UI view, prevent auto dispatch, see footer

      bye: false,
      byebye: false,

      userpass: new UsernamePassword.State()
    }

    this.navPrevBound = this.navPrev.bind(this)
    this.navNextBound = this.navNext.bind(this)

    this.toggleExpanded = (pure) => {
      this.toggleExpandedAsync(pure).asCallback()
    }

    this.toggleMaint = () => {
      debug('this.toggleMaint！')
      clearTimeout(this.timeMaint)
      if (this.state.maint) {
        this.timeMaint = setTimeout(this.toggleDisplay, duration)
        this.setState({ maint: false })
      } else {
        this.timeMaint = setTimeout(() => this.setState({ maint: true }), duration)
        this.toggleDisplay()
      }
    }

    this.initWizardOnCancelBound = this.initWizardOnCancel.bind(this)
    this.initWizardOnFailBound = this.initWizardOnFail.bind(this)
    this.initWizardOnOKBound = this.initWizardOnOK.bind(this)

    /* refresh mdns */
    this.refresh = () => {
      this.setState({
        enterUserpass: false,
        expanded: false,
        vexpand: false,
        hexpand: false,
        compact: false,
        dim: false,
        maint: false,
        refresh: true,
        pin: ''
      })

      this.props.nav('login')
      clearTimeout(this.refreshHandle)
      this.refreshHandle = setTimeout(() => this.setState({ refresh: false }), 1000)

      debug('this.refresh...')
    }

    /* toggle dialog of add FirstUser  */
    this.toggleFirstUser = () => {
      clearTimeout(this.timeEnterUserpass)
      if (this.state.enterUserpass) {
        this.timeEnterUserpass = setTimeout(this.toggleDisplay, duration)
        this.setState({ enterUserpass: false })
      } else {
        this.timeEnterUserpass = setTimeout(() => this.setState({ enterUserpass: true }), duration)
        this.toggleDisplay()
      }
    }

    /* add First User */
    this.addFirstUser = () => {
      debug('this.addFirstUser', this.state.userpass, this.props)
      const { username, password } = this.state.userpass
      this.props.selectedDevice.addFirstUser({ username, password })
      this.toggleFirstUser()
    }

    /* change style of device info card */
    this.toggleDisplay = (done) => {
      this.setState({ compact: !this.state.compact, dim: !this.state.dim })
      if (done) setTimeout(() => done(), duration)
    }

    /* open bind wechat dialog */
    this.bindWechat = () => {
      this.setState({ weChat: true })
    }

    this.bindWechatSuccess = () => {
      this.setState({ weChatStatus: 'success' })
    }
  }


  async toggleExpandedAsync(pure) {
    const { vexpand, hexpand, expanded } = this.state
    if (vexpand !== hexpand || hexpand !== expanded) return

    debug('toggleExpandedAsync', this.state)

    /* if pure === true, just change expand */
    if (!expanded) {
      if (pure) {
        this.setState({ vexpand: true })
      } else {
        this.setState({ vexpand: true, compact: true, dim: true })
      }
      await Promise.delay(duration)
      this.setState({ hexpand: true })
      await Promise.delay(duration)
      debug('toggleExpandedAsync expand', this.state)
      this.setState({ expanded: true, pin: this.state.maint ? 'maintenance' : 'initWizard' })
    } else {
      this.setState({ vexpand: false })
      await Promise.delay(duration)
      this.setState({ hexpand: false })
      await Promise.delay(duration)
      if (pure) {
        this.setState({ expanded: false, pin: undefined })
      } else {
        this.setState({ expanded: false, compact: false, dim: false, pin: undefined })
      }
      await Promise.delay(duration)
    }
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
    if (!currProps.selectedDevice.mdev.address && nextProps.selectedDevice.mdev.address) this.setState({ enter: 'bottom' })

    // device card leave from top
    else if (currProps.selectedDevice.mdev.address && !nextProps.selectedDevice.mdev.address) this.setState({ enter: 'top' })

    // device card change
    else if (currProps.selectedDevice && nextProps.selectedDevice) {
      if (currProps.selectedDevice.mdev === nextProps.selectedDevice.mdev) return

      const currIndex = this.props.mdns.findIndex(mdev => mdev === this.props.selectedDevice.mdev)
      const nextIndex = nextProps.mdns.findIndex(mdev => mdev === nextProps.selectedDevice.mdev)

      this.setState({ enter: nextIndex >= currIndex ? 'right' : 'left' })
    }

    // don't know final sequence TODO
    else {
      this.setState({ enter: 'bottom' })
    }
  }

  componentDidMount() {
    setTimeout(() => this.setState({ hello: false }), 300)
  }

  initWizardOnCancel() {
    this.toggleExpandedAsync().asCallback()
  }

  initWizardOnFail() {
    this.toggleExpandedAsync().asCallback()
    setTimeout(() => this.refresh(), 600)
  }

  initWizardOnOK() {
    const view = 'LOGIN'
    debug('this.props.selectedDevice', this.props.selectedDevice)
    const device = this.props.selectedDevice
    const user = device.users.value()[0]
    this.done(view, device, user)
  }


  async doneAsync(view, device, user) {
    this.setState({ bye: true, dim: false, enter: 'bottom' })
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

  renderFooter() {
    const pullError = () => {
      const { boot, storage, users } = this.props.selectedDevice
      const obj = {
        boot: boot.isFulfilled() ? boot.value() : boot.reason(),
        storage: storage.isFulfilled() ? storage.value() : storage.reason(),
        users: users.isFulfilled() ? users.value() : users.reason()
      }
      return obj
      // return JSON.stringify(obj, null, '  ')
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
    // debug('footer', status, this.props.selectedDevice, this.state)

    if (this.state.pin === 'initWizard' || status === 'uninitialized') {
      const { hexpand, vexpand, expanded } = this.state

      if (hexpand === vexpand && vexpand === expanded) {
        if (expanded) {
          return (
            <InitWizard
              device={this.props.selectedDevice}
              bindWechat={this.bindWechat}
              weChatStatus={this.state.weChatStatus}
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
            <FlatButton label="初始化" onTouchTap={() => this.toggleExpanded()} />
          </div>
        )
      }
      return null
    }


    let text
    let busy
    let maint
    let error
    let uninit

    switch (status) {
      case 'ready': // users.length === 0 need to add FirstUser Box TODO
        break
      case 'noUser':
        text = '系统错误：未发现用户'
        break
      case 'probing':
        text = '通讯中....'
        busy = true
        break
      case 'systemError':
        text = '系统错误：无法与该设备通讯'
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

    if (maint || this.state.pin === 'maintenance') {
      const { hexpand, vexpand, expanded } = this.state

      if (this.state.maint) {
        // debug('LocalLogin props', this.props)
        return (
          <MaintGuide
            toggleMaint={this.toggleMaint}
            toggleExpanded={this.toggleExpanded}
            device={this.props.selectedDevice}
            refresh={this.refresh}
            OKAndLogin={this.initWizardOnOKBound}
            enterMaint={() => this.done('maintenance')}
            bindWechat={this.bindWechat}
            weChatStatus={this.state.weChatStatus}
          />
        )
      }

      if (hexpand === vexpand && vexpand === expanded) {
        return (
          <div style={boxStyle}>
            <div>{text}</div>
            <FlatButton label="维护模式" onTouchTap={this.toggleMaint} />
          </div>
        )
      }

      return null
    } else if (status === 'ready') {
      const users = this.props.selectedDevice.users.value()

      if (users.length > 0) {
        return (
          <UserBox
            device={this.props.selectedDevice}
            toggleDisplay={this.toggleDisplay}
            done={this.done.bind(this)}
          />
        )
      }
    } else if (busy) {
      return (
        <div style={Object.assign({}, boxStyle, { paddingLeft: 16, justifyContent: 'start' })}>
          <CircularProgress style={{ flexBasis: 32 }} size={28} />
          <div style={{ flexBasis: 16 }} />
          <div>{text}</div>
        </div>
      )
    } else if (status === 'noUser') {
      if (!this.state.compact) {
        return (
          <div style={boxStyle}>
            <div>{text}</div>
            <FlatButton label="创建用户" onTouchTap={this.toggleFirstUser} />
          </div>
        )
      }
      return (
        <div
          style={{
            padding: '0px 24px 0px 24px',
            height: this.state.enterUserpass ? '' : 0,
            boxSizing: 'border-box',
            transition: `all ${duration}ms`,
            overflow: 'hidden'
          }}
        >
          <div style={{ height: 24 }} />
          <div style={{ fontSize: 16, lineHeight: '24px', color: 'rgba(0,0,0,0.87)' }}>
              请输入第一个用户的用户名和密码
          </div>
          <div style={{ fontSize: 14, lineHeight: '20px', color: 'rgba(0,0,0,0.54)' }}>
              该用户会成为系统权限最高的管理员
          </div>
          <div style={{ height: 16 }} />
          <UsernamePassword {...this.bindVState('userpass')} />
          <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -16 }}>
            <FlatButton label="取消" onTouchTap={this.toggleFirstUser} primary />
            <FlatButton label="确认" disabled={!this.state.userpass.isInputOK()} onTouchTap={this.addFirstUser} primary />
          </div>
        </div>
      )
    } else if (error) {
      return <ErrorBox style={boxStyle} text={text} error={error} />
    }

    return <div style={boxStyle} />
  }

  render() {
    const { mdns, selectedDevice } = this.props
    // debug('Local Login render', this.props)

    let cardProps
    let displayProps
    let cardInnerStyle

    if (selectedDevice === null || (selectedDevice && !selectedDevice.mdev.address)) {
      cardProps = {
        key: 'info-card',
        text: '正在搜索网络上的WISNUC OS设备'
      }
    } else {
      cardProps = { key: `device-card-${selectedDevice.mdev.name}` }
      displayProps = {
        toggle: this.state.compact,
        device: selectedDevice.mdev,
        name: selectedDevice.info && selectedDevice.info.data && selectedDevice.info.data.name,
        ws215i: selectedDevice.device && selectedDevice.device.data && !!selectedDevice.device.data.ws215i,
        backgroundColor: '#FAFAFA',
        onNavPrev: (!selectedDevice || (selectedDevice && !selectedDevice.mdev.address) || this.isFirst()) ? null : this.navPrevBound,
        onNavNext: (!selectedDevice || (selectedDevice && !selectedDevice.mdev.address) || this.isLast()) ? null : this.navNextBound
      }

      cardInnerStyle = {
        backgroundColor: '#FAFAFA',
        width: this.state.hexpand ? 1152 : '100%',
        marginTop: this.state.hexpand ? -88 : '',
        transition: `all ${duration}ms`
      }
    }

    return (
      <div style={{ zIndex: 100 }}>
        {
          this.state.hexpand &&
          <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.27)', top: 0, left: 0 }} />
        }
        {
          mdns.length > 0 || this.state.refresh || this.state.hello
            ? <div style={{ width: 380, height: 540, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CrossNav duration={0.35} enter={this.state.enter}>
                {
                  (this.state.bye || this.state.hello)
                  ? <DeviceCard />
                  : selectedDevice === null || (selectedDevice && !selectedDevice.mdev.address)
                  ? <DeviceCard {...cardProps}>
                    <div style={{ width: 380, height: 540, backgroundColor: '#FAFAFA' }}>
                      <div style={{ height: 72, backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center' }} >
                        <div style={{ marginLeft: 24 }} >
                          { '局域网登录' }
                        </div>
                      </div>
                      <Divider />

                      {/* content */}
                      <div style={{ height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
                        <CircularProgress size={64} thickness={5} />
                      </div>
                      <div style={{ height: 36 }} />
                      <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.87)', fontSize: 20, height: 36 }}>
                        { '搜索设备中...' }
                      </div>
                    </div>
                  </DeviceCard>
                  : <DeviceCard {...cardProps}>
                    <div style={cardInnerStyle}>
                      { !this.state.compact &&
                      <div style={{ height: 72, backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center' }} >
                        <div style={{ marginLeft: 24 }}>
                          { '局域网登录' }
                        </div>
                        <div style={{ flexGrow: 1 }} />
                        <div style={{ width: 56 }}>
                          <IconButton onTouchTap={this.refresh} >
                            <RefreshIcon />
                          </IconButton>
                        </div>
                      </div>
                      }
                      <DeviceInfo {...displayProps} />
                      <Divider />
                      { this.renderFooter() }
                    </div>
                  </DeviceCard>
                }
              </CrossNav>
            </div>
            : <div style={{ width: 380, height: 540, backgroundColor: '#FAFAFA' }}>
              <div style={{ height: 72, backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center' }} >
                <div style={{ marginLeft: 24 }} >
                  { '局域网登录' }
                </div>
              </div>
              <Divider />

              <div style={{ height: 8 }} />
              {/* content */}
              <div style={{ marginLeft: 24 }} >
                <NoDevice
                  refresh={this.refresh}
                />
              </div>

              {/* button */}
              <div style={{ height: 128 }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginRight: 8 }}>
                <FlatButton
                  label="刷新"
                  labelStyle={{ color: '#424242', fontWeight: 500 }}
                  onTouchTap={this.refresh}
                />
              </div>
            </div>
        }
        {/* wechat bind */}

        <PureDialog open={!!this.state.weChat} onRequestClose={() => this.setState({ weChat: false })}>
          {
            this.state.weChat &&
            <WeChatBind
              onRequestClose={() => this.setState({ weChat: false })}
              primaryColor={teal500}
              account={selectedDevice.firstUser && selectedDevice.firstUser.data}
              apis={{ pureRequest: selectedDevice.pureRequest }}
              ipcRenderer={this.props.ipcRenderer}
              success={this.bindWechatSuccess}
            />
          }
        </PureDialog>
      </div>
    )
  }
}

export default Login
