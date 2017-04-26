import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import DeviceAccessTime from 'material-ui/svg-icons/device/access-time'

import Base from './Base'

class TimeDate extends Base {

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
    return '时间与日期'
  }

  menuIcon() {
    return DeviceAccessTime
  }

  quickName() {
    return '时间'
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

export default TimeDate

