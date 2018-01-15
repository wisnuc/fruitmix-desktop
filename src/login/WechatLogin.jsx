import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import Radium from 'radium'
import { CircularProgress, Divider } from 'material-ui'
import RightIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right'
import CloudDoneIcon from 'material-ui/svg-icons/file/cloud-done'
import CloudOffIcon from 'material-ui/svg-icons/file/cloud-off'
import WifiIcon from 'material-ui/svg-icons/notification/wifi'
import FlatButton from '../common/FlatButton'
import Checkmark from '../common/Checkmark'
import { Barcelona, WISNUC } from '../common/Svg'

const debug = Debug('component:WechatLogin')
const duration = 300

/*
  http://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js
*/

@Radium
class DeviceList extends React.PureComponent {
  render() {
    const { list, primaryColor, select } = this.props
    return (
      <div
        style={{
          height: 72,
          width: '100%',
          paddingLeft: 48,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          ':hover': { backgroundColor: '#EEEEEE' }
        }}
        onTouchTap={() => list.isOnline && select(list)}
      >
        {
          list.LANIP
            ? list.isOnline
            ? <CloudDoneIcon color={primaryColor} />
            : <CloudOffIcon color="rgba(0,0,0,0.54)" />
            : list.isOnline
            ? <WifiIcon color={primaryColor} />
            : <WifiIcon color="rgba(0,0,0,0.54)" />
        }
        <div style={{ marginLeft: 24 }}>
          <div style={{ color: 'rgba(0,0,0,0.87)', lineHeight: '24px' }}>
            { list.name }
          </div>
          <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14, lineHeight: '20px' }}>
            { list.LANIP }
          </div>
        </div>
      </div>
    )
  }
}

class WechatLogin extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      error: '', // '', 'net', 'wisnuc'
      wechatLogin: '', // '', 'progress', 'authorization', 'getingList', 'success', 'lastDevice', 'list', 'fail'
      count: 3,
      lists: []
    }

    this.done = (view, device, user) => {
      this.doneAsync(view, device, user).asCallback()
    }

    this.autologinAsync = async () => {
      const stationID = this.state.lastDevice.id
      const ips = this.state.lastDevice.LANIP
      const stationName = this.state.lastDevice.name

      let lanip = null
      for (let i = 0; i < ips.length; i++) {
        try {
          const res = await this.props.selectedDevice.pureRequestAsync('info', { ip: ips[i] })
          const info = res.body
          if (info && info.id === stationID) {
            lanip = ips[i]
            break
          }
        } catch (e) {
          debug('this.autologinAsync can not connect lanip', ips[i], e)
        }
      }

      // lanip = null // force to connect cloud

      const token = this.state.wxData.token
      const guid = this.state.wxData.user.id

      const res = await this.props.selectedDevice.pureRequestAsync('cloudUsers', { stationID, token })
      const user = res && res.body.data.find(u => u.global && u.global.id === guid)
      if (!user) throw Error('no user')

      if (lanip) {
        debug('this.props.selectedDevice, with lanip', this.props.selectedDevice, '\nlanip', lanip)
        const response = await this.props.selectedDevice.pureRequestAsync('localTokenByCloud', { stationID, token })
        const localToken = response.body
        this.props.selectDevice({ address: lanip, domain: 'local' })
        Object.assign(this.props.selectedDevice, {
          token: {
            isFulfilled: () => true,
            ctx: user,
            data: localToken.data
          },
          mdev: { address: lanip, domain: 'local', stationID, stationName }
        })
        this.props.ipcRenderer.send('UPDATE_USER_CONFIG', user.uuid, { weChat: this.state.wxData.user })
        this.done('LOGIN', this.props.selectedDevice, user)
      } else {
        debug('no available lanip', this.props.selectedDevice)
        Object.assign(this.props.selectedDevice, {
          token: {
            isFulfilled: () => true,
            ctx: user,
            data: { token, stationID }
          },
          mdev: { address: 'http://www.siyouqun.com', domain: 'remote', lanip: ips[0], stationID, stationName }
        })
        this.props.ipcRenderer.send('UPDATE_USER_CONFIG', user.uuid, { weChat: this.state.wxData.user })
        return this.done('LOGIN', this.props.selectedDevice, user)
      }
    }

    this.autologin = () => {
      if (this.out) return
      this.setState({ logining: true })
      this.autologinAsync().catch((e) => {
        debug('this.autologin error', e)
        this.setState({ wechatLogin: 'fail' })
      })
    }

    this.countDown = () => {
      clearInterval(this.interval)
      let count = 3
      this.interval = setInterval(() => {
        if (count > 1) {
          count -= 1
          this.setState({ count: this.state.count -= 1 })
        } else {
          clearInterval(this.interval)
          this.autologin()
        }
      }, 1000)
    }

    this.enterList = () => {
      clearInterval(this.interval)
      this.setState({ wechatLogin: 'list', count: 3, logining: false })
    }

    this.resetWCL = () => {
      this.initWXLogin()
      this.setState({ wechatLogin: '', count: 3, logining: false })
    }

    this.intiWxScript = () => {
      this.wxiframe = null
      this.WxLogin = (a) => {
        let c = 'default'
        a.self_redirect === !0 ? c = 'true' : a.self_redirect === !1 && (c = 'false')
        const d = document.createElement('iframe')
        this.wxiframe = d
        let e = `https://open.weixin.qq.com/connect/qrconnect?appid=${a.appid}&scope=${a.scope}&redirect_uri=${a.redirect_uri}&state=${a.state}&login_type=jssdk&self_redirect=${c}`
        e += a.style ? `&style=${a.style}` : ''
        e += a.href ? `&href=${a.href}` : ''
        d.src = e
        d.frameBorder = '0'
        d.allowTransparency = 'true'
        d.scrolling = 'no'
        d.width = '300px'
        d.height = '400px'
      }
    }

    this.intiWxScript()

    this.initWXLogin = () => {
      this.setState({ wechatLogin: '', error: '' }, () => {
        this.WxLogin({
          id: 'login_container',
          appid: 'wxd7e08af781bea6a2',
          scope: 'snsapi_login',
          redirect_uri: 'http%3A%2F%2Fwxlogin.siyouqun.com',
          state: 'uuid',
          language: 'zh_CN',
          style: '',
          href: ''
        })
        const f = document.getElementById('login_container')
        const d = this.wxiframe

        if (f) f.innerHTML = ''
        if (!window.navigator.onLine) {
          this.setState({ error: 'net' })
        } else {
          d.onload = () => {
            if (!d.contentDocument.head || !d.contentDocument.title) this.setState({ error: 'wisnuc' })
            // else if (this.weChatLoadingRef) this.weChatLoadingRef.style.display = 'none'
          }
          f.appendChild(d)
          if (this.weChatLoadingRef) this.weChatLoadingRef.style.display = 'none'
        }
      })
    }

    this.getStations = (guid, token) => {
      this.props.selectedDevice.pureRequest('getStations', { guid, token }, (err, res) => {
        if (err) {
          debug('this.getStations error', err)
          return this.setState({ wechatLogin: 'fail' })
        }
        debug('this.getStations success', res.body)
        const lists = res.body.data
        const available = lists.filter(l => l.isOnline)
        if (available && available.length) {
          const lastDevice = global.config.global.lastDevice
          const lastAddress = lastDevice && (lastDevice.lanip || lastDevice.address)
          let index = available.findIndex(l => l.LANIP[0] === lastAddress)
          if (index < 0) index = 0
          debug('lastDevice', available[index])
          this.setState({ lists })
          setTimeout(() => this.setState({ wechatLogin: 'success', count: 3 }), 500)
          setTimeout(() => this.setState({ wechatLogin: 'lastDevice', lastDevice: available[index] }, this.countDown), 1000)
        } else return this.setState({ wechatLogin: 'fail' })
      })
    }

    this.getWXCode = (code) => {
      /* init wx_code */
      this.wxiframe.contentWindow.wx_code = null

      /* clear countDown time */
      clearInterval(this.interval)

      this.setState({ wechatLogin: 'authorization' })
      this.props.selectedDevice.pureRequest('getWechatToken', { code }, (err, res) => {
        if (err) {
          debug('this.getWXCode', code, err)
          this.setState({ wechatLogin: 'fail' })
        } else {
          debug('got token!!', res.body)
          if (res.body && res.body.data) {
            this.setState({ wxData: res.body.data, wechatLogin: 'getingList' })
            this.getStations(res.body.data.user.id, res.body.data.token)
          } else {
            debug('no wechat Data')
            this.setState({ wechatLogin: 'fail' })
          }
        }
      })
    }

    this.select = (list) => {
      debug('this.select', list)
      this.setState({ wechatLogin: 'lastDevice', lastDevice: list }, this.countDown)
    }
  }

  componentDidMount() {
    this.initWXLogin()

    /* catch CODE of wechat login */
    window.onbeforeunload = () => {
      if (this.wxiframe && this.wxiframe.contentWindow.wx_code) {
        console.log(this.wxiframe.contentWindow.wx_code)
        this.getWXCode(this.wxiframe.contentWindow.wx_code)
        return false // This will stop the redirecting.
      }
      return null
    }
  }

  componentWillUnmount() {
    this.out = true
  }

  async doneAsync(view, device, user) {
    await Promise.delay(360)
    if (view === 'maintenance') { this.props.maintain() } else {
      this.props.ipcRenderer.send('LOGIN', device, user)
      this.props.login()
    }
  }

  renderCard() {
    return (
      <div style={{ zIndex: 100 }}>
        {
          !this.state.error ?
            <div style={{ width: 332, height: 492, padding: 24, position: 'relative', backgroundColor: '#FAFAFA' }}>
              {/* CircularProgress */}
              <div
                ref={ref => (this.weChatLoadingRef = ref)}
                key="weChatLoadingRef"
                style={{
                  position: 'absolute',
                  top: 108,
                  left: 0,
                  height: 300,
                  width: '100%',
                  backgroundColor: '#FAFAFA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CircularProgress size={64} thickness={5} />
              </div>
              <div style={{ height: 42 }} />
              <div
                style={{ height: 406, width: 300, margin: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                id="login_container"
              />
              <div style={{ height: 36 }} />

              {/* overlay text */}
              <div style={{ position: 'absolute', top: 0, left: 0, height: 108, width: '100%', backgroundColor: '#FAFAFA' }} >
                <div style={{ height: 72 }} />
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {i18n.__('Login via WeChat') }
                </div>
              </div>
            </div>
          :
            <div style={{ width: 380, height: 540, backgroundColor: '#FAFAFA' }}>
              <div
                style={{
                  width: 270,
                  height: 270,
                  margin: '42px auto 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  width={96}
                  height={96}
                  alt=""
                  src="./assets/images/icon.png"
                  style={{ filter: 'grayscale(100%)' }}
                />
              </div>
              <div style={{ height: 24 }} />
              <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.87)', fontSize: 20 }}>
                { this.state.error === 'net' ? i18n.__('Network Error') : i18n.__('Cloud Error') }
              </div>
              <div style={{ height: 24 }} />
              <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.54)', fontSize: 20 }}>
                { this.state.error === 'net' ? i18n.__('Network Error Text') : i18n.__('Cloud Error Text') }
              </div>
            </div>
        }
      </div>
    )
  }

  render() {
    // debug('render wechat login', this.state, this.props)
    if (!this.state.wechatLogin) return this.renderCard()
    let text = ''
    const wcl = this.state.wechatLogin
    switch (wcl) {
      case 'connecting':
        text = i18n.__('Connecting Text')
        break
      case 'authorization':
        text = i18n.__('Authenticating Text')
        break
      case 'getingList':
        text = i18n.__('Getting List Text')
        break
      case 'success':
        text = i18n.__('Get List Success')
        break
      default:
        text = ''
        break
    }

    if (!wcl) return (<div />)

    if (wcl === 'fail') {
      return (
        <div style={{ width: 380, height: 540, backgroundColor: '#FAFAFA', zIndex: 100 }}>
          {/* title */}
          <div style={{ height: 72, backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center' }} >
            <div style={{ marginLeft: 24 }} >
              { i18n.__('WeChat Login Failed') }
            </div>
          </div>
          <Divider />
          <div style={{ height: 24 }} />

          {/* content */}
          <div style={{ height: 400, marginLeft: 24, width: 332 }}>
            <div style={{ fontSize: 16, marginBottom: 12, color: 'rgba(0,0,0,0.87)' }}>
              { i18n.__('WeChat Login Failed Comment') }
            </div>
            <div style={{ height: 24 }} />
            <div style={{ fontSize: 16, marginBottom: 12, color: 'rgba(0,0,0,0.87)' }}>
              { i18n.__('WeChat Login Failed Text 1') }
            </div>
            <div style={{ height: 24 }} />
            <div style={{ fontSize: 16, marginBottom: 12, color: 'rgba(0,0,0,0.87)' }}>
              { i18n.__('WeChat Login Failed Text 2') }
            </div>
            <div style={{ height: 24 }} />
            <div style={{ fontSize: 16, marginBottom: 12, color: 'rgba(0,0,0,0.87)' }}>
              { i18n.__('WeChat Login Failed Text 3') }
            </div>
            <div style={{ height: 24 }} />
            <div style={{ fontSize: 16, marginBottom: 12, color: 'rgba(0,0,0,0.87)' }}>
              { i18n.__('WeChat Login Failed Text 4') }
            </div>
          </div>

          {/* button */}
          <div style={{ display: 'flex' }}>
            <div style={{ flexGrow: 1 }} />
            <FlatButton
              label={i18n.__('Return')}
              labelStyle={{ color: '#424242', fontWeight: 500 }}
              onTouchTap={this.resetWCL}
            />
          </div>
        </div>
      )
    }

    return (
      <div style={{ width: 380, height: 540, backgroundColor: '#FAFAFA', zIndex: 100 }}>
        <div style={{ height: 72, backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center' }} >
          <div style={{ marginLeft: 24 }} >
            { wcl === 'lastDevice' ? i18n.__('Last Device') : wcl === 'list' ? i18n.__('Select Device to Login') : i18n.__('Login to Device') }
          </div>
        </div>
        <Divider />
        {
          wcl === 'lastDevice' && this.state.wxData
            ? <div>
              <div style={{ height: 312, marginLeft: 24, width: 332, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flexGrow: 1 }} />

                {/* Icon */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ borderRadius: 48, width: 96, height: 96, overflow: 'hidden' }}>
                    <img
                      width={96}
                      height={96}
                      alt=""
                      src={this.state.wxData.user.avatarUrl || '../../Desktop/test.jpg'}
                    />
                  </div>
                </div>

                {/* Name */}
                <div style={{ height: 24 }} />
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  { this.state.wxData.user.nickName || 'Just_Test'}
                </div>
                <div style={{ flexGrow: 1 }} />
                <div style={{ display: 'flex' }}>
                  <div style={{ height: 80, width: 80, display: 'flex', alignItems: 'center' }}>
                    <Barcelona color="rgba(0,0,0,0.54)" style={{ width: 56, height: 56 }} />
                  </div>
                  <div>
                    <div style={{ height: 8 }} />
                    <div style={{ fontSize: 16, lineHeight: '24px', color: 'rgba(0,0,0,0.87)' }}> { this.state.lastDevice.name } </div>
                    <div style={{ fontSize: 14, lineHeight: '20px', color: 'rgba(0,0,0,0.54)' }}>
                      { this.state.lastDevice.LANIP }
                    </div>
                    <div style={{ fontSize: 14, lineHeight: '20px', color: 'rgba(0,0,0,0.54)' }}>{ i18n.__('Login via WeChat') } </div>

                  </div>
                </div>
                <div style={{ height: 8 }} />
              </div>
              <Divider />
              <div style={{ height: 32 }} />
              {
                this.state.logining ?
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
                    <CircularProgress size={48} thickness={3} />
                  </div>
                  :
                  <div>
                    <div style={{ height: 80, fontSize: 16, fontWeight: 500, color: 'rgba(0,0,0,0.87)', textAlign: 'center' }} >
                      <span style={{ fontSize: 34 }}> { this.state.count } </span>
                    </div>
                    <div style={{ display: 'flex' }}>
                      <div style={{ flexGrow: 1 }} />
                      <FlatButton
                        label={i18n.__('Avaliable Device List')}
                        labelPosition="before"
                        labelStyle={{ color: '#424242', fontWeight: 500 }}
                        onTouchTap={this.enterList}
                        icon={<RightIcon color="#424242" />}
                      />
                    </div>
                  </div>
              }
            </div>
            : wcl === 'list'
            ? <div>
              <div style={{ height: 16 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: 436, overflowY: 'auto' }}>
                  {
                    this.state.lists.map((list, index) => (
                      <DeviceList list={list} primaryColor={this.props.primaryColor} key={index} select={this.select} />))
                  }
                </div>
              </div>
            </div>
            : <div>
              <div style={{ height: 16 }} />
              <div style={{ height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {
                  wcl === 'success'
                  ? <Checkmark delay={300} color={this.props.primaryColor} />
                  : <CircularProgress size={64} thickness={5} />
                }
              </div>
              <div style={{ height: 36 }} />
              <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.87)', fontSize: 20, height: 36 }}>
                { text }
              </div>
            </div>
        }
      </div>
    )
  }
}

export default WechatLogin
