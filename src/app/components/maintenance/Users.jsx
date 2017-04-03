import React from 'react'
import { Avatar, Badge, IconButton } from 'material-ui'
import { Account } from './Svg'

export default class Users extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hover: false
    }
    this.toggleHover = () => {
      this.setState({ hover: !this.state.hover })
    }
  }
  render() {
    if (typeof this.props.volume.wisnuc !== 'object') return null // ENOFRUITMIX can't work
    const users = this.props.volume.wisnuc.users
    const divStyle = {
      height: 56,
      display: 'flex',
      alignItems: 'center',
      boxSizing: 'border-box',
      borderRadius: 4,
      fontSize: 14,
      fontWeight: 500,
      marginLeft: 80,
      color: this.props.creatingNewVolume === null ? '#212121' : 'rgba(0,0,0,0.38)'
    }
    if (users) {
      if (users.length === 0) {
        return (
          <div style={divStyle} >已安装
            <span style={{ width: 8, display: 'inline-block' }} />WISNUC
            <span style={{ width: 4, display: 'inline-block' }} />但尚未创建用户
          </div>
        )
      }

      return (
        <div style={divStyle} >WISNUC
          <span style={{ width: 4, display: 'inline-block' }} />已安装
          <Badge
            style={{ verticalAlign: '0%', padding: 0, marginLeft: -4 }}
            badgeContent={users.length}
            secondary
            badgeStyle={{
              fontSize: 13,
              height: 16,
              width: 16,
              backgroundColor: '#BDBDBD',
              color: 'white',
              top: 10,
              right: 4 }}
            onMouseEnter={this.toggleHover}
            onMouseLeave={this.toggleHover}
          >
            <IconButton iconStyle={{ width: 20, height: 20 }}>
              <Account color={'#757575'} />
            </IconButton>
          </Badge>
          <div
            style={{
              transition: 'all 450ms',
              overflow: 'hidden',
              opacity: this.state.hover ? 1 : 0,
              marginTop: this.state.hover ? -4 : 12
            }}
          >
            {users.map(user =>
              <Avatar key={user.username.toString()} size={24} style={{ marginRight: 8 }}>
                {user.username.slice(0, 2).toUpperCase()}
              </Avatar>
              )}
          </div>
        </div>
      )
    }
    return <div />
  }
}
