import React from 'react'
import i18n from 'i18n'
import Radium from 'radium'
import { Avatar, TextField, Paper, CircularProgress } from 'material-ui'
import muiThemeable from 'material-ui/styles/muiThemeable'
import { grey300, grey500, cyan300 } from 'material-ui/styles/colors'
import { sharpCurve, sharpCurveDuration } from '../common/motion'
import FlatButton from '../common/FlatButton'

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

let isFirst = true // only auto login the first time

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

    this.users = this.props.device.users.value().filter(u => !u.disabled)
    this.device = this.props.device.mdev
    this.lastDevice = global.config && global.config.global.lastDevice || {}
    this.lastUser = this.users.find(u => this.lastDevice.user && (u.uuid === this.lastDevice.user.uuid))

    this.state = {
      selectedIndex: -1,
      auto: isFirst && this.lastUser && this.lastDevice.autologin &&
      (this.lastDevice.address === this.device.address || this.lastDevice.host === this.device.host)
    }

    this.selectUser = (index) => {
      if (this.state.selectedIndex === -1) {
        this.props.toggleDisplay(() => {
          this.setState({ selectedIndex: index })
        })
      } else {
        this.setState({ selectedIndex: index })
        if (index === -1) setTimeout(() => this.props.toggleDisplay(), 300)
      }
    }

    this.cancel = () => {
      clearTimeout(this.timer)
      this.setState({ open: false })
      setTimeout(() => {
        this.setState({ auto: false })
        this.props.toggleDisplay()
      }, 300)
    }

    this.autoLogin = () => {
      console.log('this.autoLogin', this.lastDevice, this.lastUser)
      Object.assign(this.props.device, {
        token: {
          isFulfilled: () => true,
          ctx: this.lastUser,
          data: this.lastDevice.saveToken
        }
      })
      Object.assign(this.props.device.mdev, {
        autologin: true,
        saveToken: this.lastDevice.saveToken,
        user: this.lastUser
      })
      this.setState({ wait: true })
      this.props.done('LOGIN', this.props.device, this.lastUser)
    }
  }

  componentDidMount() {
    isFirst = false
    if (this.state.auto) {
      this.props.toggleDisplay()
      setTimeout(() => this.setState({ open: true }), 300)
      this.timer = setTimeout(() => this.autoLogin(), 2000)
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer)
  }

  renderAvatar(user) {
    const { username, uuid } = user
    let avatarUrl = null
    const index = global.config.users.findIndex(uc => uc && uc.userUUID === uuid && uc.weChat)
    if (index > -1) avatarUrl = global.config.users[index].weChat.avatarUrl
    return (
      <div>
        {
          avatarUrl ?
            <div style={{ borderRadius: 48, width: 96, height: 96, overflow: 'hidden' }}>
              <img width={96} height={96} alt="" src={avatarUrl} />
            </div> :
            <Avatar size={96} >
              { username.slice(0, 2).toUpperCase() }
            </Avatar>
        }
      </div>
    )
  }

  renderAutoLogin(user) {
    return (
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: this.state.open ? 256 : 0, // 32 + 36 + 180 + 52
          backgroundColor: '#FFF',
          paddingLeft: 24,
          paddingRight: 24,
          overflow: 'hidden',
          transition: sharpCurve('height')
        }}
      >
        <div style={{ height: 24 }} />
        <div style={{ height: 24, fontSize: 13, color: 'rgba(0,0,0,0.38)', marginBottom: 8 }} >{ i18n.__('Auto Logining') }</div>
        <div style={{ height: 36, fontSize: 24, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }} >
          {user.username}
        </div>
        <div style={{ width: '100%', height: 112, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={48} thickness={3} />
        </div>
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
          <FlatButton
            label={i18n.__('Cancel')}
            primary
            disabled={!!this.state.wait}
            onTouchTap={this.cancel}
          />
        </div>
      </div>
    )
  }

  render() {
    const users = this.props.device.users.value().filter(u => !u.disabled)
    const userSelected = this.state.selectedIndex > -1 ? users[this.state.selectedIndex] : null
    return (
      <div style={{ width: '100%', transition: 'all 300ms', position: 'relative', height: '100%' }} >
        <div
          style={{
            boxSizing: 'border-box',
            width: '100%',
            paddingLeft: 8,
            paddingRight: 8,
            backgroundColor: this.state.selectedIndex > -1 ? '#FFFFFF' : '#FAFAFA',
            maxHeight: this.state.auto ? 216 : 172,
            overflowY: 'auto',
            transition: 'all 300ms',
            overflowX: 'hidden'
          }}
        >
          {
            this.state.auto ?
              <div style={{ width: '100%', height: this.state.open ? 216 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                { this.renderAvatar(this.lastUser) }
              </div>
              :
              <div style={{ ...styles.flexWrap, padding: 8 }}>
                {
                  users.map((user, index) => (
                    <NamedAvatar
                      key={user.uuid}
                      style={{ margin: users.length > 21 ? 6 : 7 }}
                      name={user.username}
                      uuid={user.uuid}
                      selected={index === this.state.selectedIndex}
                      onTouchTap={() => this.selectUser(index)}
                    />
                  ))
                }
              </div>
          }
        </div>

        {
          this.state.auto ? this.renderAutoLogin(this.lastUser)
            : <div style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 0, paddingRight: 0 }}>
              <LoginBox
                open={this.state.selectedIndex !== -1}
                device={this.props.device}
                user={userSelected}
                cancel={() => this.selectUser(-1)}
                done={this.props.done}
              />
            </div>
        }
      </div>
    )
  }
}

export default muiThemeable()(UserBox)
