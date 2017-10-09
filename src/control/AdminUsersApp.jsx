import React from 'react'
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
      this.setState({ changeAuth: false, confirmPwd: 'changeAuth' })
    }

    this.resetPwd = () => {
      debug('this.resetPwd', this.state.user)
      this.setState({ resetPwd: false, confirmPwd: 'resetPwd' })
    }

    this.disableUser = () => {
      debug('this.resetPwd', this.state.user)
      this.setState({ disableUser: false, confirmPwd: 'disableUser' })
    }

    this.copyText = () => {
      clipboard.writeText('145343')
      this.props.openSnackBar('复制成功')
    }

    this.updatePassword = (password) => {
      this.setState({ password })
    }

    this.updateAccount = (op) => {
      const args = Object.assign({ userUUID: this.state.user.uuid }, op)
      this.props.apis.request('adminUpdateUsers', args, (err) => {
        if (err) {
          debug('err', args, err, err.message)
          this.props.openSnackBar('出现错误，请重试')
        } else {
          this.props.refreshUsers()
          this.setState({ confirmPwd: '' })
          this.props.openSnackBar('更新成功')
        }
      })
    }

    this.getToken = (op) => {
      const args = {
        uuid: this.props.apis.account.data.uuid,
        password: this.state.password
      }

      this.props.apis.request('getToken', args, (err) => {
        if (err) {
          debug('err', args, err, err.message)
          if (err.message === 'Unauthorized') {
            this.props.openSnackBar('密码错误')
          } else {
            this.props.openSnackBar('出现错误，请重试')
          }
        } else if (op === 'disableUser') this.updateAccount({ disabled: !this.state.user.disabled })
        else this.updateAccount({ isAdmin: !this.state.user.isAdmin })
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
    const u = Object.assign({}, user)
    debug('renderUserRow user', user.username)

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

        {/*
        <div style={{ flex: '0 0 140px' }}>
          { user.isFirstUser ? '超级管理员' : user.isAdmin ? '管理员' : '普通用户' }
        </div>
        */}
        <div style={{ flex: '0 0 140px', display: 'flex', alignItems: 'center ' }}>
          <FlatButton
            label={user.isFirstUser ? '超级管理员' : user.disabled ? '已禁用' : user.isAdmin ? '管理员' : '普通用户'}
            labelStyle={{ fontSize: 14, color: 'rgba(0,0,0,0.54)' }}
            labelPosition="before"
            onTouchTap={event => this.toggleMenu(event, user)}
            style={{ marginLeft: -4 }}
            disabled={user.isFirstUser || user.disabled || (!this.props.apis.account.data.isFirstUser)}
            icon={user.isFirstUser || user.disabled || (!this.props.apis.account.data.isFirstUser) ? <div /> : <DeltaIcon />}
          />
        </div>

        <div style={{ flex: '0 0 112px' }}>{ user.global && user.global.wx ? '是' : '否' }</div>
        <div style={{ flex: '0 0 256px' }}>{ nickName || '-' }</div>
        <div style={{ flex: '0 0 56px' }} />
        <div style={{ flex: '0 0 56px' }} />
        {/*
        <div style={{ flex: '0 0 116px', textAlign: 'left' }}>
          {
            user.isFirstUser
            ? <div />
            : <FlatButton
              label="重置密码"
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

  renderConfirmPwd(op) {
    return (
      <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}> 输入管理员密码 </div>
        <div style={{ height: 56 }} />
        <div style={{ height: 56, display: 'flex', marginBottom: 10 }}>
          <IconBox style={{ marginLeft: -12 }} size={48} icon={CommunicationVpnKey} />
          <TextField
            style={{ flexGrow: 1 }}
            fullWidth
            hintText="输入管理员密码"
            type="password"
            onChange={e => this.updatePassword(e.target.value)}
            onBlur={e => this.updatePassword(e.target.value)}
          />
        </div>
        <div style={{ height: 24 }} />
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
          <FlatButton label="取消" primary onTouchTap={() => this.setState({ confirmPwd: '', password: '' })} />
          <FlatButton label="确定" primary onTouchTap={() => this.getToken(op)} disabled={!this.state.password} />
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
          style={{ position: 'absolute', top: -36, left: 24 }}
          secondary
          onTouchTap={() => this.toggleDialog('createNewUser')}
        >
          <SocialPersonAdd />
        </FloatingActionButton>
        <div style={{ overflow: 'auto', height: '100%' }}>
          <div style={{ height: 48, display: 'flex', alignItems: 'center', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)' }}>
            <div style={{ flex: '0 0 104px' }} />
            <div style={{ flex: '0 0 320px' }}>
              设备登录用户名
            </div>
            <div style={{ flex: '0 0 140px' }}>
              设备使用权限
            </div>
            <div style={{ flex: '0 0 112px' }}>
              绑定微信
            </div>
            <div style={{ flex: '0 0 256px' }}>
              微信昵称
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
              primaryText="管理员"
              onTouchTap={() => !this.state.user.isAdmin && this.toggleDialog('changeAuth', this.state.user)}
            />
            <MenuItem
              style={{ fontSize: 13, marginLeft: -8 }}
              leftIcon={!this.state.user.isAdmin ? <CircleIcon /> : <div />}
              primaryText="普通用户"
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
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}> 重置密码 </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>重置密码后，该用户当前密码将会失效。</div>
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    { '确认后，系统会提供随机密码并仅有一次登录时效。用户登录后请立刻修改密码。' }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label="取消" primary onTouchTap={() => this.toggleDialog('resetPwd')} keyboardFocused />
                    <FlatButton label="确定" primary onTouchTap={this.resetPwd} />
                  </div>
                </div>
            }

            {/* render confirm password */}
            { this.state.confirmPwd && this.renderConfirmPwd(this.state.confirmPwd) }

            {
              this.state.randomPwd &&
                <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}> 随机密码 </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.87)', fontSize: 34, fontWeight: '500', textAlign: 'center' }}>
                    { '145343' }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label="复制到剪贴板" primary onTouchTap={this.copyText} />
                    <div style={{ width: 158 }} />
                    <FlatButton label="确定" primary onTouchTap={() => this.toggleDialog('randomPwd')} />
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
                    { this.state.user.disabled ? '启用用户' : '禁用用户' }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    {
                      this.state.user.disabled
                      ? '您启用后，该用户将恢复权限，可登录并访问设备，确定吗？'
                      : '您禁用后，该用户将无法登录并访问设备，确定吗？'
                    }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label="取消" primary onTouchTap={() => this.toggleDialog('disableUser')} keyboardFocused />
                    <FlatButton label="确定" primary onTouchTap={this.disableUser} />
                  </div>
                </div>
            }
            {/* render confirm password */}
            { this.state.confirmPwd && this.renderConfirmPwd(this.state.confirmPwd) }
          </div>
        </DialogOverlay>

        {/* change user auth dialog */}
        <DialogOverlay open={!!this.state.changeAuth || this.state.confirmPwd === 'changeAuth'}>
          <div>
            {
              this.state.changeAuth &&
                <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>
                    { '修改用户权限' }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    {
                      this.state.user.isAdmin
                      ? '确定将此用户降为普通用户吗？'
                      : '确定将此用户设为管理员吗？'
                    }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label="取消" primary onTouchTap={() => this.toggleDialog('changeAuth')} />
                    <FlatButton label="确定" primary onTouchTap={this.toggleAuth} />
                  </div>
                </div>
            }
            {/* render confirm password */}
            { this.state.confirmPwd && this.renderConfirmPwd(this.state.confirmPwd) }
          </div>
        </DialogOverlay>
      </div>
    )
  }
}

export default AdminUsersApp
