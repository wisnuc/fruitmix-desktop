import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import SocialPeople from 'material-ui/svg-icons/social/people'

import Base from './Base'

class User extends Base {

  constructor(ctx) {
    super(ctx)
    this.state = {}
  }

  willReceiveProps(nextProps) { 
  }

  navEnter() {
  }

  navLeave() {
  }

  navGroup() {
    return 'settings'
  }

  menuName() {
    return '用户管理'
  }

  menuIcon() {
    return SocialPeople
  }

  quickName() {
    return '用户'
  }

  appBarStyle() {
    return 'colored'
  }

  /** renderers **/
  renderContent() {

    return (
      <div style={{width: '100%', height: '100%'}}>
        hello
      </div>
    )
  }
}

export default User

