import React from 'react'

import muiThemeable from 'material-ui/styles/muiThemeable'
import { TextField } from 'material-ui'
import FlatButton from '../common/FlatButton'
import { sharpCurve, sharpCurveDuration } from '../common/motion'
import Checkmark from '../common/Checkmark'

class LoginBox extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      password: '',
      error: undefined,
      busy: false,
      success: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.uuid !== this.props.uuid) {
      this.setState({
        password: '',
        error: undefined
      })
    }
  }

  onInput (e) {
    let value = e.target.value
    this.setState({ password: value, error: undefined })
  }

  onKeyDown (e) {
    if (e.which === 13 && this.state.password.length) {
      this.login()
    }
  }

  login() {

    let uuid = this.props.uuid
    let username = this.props.username
    let password = this.state.password

    this.props.requestToken(uuid, password, (err, res) => {

      if (err) 
        this.setState({ busy: false, error: err.message })
      else {
        this.setState({ busy: false, success: true })
        setTimeout(() => this.props.success(username, password), 1200)
      }
    })

    this.setState({ busy: true })
  }

  render() {
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
          <div style={{width: '100%', display: 'flex', flexDirection: 'column' }}>     
            <div style={{flex: '0 0 24px'}}/>
            <div style={{
              flex: '0 0 24px',
              fontSize: 13, 
              color:'rgba(0,0,0,0.38)',
              marginBottom: 8
            }}>用户登录</div>
            <div style={{
              flex: '0 0 36px', 
              fontSize: 24, 
              fontWeight: 'medium',
              color: 'rgba(0,0,0,0.87)', 
            }}>
              {this.props.username}
            </div>
            <div style={{flex: '0 0 20px'}}/>
            <div style={{width: '100%', flex: '0 0 48px'}}>
              { this.state.success 
                ? <div style={{width: '100%', display:'flex', alignItems:'center', justifyContent: 'center'}}>
                    <Checkmark color={this.props.muiTheme.palette.primary1Color} delay={300} />
                  </div>
                : <TextField 
                    key={this.props.uuid}
                    fullWidth={true} 
                    hintText='请输入密码' 
                    errorText={this.state.error}
                    type='password'
                    disabled={this.state.busy}
                    ref={input => { input && input.focus() }}
                    onChange={this.onInput.bind(this)}
                    onKeyDown={this.onKeyDown.bind(this)}
                  /> }
            </div>
            <div style={{flex: '0 0 20px'}}/>
            <div style={{width: '100%', flex: '0 0 36px', display: 'flex'}}>
              <div style={{flexGrow: 1}} />
              { !this.state.success &&
              <FlatButton label='取消' primary={true} 
                disabled={this.state.busy}
                onTouchTap={this.props.cancel} 
              /> }
              { !this.state.success &&
              <FlatButton style={{marginRight: -16}} label='确认' primary={true} 
                disabled={this.state.password.length === 0 || this.state.busy}
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

