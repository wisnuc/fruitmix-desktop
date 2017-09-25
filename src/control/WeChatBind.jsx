import React from 'react'
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
      status: '',
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
          f.appendChild(d)
        }
      })
    }

    this.getWXCode = (code) => {
      /* init wx_code */
      this.wxiframe.contentWindow.wx_code = null
      this.setState({ status: 'connectingCloud' })
      this.props.apis.request('getWechatToken', { code, platform: 'web' }, (error, res) => {
        if (error) {
          debug('getWechatToken', code, error)
          this.setState({ error: 'wxBind', status: '' })
        } else {
          debug('getWechatToken', res)
          this.userInfo = res.data.user
          this.guid = this.userInfo.id
          this.props.apis.request('fillTicket', { ticketId: this.ticketId, token: res.data.token }, (err, r) => {
            if (err) return debug('fillTicket error !!!', err)
            debug('fillTicket success res', r)
            return this.setState({ status: 'confirm' })
          })
        }
      })
    }

    this.bindWechat = () => {
      this.setState({ status: 'connectingWX' }, () => {
        this.props.apis.request('creatTicket', null, (error, data) => {
          if (error) {
            debug('this.bindWechat error', error)
            this.setState({ error: 'creatTicket', status: '' })
          } else {
            debug('this.bindWechat success', data)
            this.ticketId = data.id
            this.initWXLogin()
          }
        })
      })
    }

    this.confirm = () => {
      debug('this.confirm', this.ticketId, this.guid)
      this.setState({ status: 'connectingCloud' })
      this.props.apis.request('confirmTicket', { ticketId: this.ticketId, guid: this.guid, state: true }, (e) => {
        if (e) {
          debug('confirmTicket error', e)
          this.setState({ error: 'confirmTicket', status: '' })
        } else {
          debug('this.confirm this.userInfo', this.userInfo, this.props.account, this.props)

          this.props.ipcRenderer.send('WECHAT_LOGIN', this.props.account.uuid, { weChat: this.userInfo })
          setTimeout(() => this.setState({ status: 'success', error: '' }), 500)
        }
      })
    }

    this.done = () => {
      this.props.apis.request('account')
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
    this.bindWechat()
  }

  render() {
    const { error, status } = this.state
    let text = ''
    switch (error) {
      case 'net':
        text = '无法连接到互联网，请检查您的网络设置！'
        break
      case 'wxBind':
        text = '绑定失败，无法获取微信授权'
        break
      case 'confirmTicket':
        text = '绑定失败，无法确认绑定信息'
        break
      case 'creatTicket':
        text = '绑定失败，无法创建绑定动作'
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
                { status === 'connectingWX' ? '连接微信中...' : '连接WISNUC云服务器中...' }
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
                  { '请使用微信扫码' }
                </div>
              </div>
            </div>
        }
        {
          status === 'confirm' &&
            <div style={{ width: 332, height: 492, padding: 24, position: 'relative' }}>
              <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}> 绑定微信 </div>
              <div style={{ height: 20 }} />
              <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14 }} >
                { '确定使用以下帐号绑定Wisnuc吗？'}
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
                <FlatButton label="取消" primary onTouchTap={this.done} />
                <FlatButton label="绑定" primary onTouchTap={this.confirm} />
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
                { '绑定成功' }
              </div>
              <div style={{ height: 106 }} />
              <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                <FlatButton label="确定" primary onTouchTap={this.done} />
              </div>
            </div>
        }
        {
          error &&
            <div style={{ width: 332, height: 492, padding: 24, position: 'relative' }}>
              <div style={{ height: 16 }} />
              <div style={{ height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CloseIcon style={{ height: 72, width: 72 }} color={this.props.primaryColor} />
              </div>
              <div style={{ height: 36 }} />
              <div style={{ textAlign: 'center', fontSize: 20, height: 36 }}>
                { text }
              </div>
              <div style={{ height: 106 }} />
              <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                <FlatButton label="返回" primary onTouchTap={this.done} />
              </div>
            </div>
        }
      </div>
    )
  }
}

export default WeChatBind
