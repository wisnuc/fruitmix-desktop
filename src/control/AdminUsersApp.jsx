import React from 'react'
import i18n from 'i18n'
import { clipboard } from 'electron'
import Debug from 'debug'
import { Avatar, Divider, FloatingActionButton, Toggle, TextField, Popover, Menu, MenuItem } from 'material-ui'
import CommunicationVpnKey from 'material-ui/svg-icons/communication/vpn-key'
import SocialPersonAdd from 'material-ui/svg-icons/social/person-add'
import CircleIcon from 'material-ui/svg-icons/toggle/radio-button-checked'
import DeltaIcon from 'material-ui/svg-icons/navigation/arrow-drop-down'
import DialogOverlay from '../common/DialogOverlay'
import ChangeAccountDialog from './ChangeAccountDialog'
import FlatButton from '../common/FlatButton'
import IconBox from '../common/IconBox'
import slice from '../common/slice'

const debug = Debug('component:control:AdminUsers: ')

class AdminUsersApp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      password: '',
      confirmPwd: '',
      createNewUser: false,
      resetPwd: false,
      randomPwd: false,
      disableUser: false,
      changeAuth: false,
      open: false // open menu
    }

    this.toggleDialog = (op, user) => {
      debug('this.toggleDialog', op, user && user.username)
      this.setState({ [op]: !this.state[op], user, open: false, anchorEl: null })
    }

    this.toggleMenu = (event, user) => {
      if (!this.state.open && event && event.preventDefault) event.preventDefault()
      this.setState({ open: !this.state.open, anchorEl: event.currentTarget, user })
    }

    this.toggleAuth = () => {
      this.setState({ changeAuth: false }, () => this.updateAccount({ isAdmin: !this.state.user.isAdmin }))
    }

    this.disableUser = () => {
      this.setState({ disableUser: false }, () => this.updateAccount({ disabled: !this.state.user.disabled }))
    }

    this.resetPwd = () => {
      debug('this.resetPwd', this.state.user)
      this.setState({ resetPwd: false, confirmPwd: 'resetPwd' })
    }

    this.copyText = () => {
      clipboard.writeText('145343')
      this.props.openSnackBar(i18n.__('Copy Text Success'))
    }

    this.updatePassword = (password) => {
      this.setState({ password })
    }

    this.updateAccount = (op) => {
      const args = Object.assign({ userUUID: this.state.user.uuid }, op)
      this.props.apis.request('adminUpdateUsers', args, (err) => {
        if (err) {
          debug('err', args, err, err.message)
          this.props.openSnackBar(i18n.__('Update Account Failed'))
        } else {
          this.props.refreshUsers()
          this.setState({ confirmPwd: '' })
          this.props.openSnackBar(i18n.__('Update Account Success'))
        }
      })
    }
  }

  renderUserRow(user) {
    let avatarUrl = null
    let nickName = ''
    const index = global.config.users.findIndex(uc => uc && uc.userUUID === user.uuid && uc.weChat)
    if (index > -1) {
      const weChatInfo = global.config.users[index].weChat
      avatarUrl = weChatInfo.avatarUrl
      nickName = weChatInfo.nickName
    }

    const userLabel = user.isFirstUser ? i18n.__('Super Admin') : user.disabled ? i18n.__('Disabled') :
      user.isAdmin ? i18n.__('Admin User') : i18n.__('Normal User')

    return (
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          fontSize: 14,
          color: user.disabled ? 'rgba(0,0,0,0.54)' : 'rgba(0,0,0,0.87)'
        }}
        key={user.uuid}
      >
        <div style={{ flex: '0 0 32px' }} />
        <div style={{ flex: '0 0 40px' }}>
          {
            avatarUrl ?
              <div style={{ borderRadius: 20, width: 40, height: 40, overflow: 'hidden' }}>
                <img width={40} height={40} alt="" src={avatarUrl} />
              </div> :
              <Avatar>{ slice(user.username, 0, 2).toUpperCase() }</Avatar>
          }
        </div>
        <div style={{ flex: '0 0 32px' }} />
        <div style={{ flex: '0 0 320px' }}>{ user.username }</div>

        <div style={{ flex: '0 0 140px', display: 'flex', alignItems: 'center ' }}>
          <FlatButton
            label={userLabel}
            labelStyle={{ fontSize: 14, color: 'rgba(0,0,0,0.54)', textTransform: '' }}
            labelPosition="before"
            onTouchTap={event => !user.disabled && this.toggleMenu(event, user)}
            style={{ marginLeft: -4 }}
            disabled={user.isFirstUser || user.disabled || (!this.props.apis.account.data.isFirstUser)}
            icon={user.isFirstUser || user.disabled || (!this.props.apis.account.data.isFirstUser) ? <div /> : <DeltaIcon />}
          />
        </div>

        <div style={{ flex: '0 0 160px' }}>{ user.global && user.global.wx ? i18n.__('Yes') : i18n.__('No') }</div>
        <div style={{ flex: '0 0 256px' }}>{ nickName || '-' }</div>
        <div style={{ flex: '0 0 56px' }} />
        <div style={{ flex: '0 0 56px' }} />
        {/*
        <div style={{ flex: '0 0 116px', textAlign: 'left' }}>
          {
            user.isFirstUser
            ? <div />
            : <FlatButton
              label=i18n.__('Reset Password')
              onTouchTap={() => this.toggleDialog('resetPwd', user)}
              primary
              disabled={user.nologin}
            />
          }
        </div>
        */}
        <div style={{ flex: '0 0 50px' }}>
          {
            user.isFirstUser || !this.props.apis.account.data.isFirstUser
            ? <div />
            : <Toggle
              toggled={!user.disabled}
              onToggle={() => this.toggleDialog('disableUser', user)}
            />
          }
        </div>
      </div>
    )
  }

  render() {
    const { users, apis, refreshUsers, openSnackBar } = this.props
    if (!users) return <div />
    debug('this.props', this.props, users)
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <FloatingActionButton
          style={{ position: 'absolute', top: -36, left: 24, zIndex: 200 }}
          secondary
          onTouchTap={() => this.toggleDialog('createNewUser')}
        >
          <SocialPersonAdd />
        </FloatingActionButton>
        <div style={{ overflow: 'auto', height: '100%' }}>
          <div style={{ height: 48, display: 'flex', alignItems: 'center', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)' }}>
            <div style={{ flex: '0 0 104px' }} />
            <div style={{ flex: '0 0 320px' }}>
              { i18n.__('Username') }
            </div>
            <div style={{ flex: '0 0 140px' }}>
              { i18n.__('User Type') }
            </div>
            <div style={{ flex: '0 0 160px' }}>
              { i18n.__('WeChat Bind Status') }
            </div>
            <div style={{ flex: '0 0 256px' }}>
              { i18n.__('WeChat Name') }
            </div>
          </div>
          <div style={{ height: 8 }} />
          <Divider style={{ marginLeft: 104, width: 1143 }} />
          {
            users.reduce((acc, user) => [...acc, this.renderUserRow(user),
              <Divider style={{ marginLeft: 104, width: 1143 }} key={user.username} />], [])
          }
        </div>

        {/* menu */}
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'right', vertical: 'top' }}
          onRequestClose={event => this.toggleMenu(event)}
        >
          { this.state.user &&
          <Menu>
            <MenuItem
              style={{ fontSize: 13, marginLeft: -8 }}
              leftIcon={this.state.user.isAdmin ? <CircleIcon /> : <div />}
              primaryText={i18n.__('Admin User')}
              onTouchTap={() => !this.state.user.isAdmin && this.toggleDialog('changeAuth', this.state.user)}
            />
            <MenuItem
              style={{ fontSize: 13, marginLeft: -8 }}
              leftIcon={!this.state.user.isAdmin ? <CircleIcon /> : <div />}
              primaryText={i18n.__('Normal User')}
              onTouchTap={() => this.state.user.isAdmin && this.toggleDialog('changeAuth', this.state.user)}
            />
          </Menu>
          }
        </Popover>

        {/* createNewUser */}
        <DialogOverlay open={!!this.state.createNewUser} onRequestClose={() => this.toggleDialog('createNewUser')}>
          {
            this.state.createNewUser &&
            <ChangeAccountDialog
              refreshUsers={refreshUsers}
              apis={apis}
              op="createUser"
              openSnackBar={openSnackBar}
            />
          }
        </DialogOverlay>

        {/* reset password dialog */}
        <DialogOverlay open={!!this.state.resetPwd || !!this.state.randomPwd || this.state.confirmPwd === 'resetPwd'}>
          <div>
            {
              this.state.resetPwd &&
                <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}> { i18n.__('Reset Password')} </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}> { i18n.__('Reset Password Text 1')} </div>
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}> { i18n.__('Reset Password Text 2')} </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label={i18n.__('Cancel')} primary onTouchTap={() => this.toggleDialog('resetPwd')} />
                    <FlatButton label={i18n.__('Confirm')} primary onTouchTap={this.resetPwd} />
                  </div>
                </div>
            }

            {
              this.state.randomPwd &&
                <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}> { i18n.__('Random Password') }</div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.87)', fontSize: 34, fontWeight: '500', textAlign: 'center' }}>
                    { '145343' }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label={i18n.__('Copy to Clipboard')} primary onTouchTap={this.copyText} />
                    <div style={{ width: 158 }} />
                    <FlatButton label={i18n.__('Confirm')} primary onTouchTap={() => this.toggleDialog('randomPwd')} />
                  </div>
                </div>
            }
          </div>
        </DialogOverlay>

        {/* disable user dialog */}
        <DialogOverlay open={!!this.state.disableUser || this.state.confirmPwd === 'disableUser'}>
          <div>
            {
              this.state.disableUser &&
                <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>
                    { this.state.user.disabled ? i18n.__('Enable User') : i18n.__('Disable User') }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    {
                      this.state.user.disabled ? i18n.__('Enable User Text') : i18n.__('Disable User Text')
                    }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label={i18n.__('Cancel')} primary onTouchTap={() => this.toggleDialog('disableUser')} />
                    <FlatButton label={i18n.__('Confirm')} primary onTouchTap={this.disableUser} />
                  </div>
                </div>
            }
          </div>
        </DialogOverlay>

        {/* change user auth dialog */}
        <DialogOverlay open={!!this.state.changeAuth || this.state.confirmPwd === 'changeAuth'}>
          <div>
            {
              this.state.changeAuth &&
                <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>
                    { i18n.__('Change User Type') }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    { this.state.user.isAdmin ? i18n.__('Downgrade User Type Text') : i18n.__('Upgrade User Type Text') }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label={i18n.__('Cancel')} primary onTouchTap={() => this.toggleDialog('changeAuth')} />
                    <FlatButton label={i18n.__('Confirm')} primary onTouchTap={this.toggleAuth} />
                  </div>
                </div>
            }
          </div>
        </DialogOverlay>
      </div>
    )
  }
}

export default AdminUsersApp
