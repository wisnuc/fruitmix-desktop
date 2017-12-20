import React from 'react'
import i18n from 'i18n'
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
      passwordAgainErrorText: '',
      loading: false
    }

    this.fire = () => {
      this.setState({ loading: true })
      const { apis, op } = this.props
      const cb = (error) => {
        if (error) {
          debug('error', op, error)
          if (op === 'password' && error.message === 'Unauthorized') {
            this.setState({ prePasswordErrorText: i18n.__('Previous Password Wrong'), loading: false })
          } else {
            this.setState({ loading: false })
            this.props.openSnackBar(op === 'createUser' ? i18n.__('Create User Failed') : i18n.__('Modify Account Failed'))
          }
        } else {
          this.props.onRequestClose(true)

          /* clear saved token */
          const uuid = this.props.apis.account.data && this.props.apis.account.data.uuid
          if (['password', 'reset'].includes(op)) {
            const lastDevice = Object.assign({}, global.config.global.lastDevice, { autologin: false })
            this.props.ipcRenderer.send('UPDATE_USER_CONFIG', uuid, { saveToken: null })
            this.props.ipcRenderer.send('SETCONFIG', { lastDevice })
          }

          /* snackbar message */
          this.props.openSnackBar(op === 'createUser' ? i18n.__('Create User Success') : i18n.__('Modify Account Success'))

          /* refresh */
          if (op === 'createUser') this.props.refreshUsers()
          else this.props.refresh()
        }
      }

      if (op === 'createUser') {
        apis.request('adminCreateUser', { username: this.state.username, password: this.state.password }, cb)
      } else if (op === 'username') {
        apis.request('updateAccount', { username: this.state.username }, cb)
      } else if (op === 'password') {
        apis.request('updatePassword', { prePassword: this.state.prePassword, newPassword: this.state.password }, cb)
      } else if (op === 'reset') {
        const { stationID, token } = this.props
        apis.request('updatePassword', { newPassword: this.state.password, stationID, token }, cb)
      }
    }

    this.onKeyDown = (e) => {
      if (e.which === 13 && this.inputOK()) this.fire()
    }
  }

  updateUsername(text) {
    this.setState({ username: text }, () => {
      if (this.state.username.length === 0) {
        this.setState({ usernameErrorText: i18n.__('Empty Name Error') })
      } else if (!validateUsername(text)) {
        this.setState({ usernameErrorText: i18n.__('Invalid Name Error') })
      } else if (!this.props.apis.users || !this.props.apis.users.data) {
        this.setState({ usernameErrorText: '' })
        this.props.openSnackBar(i18n.__('Connection Error'))
      } else if (this.props.apis.users.data.every(u => u.username !== this.state.username)) {
        this.setState({ usernameErrorText: '' })
      } else {
        this.setState({ usernameErrorText: i18n.__('User Name Exist Error') })
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
        this.setState({ prePasswordErrorText: i18n.__('Empty Password Error') })
      } else {
        this.setState({ prePasswordErrorText: '' })
      }
    })
  }

  updatePassword(text) {
    this.setState({ password: text }, () => {
      if (this.state.password.length === 0 && this.state.passwordAgain.length === 0) {
        this.setState({ passwordErrorText: i18n.__('Empty Password Error'), passwordAgainErrorText: '' })
      } else if (this.state.password.length === 0) {
        this.setState({ passwordErrorText: i18n.__('Empty Password Error') })
      } else if (!validatePassword(text)) {
        this.setState({ passwordErrorText: i18n.__('Invalid Password Error') })
      } else if (this.state.password.length > 30) {
        this.setState({ passwordErrorText: i18n.__('Password Too Long Error') })
      } else if (this.state.passwordAgain.length >= this.state.password.length &&
        this.state.passwordAgain !== this.state.password) {
        this.setState({ passwordAgainErrorText: i18n.__('Inconsistent Password Error'), passwordErrorText: '' })
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
        this.setState({ passwordAgainErrorText: i18n.__('Inconsistent Password Error') })
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
    if (this.state.loading) return false
    if (this.props.op === 'username') {
      return this.state.username.length > 0 && !this.state.usernameErrorText
    }
    if (this.props.op === 'password' || this.props.op === 'reset') {
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
          { op === 'username' ? i18n.__('Change Username') :
            op === 'createUser' ? i18n.__('Create New User') :
            op === 'reset' ? i18n.__('Reset Password') :
            i18n.__('Change Password') }
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
                hintText={i18n.__('Username')}
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
          (op === 'password' || op === 'createUser' || op === 'reset') &&
            <div>
              {
                op === 'password' &&
                  <div style={{ height: 56, display: 'flex', marginBottom: 10 }}>
                    <IconBox style={{ marginLeft: -12 }} size={48} icon={CommunicationVpnKey} />
                    <TextField
                      style={{ flexGrow: 1 }}
                      fullWidth
                      hintText={i18n.__('Previous Password Hint')}
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
                <IconBox style={{ marginLeft: -12 }} size={48} icon={['createUser', 'reset'].includes(op) ? CommunicationVpnKey : null} />
                <TextField
                  style={{ flexGrow: 1 }}
                  fullWidth
                  hintText={i18n.__('New Password Hint')}
                  type="password"
                  errorText={this.state.passwordErrorText}
                  onChange={e => this.updatePassword(e.target.value)}
                />
              </div>
              <div style={{ height: 56, display: 'flex' }}>
                <IconBox style={{ marginLeft: -12 }} size={48} icon={null} />
                <TextField
                  fullWidth
                  hintText={i18n.__('New Password Again Hint')}
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
          <FlatButton label={i18n.__('Cancel')} onTouchTap={this.props.onRequestClose} primary />
          <FlatButton label={i18n.__('Confirm')} disabled={!this.inputOK()} onTouchTap={this.fire} primary />
        </div>
      </div>
    )
  }
}

export default ChangeAccountDialog
