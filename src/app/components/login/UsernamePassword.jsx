import React, { PureComponent } from 'react'
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
          <TextField key='guide-box-username' hintText='用户名' 
            value={this.props.state.username}
            maxLength={20}
            onChange={e => this.props.setState({username: e.target.value })}
          />
        </div>
        <div>
          <TextField key='guide-box-password' hintText='密码' 
            value={this.props.state.password}
            type= 'password'
            maxLength={40}
            onChange={e => this.props.setState({password: e.target.value })}
          />
        </div>
        <div>
          <TextField key='guide-box-password-again' hintText='再次输入密码' 
            value={this.props.state.passwordAgain}
            type='password'
            maxLength={40}
            onChange={e => this.props.setState({passwordAgain: e.target.value })}
          />
        </div>
      </div>
    )
  }
}

export default UsernamePassword

