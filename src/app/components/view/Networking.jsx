import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import ActionSettingsEthernet from 'material-ui/svg-icons/action/settings-ethernet'

import Base from './Base'

class Ethernet extends Base {

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
    return '网络设置'
  }

  menuIcon() {
    return ActionSettingsEthernet
  }

  quickName() {
    return '网络'
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

export default Ethernet

