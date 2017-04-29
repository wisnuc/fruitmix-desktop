import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import { Avatar, Divider, FloatingActionButton, TextField } from 'material-ui'

import SocialPerson from 'material-ui/svg-icons/social/person'
import CommunicationVpnKey from 'material-ui/svg-icons/communication/vpn-key'

import ActionSupervisorAccount from 'material-ui/svg-icons/action/supervisor-account'
import ContentAdd from 'material-ui/svg-icons/content/add'

import SocialPersonAdd from 'material-ui/svg-icons/social/person-add'

import ContextMenu from '../common/ContextMenu'
import DialogOverlay from '../common/DialogOverlay'

import FlatButton from '../common/FlatButton'
import Base from './Base'

class IconBox extends PureComponent {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div style={this.props.style}>
        <div style={{
          width: this.props.size, height: this.props.size, 
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          { this.props.icon && <this.props.icon color='rgba(0,0,0,0.54)' /> }
        </div>
      </div>
    )
  }
}

class NewUserDialog extends PureComponent {

  constructor(props) {
    
    super(props)
    this.state = { 
      focusFirst: true,
      username: '',
      password: '',
      passwordAgain: '',
      message: ''
    }

    this.fire = () => {
      let apis = this.props.apis
      apis.request('adminCreateUser', {
        username: this.state.username,
        password: this.state.password
      }, err => {
        if (!err) this.props.onRequestClose(true)
      })
    }
  }

  updateUsername(text) {
    this.setState({ username: text })
  }

  updatePassword(text) {
    this.setState({ password: text })
  }

  updatePasswordAgain(text) {
    this.setState({ passwordAgain: text })
  }

  inputOK() {
    return this.state.username.length > 0
      && this.state.password.length > 0
      && this.state.password === this.state.passwordAgain 
  }

  render() {
    return (
      <div style={{width: 336, padding: '24px 24px 0px 24px'}}>
        <div style={{fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)'}}>新用户</div>
        <div style={{height: 56, 
          display: 'flex', alignItems: 'center',
          fontSize: 16, color: 'rgba(0,0,0,0.54)'}}>
          { this.state.message }
        </div>

        <div style={{height: 56, display: 'flex'}}>
          <IconBox style={{marginLeft: -12}} size={48} icon={SocialPerson} />
          <TextField 
            fullWidth={true} 
            hintText="用户名" 
            onChange={e => this.updateUsername(e.target.value)} 
            ref={input => {
              if (input && this.state.focusFirst) {
                input.focus()
                this.setState({ focusFirst: false })
              }
            }}
          />
        </div>

        <div style={{height: 56, display: 'flex'}}>
          <IconBox style={{marginLeft: -12}} size={48} icon={CommunicationVpnKey} />
          <TextField 
            style={{flexGrow: 1}}
            fullWidth={true} 
            hintText="输入密码" 
            onChange={e => this.updatePassword(e.target.value)} 
          />
        </div>

        <div style={{height: 56, display: 'flex'}}>
          <IconBox style={{marginLeft: -12}} size={48} icon={null} />
          <TextField 
            fullWidth={true} 
            hintText="再次输入密码" 
            onChange={e => this.updatePasswordAgain(e.target.value)} 
          />
        </div>
        <div style={{height: 24}} />
        <div style={{height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
          <FlatButton label="取消" primary={this.props.primary} secondary={this.props.accent}
            onTouchTap={this.props.onRequestClose} />
          <FlatButton label="确认" primary={this.props.primary} secondary={this.props.accent}
            disabled={!this.inputOK()}
            onTouchTap={this.fire} />
        </div>
      </div>
    )
  }
}

class AdminUsers extends Base {

  constructor(ctx) {
    super(ctx)
    this.state = {
      createNewUser: false,
    }

    this.onCloseDialog = () => {
      this.setState({ createNewUser: false })
    }
  }

  willReceiveProps(nextProps) { 
  }

  navEnter() {
    console.log('adminUsers enter')
    this.ctx.props.apis.request('adminUsers')
  }

  navLeave() {
    console.log('adminUsers leave')
  }

  navGroup() {
    return 'settings'
  }

  menuName() {
    return '用户'
  }

  menuIcon() {
    return ActionSupervisorAccount
  }

  appBarStyle() {
    return 'colored'
  }

  prominent() {
    return true
  }

  renderTitle({style}) {
    return <div style={Object.assign({}, style, { marginLeft: 176 })}>用户</div>
  }

  renderUserRow(user) {
    return (
      <div style={{height: 64, display: 'flex', alignItems: 'center'}}>
        <div style={{flex: '0 0 32px'}} />
        <Avatar>{user.username.slice(0, 1).toUpperCase()}</Avatar>
        <div style={{flex: '0 0 32px'}} />
        <div style={{flex: '0 0 240px', fontSize: 16, color: 'rgba(0,0,0,0.87)'}}>{user.username}</div>
        <div style={{flex: '0 0 400px', fontSize: 16, color: 'rgba(0,0,0,0.54)'}}>{user.uuid}</div>
      </div>
    )
  }

  /** renderers **/
  renderContent() {

    if (this.ctx.props.apis.adminUsers.isPending()) 
      return <div />

    if (this.ctx.props.apis.adminUsers.isRejected()) 
      return (
        <div style={{width: '100%', height: '100%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div>Sorry, 服务器错误；
            <FlatButton label='重试' primary={true} 
              onTouchTap={() => this.ctx.props.apis.request('adminUsers')} />
          </div>
        </div>
      )

    let users = this.ctx.props.apis.adminUsers.value().users
    return (
      <div style={{position: 'relative', width: '100%', height: '100%'}}>
        <FloatingActionButton 
          style={{position: 'absolute', top: -28, left: 24}}
          secondary={true}
          onTouchTap={() => this.setState({createNewUser: true})}
        >
          <SocialPersonAdd />
        </FloatingActionButton>
        <div style={{height: 8}} />
        <div style={{height: 48, display: 'flex', alignItems: 'center'}}>
          <div style={{flex: '0 0 104px'}} />
          <div style={{flex: '0 0 240px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)'}}>
            用户名
          </div>
          <div style={{flex: '0 0 400px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)'}}>
            UUID
          </div>
        </div>
        <div style={{height: 8}} />
        <Divider style={{marginLeft: 104}} />
        { users.reduce((acc, user) => 
            [...acc, this.renderUserRow(user), <Divider style={{marginLeft: 104}} />], 
            []) }

        <DialogOverlay open={!!this.state.createNewUser} onRequestClose={this.onCloseDialog}>
          { this.state.createNewUser && <NewUserDialog primary={true} apis={this.ctx.props.apis} /> }
        </DialogOverlay>
      </div>
    )
  }
}

export default AdminUsers

