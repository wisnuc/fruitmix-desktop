import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import HardwareToys from 'material-ui/svg-icons/hardware/toys'

import Base from './Base'

class FanControl extends Base {

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
    return '风扇控制'
  }

  menuIcon() {
    return HardwareToys
  }

  quickName() {
    return '风扇'
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

export default FanControl

