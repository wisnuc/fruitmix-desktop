import React from 'react'

import muiThemeable from 'material-ui/styles/muiThemeable'
import { Paper } from 'material-ui'
import { grey100 } from 'material-ui/styles/colors'
import FlatButton from '../common/FlatButton'


class FirstUser extends React.Component {

  constructor (props) {
    super(props)
  }

  render () {
    return (
      <div>
      </div>
    )
  }
}

class FirstUserBox extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      expanded: false
    }
  }

  render() {
    return (
      <div key='first-user-box' style={this.props.style}>
        <Paper 
          style={{
            position: 'absolute',
            top: 0,
            boxSizing: 'border-box', 
            width:'100%', 
            height: 52,
            paddingLeft:24, 
            paddingRight:8, 
            backgroundColor: grey100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }} 
          rounded={false}
        >
          <div>该设备正常运行，但尚未创建用户</div> 
          <FlatButton label='创建用户' marginRight={-16} />
        </Paper>

        <div style={{width: '100%', boxSizing: 'border-box', paddingLeft: 0, paddingRight: 0}}>
          <div style={{width: '100%', height: 52 }}/> 
        </div>
      </div>
    )
  }
}

/**
          <LoginBox
            open={this.state.selectedIndex !== -1}
            username={user && user.username}
            uuid={user && user.uuid}
            cancel={this.selectUser.bind(this, -1)}
            requestToken={this.props.requestToken}
            success={this.success.bind(this)}
          />
**/

export default muiThemeable()(FirstUserBox)
