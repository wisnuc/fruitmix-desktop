import React from 'react'
import i18n from 'i18n'
import { CircularProgress, Divider, Paper } from 'material-ui'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import FlatButton from '../common/FlatButton'
import Checkmark from '../common/Checkmark'
import Password from './ChangeAccountDialog'

/*
  http://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js
*/

class ResetPassword extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      error: '', // '', 'net', 'wisnuc'
      wechatLogin: '', // '', 'authenticating', 'success', 'fail'
      confirm: true,
      reset: false
    }

    this.weChatToken = null

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

    this.getWXCode = (code) => {
      /* init wx_code */
      this.wxiframe.contentWindow.wx_code = null

      this.setState({ wechatLogin: 'authenticating' })
      this.props.apis.pureRequest('getWechatToken', { code, platform: 'web' }, (error, res) => {
        if (error) {
          console.log('this.getWXCode', code, error)
          this.setState({ wechatLogin: 'fail' })
        } else {
          console.log('got token!!', res, this.props.apis)
          if (res) {
            this.weChatToken = res
            this.setState({ wechatLogin: 'success' })
            this.timer = setTimeout(() => this.setState({ wechatLogin: '', reset: true }), 2000)
            // TODO
          } else {
            console.log('no wechat Data')
            this.setState({ wechatLogin: 'fail' })
          }
        }
      })
    }

    this.confirm = () => {
      this.setState({ confirm: false }, () => this.initWXLogin())
    }
  }

  componentDidMount () {
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

  componentWillUnmount () {
    clearTimeout(this.timer)
  }

  renderCard () {
    return (
      <div style={{ zIndex: 100 }}>
        {
          !this.state.error
            ? (
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
                    {i18n.__('WeChat Authentication') }
                  </div>
                </div>
              </div>
            )
            : (
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
            )
        }
      </div>
    )
  }

  renderConfirm () {
    return (
      <div style={{ width: 336, padding: '24px 24px 0px 24px' }}>
        {/* title */}
        <div style={{ fontSize: 20, fontWeight: 500 }}>
          { i18n.__('Reset Password Title') }
        </div>
        <div style={{ height: 24 }} />
        <div>
          { i18n.__('Reset Password Confirm Text') }
        </div>
        <div style={{ height: 24 }} />
        {/* button */}
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
          <FlatButton label={i18n.__('Cancel')} onTouchTap={this.props.onRequestClose} primary />
          <FlatButton label={i18n.__('Confirm')} onTouchTap={this.confirm} primary />
        </div>
      </div>
    )
  }

  renderProcess () {
    let text = ''
    const wcl = this.state.wechatLogin
    switch (wcl) {
      case 'authenticating':
        text = i18n.__('Authenticating Text')
        break
      case 'success':
        text = i18n.__('Authentication Success Text')
        break
      case 'fail':
        i18n.__('WeChat Reset Password Failed Text')
        break
      default:
        break
    }
    return (
      <div style={{ width: 380, height: 540, backgroundColor: '#FAFAFA', zIndex: 100 }}>
        <div style={{ height: 72, backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center' }} >
          <div style={{ marginLeft: 24 }} >
            { i18n.__('WeChat Authentication') }
          </div>
        </div>
        <Divider />
        <div>
          <div style={{ height: 16 }} />
          <div style={{ height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {
              wcl === 'failed' ? <CloseIcon style={{ height: 72, width: 72 }} color="#FF4081" />
                : wcl === 'success' ? <Checkmark delay={300} color={this.props.primaryColor} />
                  : <CircularProgress size={64} thickness={5} />
            }
          </div>
          <div style={{ height: 36 }} />
          <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.87)', fontSize: 20, height: 36 }}>
            { text }
          </div>
        </div>
      </div>
    )
  }

  renderReset () {
    const { openSnackBar, refresh, apis, onRequestClose, selectedDevice, ipcRenderer } = this.props
    return (
      <Password
        stationID={selectedDevice.mdev.stationID}
        onRequestClose={onRequestClose}
        openSnackBar={openSnackBar}
        ipcRenderer={ipcRenderer}
        refresh={refresh}
        token={this.weChatToken.token}
        apis={apis}
        op="reset"
      />
    )
  }

  render () {
    return (
      <Paper>
        {
          this.state.confirm ? this.renderConfirm()
            : this.state.wechatLogin ? this.renderProcess()
              : this.state.reset ? this.renderReset()
                : this.renderCard()
        }
      </Paper>
    )
  }
}

export default ResetPassword
