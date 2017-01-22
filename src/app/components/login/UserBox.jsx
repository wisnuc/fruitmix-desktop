import React from 'react'

import muiThemeable from 'material-ui/styles/muiThemeable'
import { Avatar, TextField, Paper } from 'material-ui'
import FlatButton from '../common/FlatButton'

import { grey50, grey100, grey200, grey300, grey400, grey500, grey600,
blueGrey400, blueGrey500, cyan500, cyan300 } from 'material-ui/styles/colors'

import { ipcRenderer } from 'electron'
import { sharpCurve, sharpCurveDuration } from '../common/motion'

const styles = {

  flexCenter: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },

  flexWrap: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexWrap: 'wrap'
  },
}

const NamedAvatar = ({ style, name, selected, onTouchTap }) => (
  <div style={style}>
    <div style={styles.flexCenter}>
      <Avatar 
        style={{transition: 'all 150ms'}}
        color={selected ? '#FFF' : 'rgba(0,0,0,0.54)'}
        backgroundColor={selected ? cyan300 : grey300}
        size={36}
        onTouchTap={onTouchTap}
      >
        <div style={{lineHeight: '24px', fontSize: 14}}>
          {name.slice(0, 2).toUpperCase()}
        </div>
      </Avatar>
    </div> 
  </div>
)

class LoginBox extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      password: ''
    }
  }

  render() {
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
        { this.state.selectedIndex !== -1 && (
          <div style={{width: '100%', display: 'flex', flexDirection: 'column' }}>     
            <div style={{flex: '0 0 24px'}}/>
            <div style={{
              fontSize: 13, 
              color:'rgba(0,0,0,0.38)',
              height: 24,
              marginBottom: 8
            }}>用户登录</div>
            <div style={{
              fontSize: 24, 
              fontWeight: 'medium',
              color: 'rgba(0,0,0,0.87)', 
            }}>
              {this.props.username}
            </div>
            <div style={{flex: '0 0 20px'}}/>
            <TextField 
              key={this.props.uuid}
              fullWidth={true} 
              hintText='请输入密码' 
              type='password'
              ref={ input => { input && input.focus() }}
              onChange={e => this.inputValue = e.target.value}
              onKeyDown={e => {
                if (e.which === 13) {
                  ipcRenderer.send('login', 
                  this.props.users[this.state.selectedIndex].username, this.inputValue)
                }
              }}
              onBlur={() => {}}
            />
            <div style={{flex: '0 0 20px'}}/>
            <div style={{width: '100%', display: 'flex'}}>
              <div style={{flexGrow: 1}} />
              <FlatButton label='取消' primary={true} onTouchTap={this.props.cancel} />
              <FlatButton style={{marginRight: -16}} label='确认' primary={true} 
                onTouchTap={() => this.props.login(this.state.password, 
                  err => {
                    if (err) {
                    } 
                    else {
                    }
                  })
                }
              />
            </div>
          </div>
        )}
      </div>
    )  
  } 
}

class UserBox extends React.Component {

  constructor(props) {
    super(props)
    this.state = { selectedIndex: -1, }
  }

  selectUser(index) {
    if (index === -1) {
      this.setState({ selectedIndex: -1 })
      setTimeout(() => {
        this.props.onResize('VSHRINK')
        this.props.toggleDim()
      }, sharpCurveDuration * 2)
      return
    }

    if (this.state.selectedIndex === -1) {

      this.props.onResize('VEXPAND')
      this.props.toggleDim()

      setTimeout(() => {
        this.inputValue = ''
        this.setState({ selectedIndex: index})
      }, 300)
    }
    else {
      this.setState({ selectedIndex: index })
    }
  }

  tryLogin(password, callback) {
    
  }

  render() {

    return (
      <div key='login-user-box' style={this.props.style}>
        <Paper 
          style={{
            position: 'absolute',
            top: 0,
            boxSizing: 'border-box', 
            width:'100%', 
            paddingLeft:8, 
            paddingRight:8, 
            backgroundColor: grey100
          }} 
          rounded={false}
        >
          <div style={{...styles.flexWrap, padding: 8}}>
            { this.props.users.map((user, index) => 
              <NamedAvatar 
                key={user.uuid} 
                style={{margin: 8}}
                name={user.username} 
                selected={index === this.state.selectedIndex}
                onTouchTap={this.selectUser.bind(this, index)}
              />)}
          </div>
        </Paper>

        <div style={{width: '100%', boxSizing: 'border-box', paddingLeft: 0, paddingRight: 0}}>
          <div style={{width: '100%', height: Math.ceil(this.props.users.length / 8) * 52 + 16 }}/> 
          <div
            style={{
              boxSizing: 'border-box', 
              width: '100%', 
              height: this.state.selectedIndex !== -1 ? 224 : 0, 
              backgroundColor: '#FFF', 
              paddingLeft: 24, 
              paddingRight: 24, 
              overflow: 'hidden', 
              transition: sharpCurve('height')
            }}
          >
            { this.state.selectedIndex !== -1 && (
              <div style={{width: '100%', display: 'flex', flexDirection: 'column' }}>     
                <div style={{flex: '0 0 24px'}}/>
                <div style={{
                  fontSize: 13, 
                  color:'rgba(0,0,0,0.38)',
                  height: 24,
                  marginBottom: 8
                }}>用户登录</div>
                <div style={{
                  fontSize: 24, 
                  fontWeight: 'medium',
                  color: 'rgba(0,0,0,0.87)', 
                }}>
                  {this.props.users[this.state.selectedIndex].username}
                </div>
                <div style={{flex: '0 0 20px'}}/>
                <TextField 
                  key={this.props.users[this.state.selectedIndex].uuid}
                  fullWidth={true} 
                  hintText='请输入密码' 
                  type='password'
                  ref={ input => { input && input.focus() }}
                  onChange={e => this.inputValue = e.target.value}
                  onKeyDown={e => {
                    if (e.which === 13) {
                      ipcRenderer.send('login', 
                      this.props.users[this.state.selectedIndex].username, this.inputValue)
                    }
                  }}
                  onBlur={() => {}}
                />
                <div style={{flex: '0 0 20px'}}/>
                <div style={{width: '100%', display: 'flex'}}>
                  <div style={{flexGrow: 1}} />
                  <FlatButton label='取消' primary={true} onTouchTap={this.selectUser.bind(this, -1)} />
                  <FlatButton style={{marginRight: -16}} label='确认' primary={true} 
                    onTouchTap={() => {
                      ipcRenderer.send('login', 
                        this.props.users[this.state.selectedIndex].username, this.inputValue) 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default muiThemeable()(UserBox)

