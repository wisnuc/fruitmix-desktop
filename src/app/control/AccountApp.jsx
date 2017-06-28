import React from 'react'
import Debug from 'debug'
import { Divider, IconButton } from 'material-ui'
import ActionAccountCircle from 'material-ui/svg-icons/action/account-circle'
import Username from 'material-ui/svg-icons/action/perm-identity'
import Password from 'material-ui/svg-icons/action/lock-outline'
import HelpIcon from 'material-ui/svg-icons/action/help-outline'
import FlatButton from '../common/FlatButton'
import DialogOverlay from '../common/DialogOverlay'
import ChangeAccountDialog from './ChangeAccountDialog'

const debug = Debug('component:control:device')

class AccountApp extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      openDialog: '',
      editAvatar: false
    }

    this.toggleDialog = (type) => {
      this.setState({ [type]: !this.state[type] })
    }

    this.onCloseDialog = () => {
      this.setState({ openDialog: '' })
    }
  }

  render() {
    debug('this.props Account', this.props)
    const { account, primaryColor, apis, refresh, openSnackBar } = this.props
    if (!account) return <div />
    const tooltipStyle = {
    }

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
