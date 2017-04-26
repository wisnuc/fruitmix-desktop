import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import ActionSwapVert from 'material-ui/svg-icons/action/swap-vert'

import Base from './Base'

class Transmission extends Base {

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
    return '文件传输'
  }

  menuIcon() {
    return ActionSwapVert
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

export default Transmission

