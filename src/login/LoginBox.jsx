import React from 'react'
import i18n from 'i18n'
import { TextField, Checkbox } from 'material-ui'
import muiThemeable from 'material-ui/styles/muiThemeable'

import FlatButton from '../common/FlatButton'
import { sharpCurve, sharpCurveDuration } from '../common/motion'

class LoginBox extends React.Component {
  constructor(props) {
    super(props)
    this.device = this.props.device.mdev
    this.lastDevice = global.config.global.lastDevice || {}

    this.isSameDevice = this.lastDevice.address === this.device.address || this.lastDevice.host === this.device.host ||
      this.lastDevice.lanip === this.device.address

    this.state = {
      password: '',
      saveToken: this.isSameDevice && this.lastDevice.saveToken,
      autologin: this.isSameDevice && this.lastDevice.autologin
    }

    this.handleAutologin = () => {
      if (this.state.autologin) this.setState({ autologin: false })
      else this.setState({ autologin: true, saveToken: true })
    }

    this.handleSaveToken = () => {
      if (this.state.saveToken) {
        this.token = null
        this.setState({ autologin: false, saveToken: false })
      } else this.setState({ saveToken: true })
    }

    this.onInput = (e) => {
      const value = e.target.value
      this.setState({ password: value })
      this.props.device.clearRequest('token')
    }

    this.login = () => {
      const { uuid } = this.props.user
      const password = this.state.password
      this.props.device.request('token', { uuid, password }, (err, data) => {
        if (err) console.log(`login err: ${err}`)
        else {
          console.log('Login !!', uuid, password, this.props.device, this.props.user, data)

          Object.assign(this.props.device.mdev, {
            autologin: this.state.autologin,
            saveToken: this.state.saveToken ? data : null,
            user: this.props.user
          })
          this.props.done('LOGIN', this.props.device, this.props.user)
        }
      })
    }

    this.fakeLogin = () => {
      Object.assign(this.props.device, {
        token: {
          isFulfilled: () => true,
          ctx: this.props.user,
          data: this.token
        }
      })
      Object.assign(this.props.device.mdev, {
        autologin: this.state.autologin,
        saveToken: this.token,
        user: this.props.user
      })
      this.props.done('LOGIN', this.props.device, this.props.user)
    }


    this.onKeyDown = (e) => {
      if (e.which !== 13) return
      if (this.token) this.fakeLogin()
      else if (this.state.password.length) this.login()
    }

    this.passwordMode = () => {
      this.token = null
      this.forceUpdate()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user !== this.props.user) {
      this.setState({ password: '' })
      this.props.device.clearRequest('token')
      this.isSameUser = this.isSameDevice && nextProps.user && this.lastDevice.user && this.lastDevice.user.uuid === nextProps.user.uuid
      const index = global.config.users.findIndex(uc => nextProps.user && (uc.userUUID === nextProps.user.uuid) && uc.saveToken)
      this.token = index > -1 ? global.config.users[index].saveToken : null
      this.setState({
        autologin: this.isSameUser && this.lastDevice.autologin,
        saveToken: this.token
      })
    }
  }


  componentDidMount() {
    console.log('componentDidMount', this.state.autologin, this.state.saveToken)
  }

  render() {
    const { token } = this.props.device
    const busy = token && token.isPending()
    const error = (token && token.isRejected()) ? token.reason().message === 'Unauthorized' ? i18n.__('Wrong Password') : token.reason().message : null
    const success = token && token.isFulfilled()

    // console.log('LoginBox', this.state, this.props)
    // console.log('config', global.config, global)

    // 24 + 24 + 36 + 20 + 48 + 20 + 36 = ???
    return (
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: this.props.open ? 272 : 0,
          backgroundColor: '#FFF',
          paddingLeft: 24,
          paddingRight: 24,
          overflow: 'hidden',
          transition: sharpCurve('height')
        }}
      >
        { this.props.open && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: '0 0 24px' }} />
            <div style={{ flex: '0 0 24px', fontSize: 13, color: 'rgba(0,0,0,0.38)', marginBottom: 8 }} >
              { i18n.__('User Login') }
            </div>
            <div
              style={{
                flex: '0 0 36px',
                fontSize: 24,
                fontWeight: 'medium',
                color: 'rgba(0,0,0,0.87)',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {this.props.user.username}
            </div>
            <div style={{ width: '100%', flex: '0 0 68px', position: 'relative' }}>
              { !success &&
                this.token ?
                  <TextField
                    key={this.props.user.uuid}
                    style={{ position: 'absolute', bottom: 0 }}
                    fullWidth
                    hintText="*********"
                    onTouchTap={this.passwordMode}
                  />
                : <TextField
                  style={{ position: 'absolute', bottom: 0 }}
                  key={this.props.user.uuid}
                  fullWidth
                  hintText={i18n.__('Password Hint')}
                  errorText={error}
                  errorStyle={{ marginTop: -48 }}
                  type="password"
                  disabled={busy}
                  ref={input => input && !this.token && input.focus()}
                  onChange={this.onInput}
                  onKeyDown={this.onKeyDown}
                /> }
            </div>

            <div style={{ width: '100%', flex: '0 0 48px' }}>
              <Checkbox
                label={i18n.__('Remember Password')}
                disableTouchRipple
                labelStyle={{ fontSize: 12, color: 'rgba(0,0,0,0.54)', marginLeft: -9 }}
                iconStyle={{ height: 16, width: 16, marginTop: 2 }}
                checked={!!this.state.saveToken}
                onCheck={() => this.handleSaveToken()}
              />
              <Checkbox
                label={i18n.__('Auto Login')}
                disableTouchRipple
                labelStyle={{ fontSize: 12, color: 'rgba(0,0,0,0.54)', marginLeft: -9 }}
                iconStyle={{ height: 16, width: 16, marginTop: 2 }}
                checked={!!this.state.autologin}
                onCheck={() => this.handleAutologin()}
              />
            </div>
            {
              !success &&
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    height: 52,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end'
                  }}
                >
                  <FlatButton
                    label={i18n.__('Cancel')}
                    primary
                    disabled={busy}
                    onTouchTap={this.props.cancel}
                  />
                  <FlatButton
                    label={i18n.__('Login')}
                    primary
                    disabled={!this.token && (this.state.password.length === 0 || busy)}
                    onTouchTap={() => (this.token ? this.fakeLogin() : this.login())}
                  />
                </div>
            }
          </div>
        )}
      </div>
    )
  }
}

export default muiThemeable()(LoginBox)
