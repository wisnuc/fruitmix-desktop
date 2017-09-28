import React from 'react'
import Debug from 'debug'
import Radium from 'radium'
import { Avatar, CircularProgress, Divider } from 'material-ui'
import RightIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right'
import CloudDoneIcon from 'material-ui/svg-icons/file/cloud-done'
import CloudOffIcon from 'material-ui/svg-icons/file/cloud-off'
import WifiIcon from 'material-ui/svg-icons/notification/wifi'
import LocalLogin from './LocalLogin'
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
      wxCode: '',
      local: true,
      hello: true,
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

      let lanip = null
      for (let i = 0; i < ips.length; i++) {
        try {
          const info = await this.props.selectedDevice.requestAsync('info', { ip: ips[i] })
          if (info && info.id === stationID) {
            lanip = ips[0]
            break
          }
        } catch(e) {
          debug('this.autologinAsync can not connect lanip', ips[i], e)
        }
      }
      if (lanip) {
        const token = this.state.wxData.token
        const guid = this.state.wxData.user.id

        const res = await this.props.selectedDevice.requestAsync('cloudUsers', { stationID, token })
        const user = res && res.data.find(u => u.global && u.global.id === guid)
        if (!user) throw Error('no user')
        const localToken = await this.props.selectedDevice.requestAsync('localTokenByCloud', { stationID, token })

        Object.assign(this.props.selectedDevice, {
          token: {
            isFulfilled: () => true,
            ctx: user,
            data: localToken.data
          },
          mdev: { address: lanip, domain: 'local' }
        })
        this.done('LOGIN', this.props.selectedDevice, user)
      } else {
        const token = this.state.wxData.token
        const guid = this.state.wxData.user.id

        const res = await this.props.selectedDevice.requestAsync('cloudUsers', { stationID, token })
        const user = res && res.data.find(u => u.global && u.global.id === guid)
        if (!user) throw Error('no user')
        Object.assign(this.props.selectedDevice, {
          token: {
            isFulfilled: () => true,
            ctx: user,
            data: { token, stationID }
          },
          mdev: { address: 'http://www.siyouqun.org', domain: 'remote' }
        })
        debug('this.autologinAsync this.props.selectedDevice', this.props.selectedDevice)
        this.props.ipcRenderer.send('WECHAT_LOGIN', user.uuid, { weChat: this.state.wxData.user })
        return this.done('LOGIN', this.props.selectedDevice, user)
      }
    }

    this.autologin = () => {
      if (this.out) return
      this.autologinAsync().catch((e) => {
        debug('this.autologin', e)
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
      this.setState({ wechatLogin: 'list', count: 3 })
    }

    this.resetWCL = () => {
      this.initWXLogin()
      this.setState({ wechatLogin: '' })
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
      // debug('this.initWXLogin start!')
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
        // debug('this.initWXLogin this.wxiframe', this.wxiframe, this.state)
        if (f) f.innerHTML = ''
        if (!window.navigator.onLine) {
          this.setState({ error: 'net' })
        } else {
          f.appendChild(d)
        }
      })
    }

    this.getStations = (guid, token) => {
      this.props.selectedDevice.request('getStations', { guid, token }, (err, res) => {
        if (err) {
          debug('this.getStations error', err)
          return this.setState({ wechatLogin: 'fail' })
        }
        debug('this.getStations success', res)
        const lists = res.data
        const index = lists.findIndex(l => l.isOnline)
        if (index > -1) {
          debug('lastDevice', lists[index])
          this.setState({ lists })
          setTimeout(() => this.setState({ wechatLogin: 'success', count: 3 }), 500)
          setTimeout(() => this.setState({ wechatLogin: 'lastDevice', lastDevice: lists[index] }, this.countDown), 1000)
        } else return this.setState({ wechatLogin: 'fail' })
      })
    }

    this.getWXCode = (code) => {
      /* init wx_code */
      this.wxiframe.contentWindow.wx_code = null

      /* clear countDown time */
      clearInterval(this.interval)

      this.setState({ wechatLogin: 'authorization' })
      this.props.selectedDevice.request('wxToken', { code }, (err, res) => {
        if (err) {
          debug('this.getWXCode', code, err)
          this.setState({ wechatLogin: 'fail' })
        } else {
          debug('got token!!', res)
          // return console.log(wxLogin)
          if (res.data) {
            this.setState({ wxData: res.data, wechatLogin: 'getingList' })
            this.getStations(res.data.user.id, res.data.token)
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
    debug('renderCard', this.state.error)
    return (
      <div style={{ zIndex: 100 }}>
        {
          !this.state.error ?
            <div style={{ width: 332, height: 492, padding: 24, position: 'relative', backgroundColor: '#FAFAFA' }}>
              <div style={{ height: 42 }} />
              <div style={{ height: 406, width: 300, margin: 'auto' }} id="login_container" />
              <div style={{ height: 36 }} />

              {/* overlay text */}
              <div style={{ position: 'absolute', top: 0, left: 0, height: 108, width: '100%', backgroundColor: '#FAFAFA' }} >
                <div style={{ height: 72 }} />
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  { '微信登录' }
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
                { this.state.error === 'net' ? '网络连接已断开' : '云服务已断开' }
              </div>
              <div style={{ height: 24 }} />
              <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.54)', fontSize: 20 }}>
                { this.state.error === 'net' ? '请检查您的网络设置' : '请您稍后登录或局域网登录' }
              </div>
            </div>
        }
      </div>
    )
  }

  render() {
    debug('render wechat login', this.state, this.props)
    if (!this.state.wechatLogin) return this.renderCard()
    let text = ''
    const wcl = this.state.wechatLogin
    switch (wcl) {
      case 'connecting' :
        text = '连接服务器中...'
        break
      case 'authorization' :
        text = '正在进行权限认证...'
        break
      case 'getingList' :
        text = '正在获取设备列表...'
        break
      case 'success' :
        text = '成功获取设备列表'
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
              { '登录失败' }
            </div>
          </div>
          <Divider />
          <div style={{ height: 24 }} />

          {/* content */}
          <div style={{ height: 400, marginLeft: 24, width: 332 }}>
            <div style={{ fontSize: 16, marginBottom: 12, color: 'rgba(0,0,0,0.87)' }}>
              请确定您是否拥有WISNUC品牌硬件产品或正在使用安装有WISNUC OS的硬件设备。
            </div>
            <div style={{ height: 24 }} />
            <div style={{ fontSize: 16, marginBottom: 12, color: 'rgba(0,0,0,0.87)' }}>
              1. 您可能尚未初始化设备
            </div>
            <div style={{ height: 24 }} />
            <div style={{ fontSize: 16, marginBottom: 12, color: 'rgba(0,0,0,0.87)' }}>
              2. 您可能尚未绑定微信
            </div>
            <div style={{ height: 24 }} />
            <div style={{ fontSize: 16, marginBottom: 12, color: 'rgba(0,0,0,0.87)' }}>
              3. 您可能尚未加入私有群
            </div>
            <div style={{ height: 24 }} />
            <div style={{ fontSize: 16, marginBottom: 12, color: 'rgba(0,0,0,0.87)' }}>
              4. 您绑定的设备都不在线
            </div>
          </div>

          {/* button */}
          <div style={{ display: 'flex' }}>
            <div style={{ flexGrow: 1 }} />
            <FlatButton
              label="返回"
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
            { wcl === 'lastDevice' ? '上次登录的设备' : wcl === 'list' ? '请选择登录设备' : '登录设备' }
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
                    <div style={{ fontSize: 16, lineHeight: '24px', color: 'rgba(0,0,0,0.87)' }}> { '闻上盒子' } </div>
                    <div style={{ fontSize: 14, lineHeight: '20px', color: 'rgba(0,0,0,0.54)' }}> { '' } </div>
                    <div style={{ fontSize: 14, lineHeight: '20px', color: 'rgba(0,0,0,0.54)' }}> { '远程访问' } </div>
                  </div>
                </div>
                <div style={{ height: 8 }} />
              </div>
              <Divider />
              <div style={{ height: 32 }} />
              <div
                style={{
                  height: 80,
                  fontSize: 16,
                  fontWeight: 500,
                  color: 'rgba(0,0,0,0.87)',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: 34 }}> { this.state.count } </span> 秒后将登录
              </div>
              <div style={{ display: 'flex' }}>
                <div style={{ flexGrow: 1 }} />
                <FlatButton
                  label="可登录设备列表"
                  labelPosition="before"
                  labelStyle={{ color: '#424242', fontWeight: 500 }}
                  onTouchTap={this.enterList}
                  icon={<RightIcon color="#424242" />}
                />
              </div>
            </div>
            : wcl === 'list'
            ? <div>
              <div style={{ height: 16 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: 436, overflowY: 'auto' }}>
                  {
                    this.state.lists.map((list, index) => (
                      <DeviceList list={list} primaryColor={this.props.primaryColor} key={index} select={this.select} />)
                    )
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
