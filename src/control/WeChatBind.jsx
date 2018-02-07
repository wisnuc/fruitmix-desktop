import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import { Divider, IconButton, CircularProgress } from 'material-ui'
import ActionAccountCircle from 'material-ui/svg-icons/action/account-circle'
import Username from 'material-ui/svg-icons/action/perm-identity'
import Password from 'material-ui/svg-icons/action/lock-outline'
import HelpIcon from 'material-ui/svg-icons/action/help-outline'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import FlatButton from '../common/FlatButton'
import DialogOverlay from '../common/DialogOverlay'
import ChangeAccountDialog from './ChangeAccountDialog'
import Checkmark from '../common/Checkmark'

const debug = Debug('component:control:WeChatBind')

class WeChatBind extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      status: 'connectingWX',
      error: ''
    }

    /* bind wechat */

    /*
      1. create ticket (station)
      2. get wechat QR code (wechat)
      3. get WXcode after user scaned QR code (local, by onbeforeunload)
      4. get wechat token (cloud)
      5. fill ticket (cloud)
      3. confirmTicket (station)
    */

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
      this.setState({ status: 'wechat' }, () => {
        this.WxLogin({
          id: 'wechat_bind_container',
          appid: 'wxd7e08af781bea6a2',
          scope: 'snsapi_login',
          redirect_uri: 'http%3A%2F%2Fwxlogin.siyouqun.com',
          state: 'uuid',
          language: 'zh_CN',
          style: '',
          href: ''
        })

        const f = document.getElementById('wechat_bind_container')
        const d = this.wxiframe
        if (f) f.innerHTML = ''
        if (!window.navigator.onLine) {
          this.setState({ error: 'net' })
        } else {
          d.onload = () => {
            if (!d.contentDocument.head || !d.contentDocument.title) this.setState({ error: 'wxConnect' })
          }
          f.appendChild(d)
        }
      })
    }

    this.getWXCode = (code) => {
      /* init wx_code */
      this.wxiframe.contentWindow.wx_code = null
      this.setState({ status: 'connectingCloud' })

      this.props.apis.pureRequest('getWechatToken', { code, platform: 'web' }, (error, res) => {
        if (error || !res) {
          debug('getWechatToken', code, error)
          this.setState({ error: 'wxBind', status: '' })
        } else {
          debug('getWechatToken', res)
          this.userInfo = res.user
          this.guid = this.userInfo.id
          this.token = res.token
          this.props.apis.pureRequest('fillTicket', { ticketId: this.ticketId, token: this.token }, (err) => {
            if (err) {
              debug('fillTicket error', err)
              this.setState({ error: 'fillTicket', status: '' })
            } else this.setState({ status: 'confirm' })
          })
        }
      })
    }

    this.getStationInfo = () => {
      if (this.retryCount > 3) return this.setState({ error: 'wisnucNet', status: '' })
      this.retryCount += 1
      // debug('this.getStationInfo', this.retryCount)
      this.props.apis.pureRequest('info', null, (err, res) => {
        if (res && res.connectState && (res.connectState === 'CONNECTED' || res.connectState[0] === 'CONNECTED')) this.bindWechat()
        else setTimeout(() => this.getStationInfo(), this.retryCount * 1000)
      })
    }

    this.bindWechat = () => {
      this.props.apis.pureRequest('creatTicket', null, (error, res) => {
        if (error) {
          debug('this.bindWechat error', error)
          this.setState({ error: 'creatTicket', status: '' })
        } else {
          debug('this.bindWechat success', res)
          this.ticketId = res.id
          this.initWXLogin()
        }
      })
    }

    this.confirm = () => {
      debug('this.confirm', this.ticketId, this.guid)
      this.setState({ status: 'connectingCloud' })
      this.props.apis.pureRequest('confirmTicket', { ticketId: this.ticketId, guid: this.guid, state: true }, (e) => {
        if (e) {
          debug('confirmTicket error', e)
          this.setState({ error: 'confirmTicket', status: '' })
        } else {
          debug('this.confirm this.userInfo', this.userInfo, this.props.account, this.props)

          this.props.ipcRenderer.send('UPDATE_USER_CONFIG', this.props.account.uuid, { weChat: this.userInfo, wxToken: this.token })
          setTimeout(() => this.setState({ status: 'success', error: '' }), 500)
        }
      })
    }

    this.done = () => {
      if (this.props.apis.request) this.props.apis.request('account')
      if (this.state.status === 'success' && this.props.success) this.props.success()
      this.props.onRequestClose()
    }
  }

  componentDidMount() {
    /* catch CODE of wechat login */
    window.onbeforeunload = () => {
      if (this.wxiframe && this.wxiframe.contentWindow.wx_code) {
        console.log(this.wxiframe.contentWindow.wx_code)
        this.getWXCode(this.wxiframe.contentWindow.wx_code)
        return false // This will stop the redirecting.
      }
      return null
    }

    this.retryCount = 0
    this.getStationInfo()
  }

  render() {
    const { error, status } = this.state
    let text = ''
    let tips = ''
    switch (error) {
      case 'net':
        text = i18n.__('Network Error')
        tips = i18n.__('Network Error Text')
        break
      case 'wxConnect':
        text = i18n.__('WeChat Connect Error')
        tips = i18n.__('WeChat Connect Error Text')
        break
      case 'wxBind':
        text = i18n.__('WeChat Auth Error')
        break
      case 'wisnucNet':
        text = i18n.__('Station Connect Error')
        tips = i18n.__('Station Connect Error Text')
        break
      case 'fillTicket':
        text = i18n.__('Fill Ticket Error')
        break
      case 'confirmTicket':
        text = i18n.__('Confirm Ticket Error')
        tips = i18n.__('Confirm Ticket Error Text')
        break
      case 'creatTicket':
        text = i18n.__('Create Ticket Error')
        break
      default:
        text = ''
    }
    return (
      <div>
        {
          (status === 'connectingWX' || status === 'connectingCloud') &&
            <div style={{ width: 332, height: 492, padding: 24, position: 'relative' }}>
              <div style={{ height: 16 }} />
              <div style={{ height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={64} thickness={5} />
              </div>
              <div style={{ height: 56 }} />
              <div style={{ textAlign: 'center', fontSize: 20, height: 36 }}>
                { status === 'connectingWX' ? i18n.__('Connecting WeChat') : i18n.__('Connecting Wisnuc Cloud') }
              </div>
            </div>
        }
        {
          status === 'wechat' &&
            <div style={{ width: 332, height: 492, padding: 24, position: 'relative' }}>
              <div style={{ height: 42 }} />
              <div style={{ height: 406, width: 300, margin: 'auto' }} id="wechat_bind_container" />
              <div style={{ height: 36 }} />

              {/* overlay text */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: 108,
                  width: '100%',
                  zIndex: 100,
                  backgroundColor: '#FFFFFF'
                }}
              >
                <div style={{ height: 72 }} />
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  { i18n.__('WeChat QR Code Title') }
                </div>
              </div>
            </div>
        }
        {
          status === 'confirm' &&
            <div style={{ width: 332, height: 492, padding: 24, position: 'relative' }}>
              <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}> { i18n.__('Bind WeChat Title') }</div>
              <div style={{ height: 20 }} />
              <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14 }} >
                { i18n.__('Bind WeChat Text in WeChatBind') }
              </div>

              {/* Icon */}
              <div style={{ height: 72 }} />
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ borderRadius: 80, width: 160, height: 160, overflow: 'hidden' }}>
                  <img width={160} height={160} alt="" src={this.userInfo.avatarUrl} />
                </div>
              </div>

              {/* Name */}
              <div style={{ height: 48 }} />
              <div style={{ display: 'flex', justifyContent: 'center', height: 32 }}>
                { this.userInfo.nickName || 'Error'}
              </div>

              <div style={{ height: 84 }} />
              <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                <FlatButton label={i18n.__('Cancel')} primary onTouchTap={this.done} />
                <FlatButton label={i18n.__('Confirm')} primary onTouchTap={this.confirm} />
              </div>
            </div>
        }
        {
          status === 'success' &&
            <div style={{ width: 332, height: 492, padding: 24, position: 'relative' }}>
              <div style={{ height: 16 }} />
              <div style={{ height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Checkmark delay={300} color={this.props.primaryColor} />
              </div>
              <div style={{ height: 36 }} />
              <div style={{ textAlign: 'center', fontSize: 20, height: 36 }}>
                { i18n.__('Bind WeChat Success') }
              </div>
              <div style={{ height: 106 }} />
              <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                <FlatButton label={i18n.__('Confirm')} primary onTouchTap={this.done} />
              </div>
            </div>
        }
        {
          error &&
            <div style={{ width: 332, height: 492, padding: 24, position: 'relative' }}>
              <div style={{ height: 16 }} />
              <div style={{ height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CloseIcon style={{ height: 72, width: 72 }} color="#FF4081" />
              </div>
              <div style={{ height: 36 }} />
              <div style={{ textAlign: 'center', fontSize: 20, height: 48 }}>
                { text }
              </div>
              <div style={{ textAlign: 'center', fontSize: 16, height: 36, color: 'rgba(0,0,0,0.54)' }}>
                { tips }
              </div>
              <div style={{ height: 58 }} />
              <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                <FlatButton label={i18n.__('Return')} primary onTouchTap={this.done} />
              </div>
            </div>
        }
      </div>
    )
  }
}

export default WeChatBind
