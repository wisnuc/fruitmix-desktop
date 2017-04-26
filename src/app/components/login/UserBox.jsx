import React from 'react'
import ReactDOM from 'react-dom'

import Radium from 'radium'
import ReactTooltip from 'react-tooltip'

import muiThemeable from 'material-ui/styles/muiThemeable'
import { Avatar, TextField, Paper } from 'material-ui'
import FlatButton from '../common/FlatButton'

import { grey100, grey200, grey300, grey400, grey500, grey600,
blueGrey400, blueGrey500, cyan500, cyan300 } from 'material-ui/styles/colors'

import { ipcRenderer } from 'electron'
import { sharpCurve, sharpCurveDuration } from '../common/motion'
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
  },
}

const RadiumAvatar = Radium(Avatar)

class NamedAvatar extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {

    const { style, name, selected, onTouchTap } = this.props

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
                backgroundColor: selected ? cyan300 : grey500,
              }
            }}
            size={36}
            onTouchTap={onTouchTap}
          >
            <div style={{lineHeight: '24px', fontSize: 14}}>
              {name.slice(0, 2).toUpperCase()}
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
    this.state = { selectedIndex: -1, }
  }

  selectUser(index) {

    if (this.state.selectedIndex === -1) {
      this.props.toggleDisplay(() => {
        this.setState({ selectedIndex: index })
      })
    }
    else {
      this.setState({ selectedIndex: index })
      if (index === -1) 
        setTimeout(() => this.props.toggleDisplay(), 300)
    }
  }

  render() {
    
    let users = this.props.device.users.value()

    let user
    if (this.state.selectedIndex !== -1) 
      user = users[this.state.selectedIndex]

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
            { users.map((user, index) => 
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
          <div style={{width: '100%', height: Math.ceil(users.length / 8) * 52 + 16 }}/> 
          <LoginBox
            open={this.state.selectedIndex !== -1}
            device={this.props.device}
            user={user}
            cancel={this.selectUser.bind(this, -1)}
            done={this.props.done}
            ipcRenderer={this.props.ipcRenderer}
          />
        </div>

      </div>
    )
  }
}

export default muiThemeable()(UserBox)

