import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import ActionDns from 'material-ui/svg-icons/action/dns'

import Base from './Base'

class DeviceInfo extends Base {

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
    return '设备信息'
  }

  menuIcon() {
    return ActionDns
  }

  quickName() {
    return '设备'
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

export default DeviceInfo

