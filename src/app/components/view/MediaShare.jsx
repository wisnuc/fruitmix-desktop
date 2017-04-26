import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import ActionDashboard from 'material-ui/svg-icons/action/dashboard'

import Base from './Base'

class MediaShare extends Base {

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
    return 'media'
  }

  menuName() {
    return '照片分享'
  }

  menuIcon() {
    return ActionDashboard
  }

  appBarStyle() {
    return 'colored'
  }

  prominent() {
    return false
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

export default MediaShare

