import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import HardwareDeveloperBoard from 'material-ui/svg-icons/hardware/developer-board'

import Base from './Base'

class Physical extends Base {

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
    return 'file'
  }

  menuName() {
    return '硬盘'
  }

  menuIcon() {
    return HardwareDeveloperBoard
  }

  quickName() {
    return '硬盘'
  }

  appBarStyle() {
    return 'colored'
  }

  prominent() {
    return true
  }

  hasDetail() {
    return true
  }

  detailEnabled() {
    return true
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

export default Physical

