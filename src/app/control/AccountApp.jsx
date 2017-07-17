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
        try {
          d.onload = (e) => {
            d.contentWindow.onerror = (e) => { debug('wxiframe error', e) }
          }
          f.appendChild(d)
        } catch (e) {
          debug('error', e)
        }
      })
    }

    /*
      creatTicket
      wxBind
      getTicket
      confirmTicket
    */
    this.getWXCode = (code) => {
      /* init wx_code */
      this.wxiframe.contentWindow.wx_code = null

      this.setState({ status: 'connectingCloud' })
      this.props.apis.request('wxBind', { ticketId: this.ticket, code, platform: 'web' }, (error, data) => {
        if (error) {
          debug('this.getWXCode error', code, error)
          this.setState({ error: 'wxBind', status: '' })
        } else {
          debug('this.getWXCode success', data)
          // this.setState({ status: 'success' })
          this.props.apis.request('getTicket', { ticketId: data.id }, (err, wechatInfo) => {
            if (error) {
              debug('getTicket error', code, data, err)
              this.setState({ error: 'getTicket', status: '' })
            } else {
              debug('getTicket success', wechatInfo)
              this.props.apis.request('confirmTicket', { guid: wechatInfo.guid, state: true }, (e) => {
                if (e) {
                  debug('confirmTicket error', e)
                  this.setState({ error: 'confirmTicket', status: '' })
                } else {
                  this.setState({ status: 'success' })
                }
              })
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
            this.setState({ error: 'creatTicket' })
          } else {
            debug('this.bindWechat success', data)
            this.ticket = data.id
            setTimeout(this.initWXLogin, 1000)
          }
        })
      })
    }

    this.done = () => {
      // this.props.apis.request('account')
      this.setState({ status: '', error: '' })
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
    return (
      <div>
        <FlatButton label="绑定微信" onTouchTap={this.bindWechat} />

        {/* dialog */}
        <DialogOverlay open={!!status}>
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
                  <div style={{ height: 34 }} />
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
                    { `绑定失败, Error: ${error}` }
                  </div>
                  <div style={{ height: 34 }} />
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

    const tooltipWeChat = (
      <div
        style={{
          width: 350,
          textAlign: 'left',
          whiteSpace: 'normal',
          fontSize: 14,
          fontWeight: 500,
          lineHeight: '26px',
          display: 'flex',
          alignItems: 'center',
          height: 96
        }}
      >
        请您下载手机APP“私有群”进行微信绑定
        <br />
        闻上私有群是一款将您通过微信小程序或私有群APP分享的所有内容均保存到当前设备的独立应用。
      </div>
    )

    const tooltipUserName = (
      <div
        style={{
          width: 380,
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
        <div style={{ height: 96, marginLeft: -24 }} >
          {
            account.avatar ? <div /> :
            <IconButton
              iconStyle={{ width: 64, height: 64, color: primaryColor }}
              style={{ width: 96, height: 96, padding: 16 }}
              onTouchTap={() => this.toggleDialog('editAvatar')}
            >
              <ActionAccountCircle />
            </IconButton>
          }
        </div>

        {/* username */}
        <div style={{ flex: '0 0 560px', fontSize: 24, color: 'rgba(0, 0, 0, 0.87)', height: 24 }}>
          { account.username }
        </div>

        {/* usertype */}
        <div style={{ flex: '0 0 560px' }}>
          <div style={{ fontSize: 14, lineHeight: '26px', color: 'rgba(0, 0, 0, 0.87)' }}>
            {
              account.isAdmin && account.isFirstUser ?
                '您是系统的第一个用户，是最高权限的系统管理员。' :
                account.isAdmin ? '您是系统管理员。' : '您是系统普通用户。'
            }
            {
              '您尚未绑定您的微信帐号'
            }
            <IconButton
              iconStyle={{ width: 18, height: 18, color: primaryColor }}
              style={{ width: 36, height: 36, padding: 8, verticalAlign: 'sub' }}
              tooltip={tooltipWeChat}
              touch
              tooltipPosition="bottom-right"
            >
              <HelpIcon />
            </IconButton>
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

      </div>
    )
  }
}

export default AccountApp
