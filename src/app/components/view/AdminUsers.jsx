import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import { Avatar, Divider, FloatingActionButton, Paper } from 'material-ui'

import ActionSupervisorAccount from 'material-ui/svg-icons/action/supervisor-account'
import ContentAdd from 'material-ui/svg-icons/content/add'
import SocialPersonAdd from 'material-ui/svg-icons/social/person-add'

import FlatButton from '../common/FlatButton'
import Base from './Base'

class AdminUsers extends Base {

  constructor(ctx) {
    super(ctx)
    this.state = {}
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

  showQuickNav() {
    return true
  }

  prominent() {
    return true
  }

  renderTitle({style}) {
    return <div style={Object.assign({}, style, { marginLeft: 176 })}>用户列表</div>
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
        <FloatingActionButton style={{position: 'absolute', top: -28, left: 24}}>
          <SocialPersonAdd />
        </FloatingActionButton>
        <div style={{height: 8}} />
        <div style={{height: 48, display: 'flex', alignItems: 'center'}}>
          <div style={{flex: '0 0 104px'}} />
          <div style={{flex: '0 0 240px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)'}}>用户名</div>
          <div style={{flex: '0 0 400px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)'}}>UUID</div>
        </div>
        <div style={{height: 8}} />
        <Divider style={{marginLeft: 104}} />
        { users.reduce((acc, user) => 
            [...acc, this.renderUserRow(user), <Divider style={{marginLeft: 104}} />], 
            []) }
      </div>
    )
  }
}

export default AdminUsers

