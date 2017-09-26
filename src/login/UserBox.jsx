import React from 'react'
import Radium from 'radium'
import { Avatar, TextField, Paper } from 'material-ui'
import muiThemeable from 'material-ui/styles/muiThemeable'
import {
  grey100, grey200, grey300, grey400, grey500, grey600, blueGrey400, blueGrey500, cyan500, cyan300
} from 'material-ui/styles/colors'

import LoginBox from './LoginBox'

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
  }
}

const RadiumAvatar = Radium(Avatar)

class NamedAvatar extends React.Component {
  render() {
    const { style, name, selected, onTouchTap, uuid } = this.props
    let avatarUrl = null
    const index = global.config.users.findIndex(uc => uc && uc.userUUID === uuid && uc.weChat)
    if (index > -1) avatarUrl = global.config.users[index].weChat.avatarUrl
    return (
      <div style={style}>
        <div style={styles.flexCenter}>
          <RadiumAvatar
            style={{
              transition: 'all 150ms',
              color: selected ? '#FFF' : 'rgba(0,0,0,0.54)',
              backgroundColor: selected ? cyan300 : grey300,

              ':hover': {
                color: '#FFF',
                backgroundColor: selected ? cyan300 : grey500
              },
              cursor: 'pointer'
            }}
            size={36}
            onTouchTap={onTouchTap}
          >
            <div style={{ lineHeight: '24px', fontSize: 14 }}>
              {
                avatarUrl ?
                  <div style={{ borderRadius: 16, width: 32, height: 32, overflow: 'hidden' }}>
                    <img width={32} height={32} alt="" src={avatarUrl} />
                  </div> :
                name.slice(0, 2).toUpperCase()
              }
            </div>
          </RadiumAvatar>
        </div>
      </div>
    )
  }
}

class UserBox extends React.Component {

  constructor(props) {
    super(props)
    this.state = { selectedIndex: -1 }
  }

  selectUser(index) {
    if (this.state.selectedIndex === -1) {
      this.props.toggleDisplay(() => {
        this.setState({ selectedIndex: index })
      })
    } else {
      this.setState({ selectedIndex: index })
      if (index === -1) { setTimeout(() => this.props.toggleDisplay(), 300) }
    }
  }

  render() {
    const users = this.props.device.users.value().filter(u => !u.disabled)

    let user
    if (this.state.selectedIndex !== -1) { user = users[this.state.selectedIndex] }

    return (
      <div key="login-user-box" style={this.props.style}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            boxSizing: 'border-box',
            width: '100%',
            paddingLeft: 8,
            paddingRight: 8,
            backgroundColor: this.state.selectedIndex > -1 ? '#FFFFFF' : '#FAFAFA',
            maxHeight: 172,
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          <div style={{ ...styles.flexWrap, padding: 8 }}>
            { users.map((user, index) =>
              <NamedAvatar
                key={user.uuid}
                style={{ margin: users.length > 21 ? 6 : 7 }}
                name={user.username}
                uuid={user.uuid}
                selected={index === this.state.selectedIndex}
                onTouchTap={this.selectUser.bind(this, index)}
              />)}
          </div>
        </div>

        <div style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 0, paddingRight: 0 }}>
          <div style={{ width: '100%', height: Math.ceil(users.length / 7) * 52 + 16, maxHeight: 172 }} />
          <LoginBox
            open={this.state.selectedIndex !== -1}
            device={this.props.device}
            user={user}
            cancel={this.selectUser.bind(this, -1)}
            done={this.props.done}
          />
        </div>

      </div>
    )
  }
}

export default muiThemeable()(UserBox)

