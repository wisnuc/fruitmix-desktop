import React, { PureComponent } from 'react'
import i18n from 'i18n'
import { TextField } from 'material-ui'


class UsernamePassword extends React.PureComponent {
  static State = class State {
    constructor() {
      this.username = ''
      this.password = ''
      this.passwordAgain = ''
    }

    isInputOK() {
      return this.username.length > 0
        && this.password.length > 0
        && this.password === this.passwordAgain
    }
  }

  render() {
    return (
      <div>
        <div>
          <TextField
            key="guide-box-username"
            hintText={i18n.__('Username')}
            value={this.props.state.username}
            maxLength={20}
            onChange={e => this.props.setState({ username: e.target.value })}
          />
        </div>
        <div>
          <TextField
            key="guide-box-password"
            hintText={i18n.__('Password')}
            value={this.props.state.password}
            type="password"
            maxLength={40}
            onChange={e => this.props.setState({ password: e.target.value })}
          />
        </div>
        <div>
          <TextField
            key="guide-box-password-again"
            hintText={i18n.__('Password Again')}
            value={this.props.state.passwordAgain}
            type="password"
            maxLength={40}
            onChange={e => this.props.setState({ passwordAgain: e.target.value })}
          />
        </div>
      </div>
    )
  }
}

export default UsernamePassword
