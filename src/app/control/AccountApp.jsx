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

const debug = Debug('component:control:device')

class AccountApp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      status: '',
      openDialog: '',
      error: '',
      editAvatar: false
    }

    this.toggleDialog = (type) => {
      this.setState({ [type]: !this.state[type] })
    }

    this.onCloseDialog = () => {
      this.setState({ openDialog: '' })
    }

    /* wechat */
    /*
      creatTicket
      wxBind
      getTicket
      confirmTicket
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

    this.confirm = () => {
      this.setState({ status: 'connectingCloud', error: '' })
      this.props.apis.request('confirmTicket', { ticketId: this.userIds.ticketId, guid: this.userIds.guid, state: true }, (e) => {
        if (e) {
          debug('confirmTicket error', e)
          this.setState({ error: 'confirmTicket', status: '' })
        } else {
          setTimeout(() => this.setState({ status: 'success', error: '' }), 500)
        }
      })
    }

    this.getWXCode = (code) => {
      /* init wx_code */
      this.wxiframe.contentWindow.wx_code = null
      // this.props.apis.request('wxBind', { ticketId: this.ticket, code, platform: 'web' }, (error, data) => {
      this.setState({ status: 'connectingCloud' })
      this.props.apis.request('getWechatToken', { code, platform: 'web' }, (error, data) => {
        if (error) {
          debug('this.getWXCode error', code, error)
          this.setState({ error: 'wxBind', status: '' })
        } else {
          debug('this.getWXCode success', data)
          // this.setState({ status: 'success' })
          this.props.apis.request('getTicket', { ticketId: data.data.ticketId }, (err, token) => {
            if (error) {
              debug('getToken error', code, data, err)
              this.setState({ error: 'getTicket', status: '' })
            } else {
              debug('getToken success', token)
              // this.userInfo = wechatInfo.userInfo
              // this.userIds = { ticketId: data.data.ticketId, guid: wechatInfo.guid }
              // this.setState({ status: 'confirm' })
            }
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
            this.ticket = data.ticketId
            setTimeout(this.initWXLogin, 1000)
          }
        })
      })
    }

    this.done = () => {
      // this.props.apis.request('account')
      this.setState({ error: '', status: '' })
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
  }

  renderBind() {
    const { error, status } = this.state
    let text = ''
    switch (error) {
      case 'net':
        text = '无法连接到互联网，请检查您的网络设置！'
        break
      case 'wxBind':
        text = '绑定失败，请重试！'
        break
      case 'getTicket':
        text = '绑定失败，请重试！'
        break
      case 'confirmTicket':
        text = '绑定失败，请重试！'
        break
      default:
        text = '绑定失败，请重试！'
    }
    return (
      <div>
        {/* dialog */}
        <DialogOverlay open={!!status || !!error}>
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
                    <div style={{ borderRadius: 60, width: 120, height: 120, overflow: 'hidden' }}>
                      <img width={120} height={120} alt="" src={this.userInfo.headimgurl} />
                    </div>
                  </div>

                  {/* Name */}
                  <div style={{ height: 48 }} />
                  <div style={{ display: 'flex', justifyContent: 'center', height: 32 }}>
                    { this.userInfo.nickname || 'Error'}
                  </div>

                  <div style={{ height: 124 }} />
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
                    <CloseIcon style={{ height: 72, width: 72 }} />
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
        </DialogOverlay>
      </div>
    )
  }

  render() {
    // debug('this.props Account', this.props)
    const { account, primaryColor, apis, refresh, openSnackBar } = this.props
    if (!account) return this.renderBind()

    const tooltipUserName = (
      <div
        style={{
          width: 400,
          textAlign: 'left',
          whiteSpace: 'normal',
          fontSize: 14,
          fontWeight: 500,
          lineHeight: '26px',
          display: 'flex',
          alignItems: 'center',
          height: 72
        }}
      >
        { `您当前的用户名为：${account.username}`}
        <br />
        设备登录用户名是系统用户名，也是您登录Samba的用户名。
      </div>
    )

    return (
      <div style={{ paddingLeft: 68, paddingTop: 16 }}>

        {/* avatar */}
        <div style={{ height: 67, marginLeft: -4 }} >
          {
            account.avatar ? <div /> :
            <IconButton
              iconStyle={{ width: 67, height: 67, color: primaryColor }}
              style={{ width: 67, height: 67, padding: 0 }}
              onTouchTap={() => this.toggleDialog('editAvatar')}
            >
              <ActionAccountCircle />
            </IconButton>
          }
        </div>

        <div style={{ height: 4 }} />

        {/* username */}
        <div style={{ flex: '0 0 560px', fontSize: 24, height: 24, display: 'flex', alignItems: 'center' }}>
          { account.username }
        </div>

        <div style={{ height: 8 }} />

        {/* usertype */}
        <div style={{ flex: '0 0 560px' }}>
          <div style={{ fontSize: 14, lineHeight: '26px', color: 'rgba(0, 0, 0, 0.87)', display: 'flex' }}>
            {
              account.isAdmin && account.isFirstUser ?
                '您是系统的第一个用户，是最高权限的系统管理员。' :
                account.isAdmin ? '您是系统管理员。' : '您是系统普通用户。'
            }
            {
              account.global && account.global.wx ?
                <div style={{ display: 'flex', alignItems: 'center', height: 26 }}>
                  { `您已绑定了您的微信，ID: test，微信昵称: 牛牛牛` }
                </div>
                :
                <div style={{ display: 'flex', alignItems: 'center', height: 26 }}>
                  { '您尚未绑定您的微信帐号。' }
                  {/* <FlatButton label="绑定微信" onTouchTap={this.bindWechat} primary /> */}
                </div>
            }
          </div>
        </div>

        <div style={{ height: 8 }} />
        <Divider style={{ color: 'rgba(0, 0, 0, 0.54)', maxWidth: 760 }} />
        <div style={{ height: 32 }} />

        {/* change username */}
        <div style={{ display: 'flex', alignItems: 'center' }} >
          <div style={{ display: 'flex', alignItems: 'center' }} >
            <div style={{ flex: '0 0 56px', height: 36 }} >
              <div style={{ height: 8 }} />
              <Username color={this.props.primaryColor} />
            </div>
            <div style={{ flex: '0 0 560px', color: 'rgba(0, 0, 0, 0.87)', display: 'flex', alignItems: 'center' }}>
              <div> { '设备登录用户名' } </div>
              <IconButton
                iconStyle={{ width: 18, height: 18, color: primaryColor }}
                style={{ width: 36, height: 36, padding: 8 }}
                tooltip={tooltipUserName}
                touch
                tooltipPosition="bottom-right"
              >
                <HelpIcon />
              </IconButton>
            </div>
          </div>
        </div>

        <div style={{ height: 8 }} />
        <div style={{ display: 'flex', alignItems: 'center' }} >
          <div style={{ display: 'flex', alignItems: 'center' }} >
            <div style={{ flex: '0 0 56px' }} />
            <div style={{ flex: '0 0 560px' }}>
              <FlatButton
                label="修改用户名"
                style={{ marginLeft: -8 }}
                primary
                onTouchTap={() => this.setState({ openDialog: 'username' })}
              />
            </div>
          </div>
        </div>

        <div style={{ height: 32 }} />

        {/* change password */}
        <div style={{ display: 'flex', alignItems: 'center' }} >
          <div style={{ display: 'flex', alignItems: 'center' }} >
            <div style={{ flex: '0 0 56px', height: 36 }} >
              <div style={{ height: 8 }} />
              <Password color={this.props.primaryColor} />
            </div>
            <div style={{ flex: '0 0 560px', fontSize: 16, color: 'rgba(0, 0, 0, 0.87)' }}>
              密码
            </div>
          </div>
        </div>

        <div style={{ height: 8 }} />
        <div style={{ display: 'flex', alignItems: 'center' }} >
          <div style={{ display: 'flex', alignItems: 'center' }} >
            <div style={{ flex: '0 0 56px' }} />
            <div style={{ flex: '0 0 560px' }}>
              <FlatButton
                label="修改密码"
                style={{ marginLeft: -8 }}
                primary
                onTouchTap={() => this.setState({ openDialog: 'password' })}
              />
            </div>
          </div>
        </div>

        {/* change account dialog */}
        <DialogOverlay open={!!this.state.openDialog} onRequestClose={this.onCloseDialog}>
          {
            this.state.openDialog &&
              <ChangeAccountDialog
                openSnackBar={openSnackBar}
                refresh={refresh}
                apis={apis}
                op={this.state.openDialog}
              />
          }
        </DialogOverlay>

        {/* edit avatar dialog */}
        <DialogOverlay open={!!this.state.editAvatar}>
          {
            this.state.editAvatar &&
            <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
              <div style={{ color: 'rgba(0,0,0,0.54)' }}>{'请绑定微信，将会自动获取您的微信头像。'}</div>
              <div style={{ height: 24 }} />
              <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                <FlatButton label="确定" primary onTouchTap={() => this.toggleDialog('editAvatar')} />
              </div>
            </div>
          }
        </DialogOverlay>

        { this.renderBind() }

      </div>
    )
  }
}

export default AccountApp
