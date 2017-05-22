import React from 'react'
import Debug from 'debug'
import { TextField } from 'material-ui'
import CommunicationVpnKey from 'material-ui/svg-icons/communication/vpn-key'
import SocialPerson from 'material-ui/svg-icons/social/person'
import FlatButton from '../common/FlatButton'
import IconBox from '../common/IconBox'

const debug = Debug('component:control:Account')

class ChangeAccountDialog extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      maxLength: 16,
      focusFirst: true,
      fullLength: false,
      username: '',
      usernameErrorText: '',
      usernameLengthHint: '0/16',

      password: '',
      passwordAgain: '',
      passwordErrorText: '',
      passwordAgainErrorText: '',

    }

    this.fire = () => {
      const { apis, op } = this.props
      if (op === 'createUser') {
        apis.request('adminCreateUser', {
          username: this.state.username,
          password: this.state.password
        }, (err) => {
          if (!err) {
            this.props.onRequestClose(true)
            this.props.refreshUsers()
            debug('adminCreateUser', this.props)
            this.props.openSnackBar('创建成功')
          } else {
            this.props.openSnackBar(`创建失败：${err.message}`)
          }
        })
      } else {
        const args = {
          uuid: apis.account.data.uuid,
          username: op === 'username' ? this.state.username : undefined,
          password: op === 'password' ? this.state.password : undefined
        }
        apis.request('updateAccount', args, (err) => {
          if (err) {
            debug('err', args, err, err.message)
            this.props.openSnackBar(`修改失败：${err.message}`)
          } else {
            this.props.onRequestClose(true)
            this.props.refresh()
            this.props.openSnackBar('修改成功')
          }
        })
      }
    }
  }

  updateUsername(text) {
    this.setState({ username: text }, () => {
      if (this.state.username.length === 0) {
        this.setState({ usernameErrorText: '用户名不能为空' })
      } else if (!this.props.apis.login || !this.props.apis.login.data) {
        this.setState({ usernameErrorText: '' })
        this.props.openSnackBar('服务器连接错误')
      } else if (this.props.apis.login.data.every(u => u.username !== this.state.username)) {
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

  updatePassword(text) {
    this.setState({ password: text }, () => {
      if (this.state.password.length === 0) {
        this.setState({ passwordErrorText: '密码不能为空' })
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
    if (this.props.op === 'username') {
      return this.state.username.length > 0 && !this.state.usernameErrorText
    }
    if (this.props.op === 'password') {
      return this.state.password.length > 0 && this.state.password === this.state.passwordAgain
    }
    if (this.props.op === 'createUser') {
      return this.state.username.length > 0 &&
        !this.state.usernameErrorText &&
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
                ref={(input) => {
                  if (input && this.state.focusFirst) {
                    input.focus()
                    this.setState({ focusFirst: false })
                  }
                }}
              />
            </div>
        }

        {/* password */}
        {
          (op === 'password' || op === 'createUser') &&
            <div>
              <div style={{ height: 56, display: 'flex', marginBottom: 10 }}>
                <IconBox style={{ marginLeft: -12 }} size={48} icon={CommunicationVpnKey} />
                <TextField
                  style={{ flexGrow: 1 }}
                  fullWidth
                  hintText="输入新密码"
                  maxLength={this.state.maxLength}
                  type="password"
                  errorText={this.state.passwordErrorText}
                  onChange={e => this.updatePassword(e.target.value)}
                  ref={(input) => {
                    if (input && this.state.focusFirst && (op !== 'createUser')) {
                      input.focus()
                      this.setState({ focusFirst: false })
                    }
                  }}
                />
              </div>
              <div style={{ height: 56, display: 'flex' }}>
                <IconBox style={{ marginLeft: -12 }} size={48} icon={null} />
                <TextField
                  fullWidth
                  hintText="再次输入密码"
                  maxLength={this.state.maxLength}
                  type="password"
                  errorText={this.state.passwordAgainErrorText}
                  onChange={e => this.updatePasswordAgain(e.target.value, 'onChange')}
                  onBlur={e => this.updatePasswordAgain(e.target.value, 'onBlur')}
                />
              </div>
            </div>
        }
        <div style={{ height: 24 }} />
        {/* button */}
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <FlatButton label="取消" onTouchTap={this.props.onRequestClose} primary />
          <FlatButton label="确认" disabled={!this.inputOK()} onTouchTap={this.fire} primary />
        </div>
      </div>
    )
  }
}

export default ChangeAccountDialog
