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
import PureDialog from '../common/PureDialog'
import ChangeAccountDialog from './ChangeAccountDialog'
import WeChatBind from './WeChatBind'
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
  }

  render() {
    const { account, primaryColor, apis, refresh, openSnackBar } = this.props
    if (!account) return <div />
    // debug('this.props account', this.props, global.config.users)

    let avatarUrl = null
    let nickName = ''
    const index = global.config.users.findIndex(uc => uc && uc.userUUID === account.uuid && uc.weChat)
    if (index > -1) {
      const weChatInfo = global.config.users[index].weChat
      avatarUrl = weChatInfo.avatarUrl
      nickName = weChatInfo.nickName
    }

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
        { i18n.__('Your Username %s', account.username) }
        <br />
        { i18n.__('Username Text')}
      </div>
    )

    return (
      <div style={{ paddingLeft: 68, paddingTop: 24 }}>

        {/* avatar */}
        <div style={{ height: 67, marginLeft: -4 }} >
          {
            avatarUrl ? <div style={{ borderRadius: 28, width: 56, height: 56, overflow: 'hidden', marginLeft: 4 }}>
              <img width={56} height={56} alt="" src={avatarUrl} />
            </div> :
            <IconButton
              iconStyle={{ width: 67, height: 67, color: primaryColor }}
              style={{ width: 67, height: 67, padding: 0 }}
              onTouchTap={() => !(account.global && account.global.wx) && this.toggleDialog('editAvatar')}
            >
              <ActionAccountCircle />
            </IconButton>
          }
        </div>

        {/* username */}
        <div style={{ flex: '0 0 560px', fontSize: 16, height: 24, display: 'flex', alignItems: 'center', marginTop: -4 }}>
          { account.username }
        </div>

        <div style={{ height: 24 }} />

        {/* usertype */}
        <div style={{ flex: '0 0 560px' }}>
          <div style={{ fontSize: 14, lineHeight: '26px', color: 'rgba(0, 0, 0, 0.87)', display: 'flex' }}>
            {
              account.isAdmin && account.isFirstUser ? i18n.__('First User Text')
              : account.isAdmin ? i18n.__('Admin User Text') : i18n.__('Normal User Text')
            }
            {
              account.global && account.global.wx ?
                <div style={{ display: 'flex', alignItems: 'center', height: 26 }}>
                  { nickName ? i18n.__('WeChat Bound Text %s', nickName) : i18n.__('WeChat Bound Text') }
                </div>
                :
                <div style={{ display: 'flex', alignItems: 'center', height: 26 }}>
                  { i18n.__('WeChat not Bind Text') }
                  { <FlatButton label={i18n.__('Bind WeChat Title')} onTouchTap={() => this.setState({ weChat: true })} primary /> }
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
              <div> { i18n.__('Username') } </div>
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
                label={i18n.__('Change Username')}
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
              {i18n.__('Password')}
            </div>
          </div>
        </div>

        <div style={{ height: 8 }} />
        <div style={{ display: 'flex', alignItems: 'center' }} >
          <div style={{ display: 'flex', alignItems: 'center' }} >
            <div style={{ flex: '0 0 56px' }} />
            <div style={{ flex: '0 0 560px' }}>
              <FlatButton
                label={i18n.__('Change Password')}
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
              <div style={{ color: 'rgba(0,0,0,0.54)' }}> { i18n.__('Avatar Edit Text') } </div>
              <div style={{ height: 24 }} />
              <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                <FlatButton label={i18n.__('Confirm')} primary onTouchTap={() => this.toggleDialog('editAvatar')} />
              </div>
            </div>
          }
        </DialogOverlay>

        <PureDialog open={!!this.state.weChat} onRequestClose={() => this.setState({ weChat: false })}>
          { this.state.weChat && <WeChatBind {...this.props} onRequestClose={() => this.setState({ weChat: false })} /> }
        </PureDialog>
      </div>
    )
  }
}

export default AccountApp
