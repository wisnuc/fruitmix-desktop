import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import ActionAccountBox from 'material-ui/svg-icons/action/account-box'

import Base from './Base'

class Acount extends Base {

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
    return '帐号'
  }

  menuIcon() {
    return ActionAccountBox
  }

  quickName() {
    return '帐号'
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

export default Acount

