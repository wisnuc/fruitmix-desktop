import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import DeviceStorage from 'material-ui/svg-icons/device/storage'

import Base from './Base'

class Storage extends Base {

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
    return '存储信息'
  }

  menuIcon() {
    return DeviceStorage
  }

  quickName() {
    return '存储'
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

export default Storage

