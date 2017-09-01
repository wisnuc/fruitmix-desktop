import React from 'react'
import Debug from 'debug'
import { TextField } from 'material-ui'
import CommunicationVpnKey from 'material-ui/svg-icons/communication/vpn-key'
import SocialPerson from 'material-ui/svg-icons/social/person'
import FlatButton from '../common/FlatButton'
import IconBox from '../common/IconBox'
import { validateUsername, validatePassword } from '../common/validate'

const debug = Debug('component:control:Account')

class ChangeAccountDialog extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      maxLength: 16,
      maxLengthPassword: 30,
      focusFirst: true,
      fullLength: false,
      username: '',
      usernameErrorText: '',
      usernameLengthHint: '0/16',
      prePassword: '',
      prePasswordErrorText: '',
      password: '',
      passwordAgain: '',
      passwordErrorText: '',
      passwordAgainErrorText: ''
    }

    this.fire = () => {
      const { apis, op } = this.props
      const cb = (error) => {
        if (error) {
          debug('error', op, error)
          // this.props.openSnackBar(`修改失败：${error.message}`)
          this.props.openSnackBar(`修改失败`)
        } else {
          this.props.onRequestClose(true)
          op === 'createUser' ? this.props.refreshUsers() : this.props.refresh()
          this.props.openSnackBar(op === 'createUser' ? '创建成功' : '修改成功')
        }
      }

      if (op === 'createUser') {
        apis.request('adminCreateUser', { username: this.state.username, password: this.state.password }, cb)
      } else if (op === 'username') {
        apis.request('updateAccount', { username: this.state.username }, cb)
      } else if (op === 'password') {
        apis.request('updatePassword', { prePassword: this.state.prePassword, newPassword: this.state.password }, cb)
      }
    }

    this.check = () => {
      const { apis, op } = this.props
      if (op === 'password') {
        const args = {
          uuid: apis.account.data.uuid,
          password: this.state.prePassword
        }
        apis.request('getToken', args, (err) => {
          if (err) {
            debug('err', args, err, err.message)
            if (err.message === 'Unauthorized') {
              this.props.openSnackBar('修改失败：原密码错误')
            } else {
              // this.props.openSnackBar(`修改失败：${err.message}`)
              this.props.openSnackBar(`修改失败`)
            }
          } else {
            this.fire()
          }
        })
      } else {
        this.fire()
      }
    }

    this.onKeyDown = (e) => {
      if (e.which === 13 && this.inputOK()) this.check()
    }
  }

  updateUsername(text) {
    this.setState({ username: text }, () => {
      if (this.state.username.length === 0) {
        this.setState({ usernameErrorText: '用户名不能为空' })
      } else if (!validateUsername(text)) {
        this.setState({ usernameErrorText: '用户名不合法' })
      } else if (!this.props.apis.users || !this.props.apis.users.data) {
        this.setState({ usernameErrorText: '' })
        this.props.openSnackBar('服务器连接错误')
      } else if (this.props.apis.users.data.every(u => u.username !== this.state.username)) {
        this.setState({ usernameErrorText: '' })
      } else {
        this.setState({ usernameErrorText: '用户名已存在' })
      }
      this.setState({ usernameLengthHint: `${this.state.username.length}/16` })
      if (this.state.username.length === this.state.maxLength) {
        this.setState({ fullLength: true })
      } else {
        this.setState({ fullLength: false })
      }
    })
  }

  updatePrePassword(text) {
    this.setState({ prePassword: text }, () => {
      if (this.state.prePassword.length === 0) {
        this.setState({ prePasswordErrorText: '密码不能为空' })
      } else {
        this.setState({ prePasswordErrorText: '' })
      }
    })
  }

  updatePassword(text) {
    this.setState({ password: text }, () => {
      if (this.state.password.length === 0 && this.state.passwordAgain.length === 0) {
        this.setState({ passwordErrorText: '密码不能为空', passwordAgainErrorText: '' })
      } else if (this.state.password.length === 0) {
        this.setState({ passwordErrorText: '密码不能为空' })
      } else if (!validatePassword(text)) {
        this.setState({ passwordErrorText: '密码不合法' })
      } else if (this.state.password.length > 30) {
        this.setState({ passwordErrorText: '密码不能超过30位' })
      } else if (this.state.passwordAgain.length >= this.state.password.length &&
        this.state.passwordAgain !== this.state.password) {
        this.setState({ passwordAgainErrorText: '两次密码不一致', passwordErrorText: '' })
      } else if (this.state.passwordAgain === this.state.password) {
        this.setState({ passwordAgainErrorText: '', passwordErrorText: '' })
      } else {
        this.setState({ passwordErrorText: '' })
      }
    })
  }

  updatePasswordAgain(text, status) {
    this.setState({ passwordAgain: text }, () => {
      if ((status === 'onChange' &&
        this.state.passwordAgain.length >= this.state.password.length &&
        this.state.passwordAgain !== this.state.password) ||
        (status === 'onBlur' && this.state.passwordAgain !== this.state.password)) {
        this.setState({ passwordAgainErrorText: '两次密码不一致' })
      } else {
        this.setState({ passwordAgainErrorText: '' })
      }
    })
  }

  inputOK() {
    if (this.state.usernameErrorText || this.state.passwordAgainErrorText
      || this.state.passwordErrorText || this.state.prePasswordErrorText) {
      return false
    }
    if (this.props.op === 'username') {
      return this.state.username.length > 0 && !this.state.usernameErrorText
    }
    if (this.props.op === 'password') {
      return this.state.password.length > 0 && this.state.password === this.state.passwordAgain
    }
    if (this.props.op === 'createUser') {
      return this.state.username.length > 0 &&
        this.state.password.length > 0 &&
        this.state.password === this.state.passwordAgain
    }
    return false
  }

  render() {
    const { op } = this.props
    return (
      <div style={{ width: 336, padding: '24px 24px 0px 24px' }}>
        {/* title */}
        <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>
          { op === 'username' ? '修改用户名' : op === 'createUser' ? '创建新用户' : '修改密码' }
        </div>
        <div style={{ height: 56 }} />

        {/* username */}
        {
          (op === 'username' || op === 'createUser') &&
            <div style={{ height: 56, display: 'flex', marginBottom: 10, position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  bottom: -3,
                  right: 3,
                  fontSize: 12,
                  color: this.state.fullLength ? 'rgb(244, 67, 54)' : 'rgb(103, 58, 183)'
                }}
              >
                {this.state.usernameLengthHint}
              </span>
              <IconBox style={{ marginLeft: -12 }} size={48} icon={SocialPerson} />
              <TextField
                fullWidth
                hintText="用户名"
                maxLength={this.state.maxLength}
                errorText={this.state.usernameErrorText}
                onChange={e => this.updateUsername(e.target.value)}
                onBlur={e => this.updateUsername(e.target.value)}
                ref={(input) => {
                  if (input && this.state.focusFirst) {
                    input.focus()
                    this.setState({ focusFirst: false })
                  }
                }}
                onKeyDown={this.onKeyDown}
              />
            </div>
        }

        {/* password */}
        {
          (op === 'password' || op === 'createUser') &&
            <div>
              {
                op === 'password' &&
                  <div style={{ height: 56, display: 'flex', marginBottom: 10 }}>
                    <IconBox style={{ marginLeft: -12 }} size={48} icon={CommunicationVpnKey} />
                    <TextField
                      style={{ flexGrow: 1 }}
                      fullWidth
                      hintText="输入原密码"
                      type="password"
                      errorText={this.state.prePasswordErrorText}
                      onChange={e => this.updatePrePassword(e.target.value)}
                      onBlur={e => this.updatePrePassword(e.target.value)}
                      ref={(input) => {
                        if (input && this.state.focusFirst && (op !== 'createUser')) {
                          input.focus()
                          this.setState({ focusFirst: false })
                        }
                      }}
                    />
                  </div>
              }
              <div style={{ height: 56, display: 'flex', marginBottom: 10 }}>
                <IconBox style={{ marginLeft: -12 }} size={48} icon={ op === 'createUser' ? CommunicationVpnKey : null } />
                <TextField
                  style={{ flexGrow: 1 }}
                  fullWidth
                  hintText="输入新密码"
                  type="password"
                  errorText={this.state.passwordErrorText}
                  onChange={e => this.updatePassword(e.target.value)}
                />
              </div>
              <div style={{ height: 56, display: 'flex' }}>
                <IconBox style={{ marginLeft: -12 }} size={48} icon={null} />
                <TextField
                  fullWidth
                  hintText="再次输入新密码"
                  type="password"
                  errorText={this.state.passwordAgainErrorText}
                  onChange={e => this.updatePasswordAgain(e.target.value, 'onChange')}
                  onBlur={e => this.updatePasswordAgain(e.target.value, 'onBlur')}
                  onKeyDown={this.onKeyDown}
                />
              </div>
            </div>
        }
        <div style={{ height: 24 }} />
        {/* button */}
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
          <FlatButton label="取消" onTouchTap={this.props.onRequestClose} primary />
          <FlatButton label="确认" disabled={!this.inputOK()} onTouchTap={this.check} primary />
        </div>
      </div>
    )
  }
}

export default ChangeAccountDialog
