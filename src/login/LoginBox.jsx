import React from 'react'
import { TextField } from 'material-ui'
import muiThemeable from 'material-ui/styles/muiThemeable'

import FlatButton from '../common/FlatButton'
import { sharpCurve, sharpCurveDuration } from '../common/motion'

class LoginBox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      password: '',
      success: 0
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user !== this.props.user) {
      this.setState({ password: '' })
      this.props.device.clearRequest('token')
    }
  }

  onInput(e) {
    const value = e.target.value
    this.setState({ password: value })
    this.props.device.clearRequest('token')
  }

  onKeyDown(e) {
    if (e.which === 13 && this.state.password.length) this.login()
  }

  login() {
    const { uuid, username } = this.props.user
    const password = this.state.password
    this.props.device.request('token', { uuid, password }, (err) => {
      if (err) {
        console.log(`err:${err}`)
      } else {
        console.log('Login !!', uuid, password, this.props.device, this.props.user)
        this.props.done('LOGIN', this.props.device, this.props.user)
      }
    })
  }
  /* auto login */
  autologin() {
    const { uuid, username } = this.props.device.users.value()[0]
    const password = this.state.password
    console.log('uuid', uuid)
    console.log('password', 'w')
    console.log('this.props.device', this.props.device)
    console.log('this.props.user', this.props.user)
    this.props.device.request('token', { uuid, password: 'w' }, (err) => {
      if (err) { console.log(`err:${err}`) } else {
        this.props.done('LOGIN', this.props.device, this.props.user)
      }
    })
  }

  // componentDidMount() { this.autologin() }

  render() {
    const { token } = this.props.device
    const busy = token && token.isPending()
    const error = (token && token.isRejected()) ? token.reason().message === 'Unauthorized' ? '密码错误' : token.reason().message : null
    const success = token && token.isFulfilled()

    // 24 + 24 + 36 + 20 + 48 + 20 + 36 = ???
    return (
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: this.props.open ? 224 : 0,
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
            <div
              style={{
                flex: '0 0 24px',
                fontSize: 13,
                color: 'rgba(0,0,0,0.38)',
                marginBottom: 8
              }}
            >用户登录
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
            <div style={{ flex: '0 0 20px' }} />
            <div style={{ width: '100%', flex: '0 0 48px' }}>
              { !success &&
                <TextField
                  key={this.props.user.uuid}
                  fullWidth
                  hintText="请输入密码"
                  errorText={error}
                  type="password"
                  disabled={busy}
                  ref={(input) => { input && input.focus() }}
                  onChange={this.onInput.bind(this)}
                  onKeyDown={this.onKeyDown.bind(this)}
                /> }
            </div>

            <div
              style={{ width: '100%',
                flex: '0 0 36px',
                display: 'flex',
                position: 'absolute',
                bottom: 16,
                right: 40 }}
            >

              <div style={{ flexGrow: 1 }} />
              { !success &&
              <FlatButton
                label="取消"
                primary
                disabled={busy}
                onTouchTap={this.props.cancel}
              /> }
              { !success &&
              <FlatButton
                style={{ marginRight: -16 }}
                label="确认"
                primary
                disabled={this.state.password.length === 0 || busy}
                onTouchTap={this.login.bind(this)}
              /> }

            </div>
          </div>
        )}
      </div>
    )
  }
}

export default muiThemeable()(LoginBox)
