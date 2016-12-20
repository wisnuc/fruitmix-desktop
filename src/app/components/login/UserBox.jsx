import React from 'react'
import { Avatar, TextField, Paper, FlatButton } from 'material-ui'

import { ipcRenderer } from 'electron'

const NamedAvatar = ({ style, name, onTouchTap }) => (
  <div style={style}>
    <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start'}}>
      <Avatar onTouchTap={onTouchTap}>{name.slice(0, 2).toUpperCase()}</Avatar>
      { false && <div style={{marginTop: 12, fontSize: 12, fontWeight: 'medium', opacity: 0.7}}>{name}</div> }
    </div> 
  </div>
)


class UserBox extends React.Component {

  constructor(props) {
    super(props)

    this.users = props.users

    this.state = {
      selectedIndex: -1
    }
  }

  renderBlank() {
    return <div style={{width: '100%', height: '100%'}} />
  }

  renderLoginBox() {
    return (
      <div style={{width: '100%', display: 'flex', flexDirection: 'column' }}>     
        <div style={{flex: '0 0 34px'}}/>
        <div style={{fontSize: 34, color: '#000', opacity: 0.54}}>{this.users[this.state.selectedIndex].username}</div>
        <div style={{flex: '0 0 8px'}}/>
        <TextField fullWidth={true} hintText='请输入密码' type='password'
          ref={ input => { input && input.focus() }}
          onChange={e => this.inputValue = e.target.value}
          onKeyDown={e => {
            if (e.which === 13) {
              ipcRenderer.send('login', this.users[this.state.selectedIndex].username, this.inputValue)
            }
          }}
          onBlur={() => {}}
        />
        <div style={{flex: '0 0 34px'}}/>
        <div style={{width: '100%', display: 'flex'}}>
          <div style={{flexGrow: 1}} />
          <FlatButton label='确认' primary={true} 
            onTouchTap={() => {
              ipcRenderer.send('login', this.users[this.state.selectedIndex].username, this.inputValue) 
            }}
          />
          <FlatButton style={{marginLeft: 16}} label='取消' primary={true} 
            onTouchTap={() => {
              this.setState(Object.assign({}, this.state, { selectedIndex: -1 }))
              this.props.onResize('VSHRINK')
            }} 
          />
        </div>
      </div>
    )
  }

  render() {

    return (
      <Paper key='login-user-box' style={this.props.style}>
        <div style={{boxSizing: 'border-box', width:'100%', paddingLeft:64, paddingRight:64, backgroundColor:'#FFF'}}>
          <div style={{width: '100%', height: '100%', paddingTop: 16, display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap'}}>
            { this.users && 
                this.users.map((user, index) => 
                  <NamedAvatar 
                    key={user.uuid} 
                    style={{marginRight:16, marginBottom:16}} 
                    name={user.username} 
                    onTouchTap={() => {

                      this.inputValue = ''
                      this.setState(Object.assign({}, this.state, { selectedIndex: index }))
                      this.props.onResize('VEXPAND')
                    }}

                  />)}
          </div>
        </div>
        <div style={{boxSizing: 'border-box', width: '100%', height: this.state.selectedIndex !== -1 ? 240 : 0, backgroundColor: '#FAFAFA', paddingLeft: 64, paddingRight: 64, overflow: 'hidden', transition: 'all 300ms'}}>
          { this.state.selectedIndex !== -1 && this.renderLoginBox() }
        </div>
      </Paper>
    )
  }
}

export default UserBox

