import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import ActionSwapVerticalCircle from 'material-ui/svg-icons/action/swap-vertical-circle'
import TrsContainer from '../file/TransmissionContainer'
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
    return ActionSwapVerticalCircle
  }

  appBarStyle() {
    return 'colored'
  }

  prominent() {
    return true
  }

  hasDetail() {
    return false
  }

  detailEnabled() {
    return false
  }

  renderTitle({ style }) {
    return <div style={Object.assign({}, style, { marginLeft: 184 })}>文件传输</div>
  }

  /** renderers **/
  renderContent() {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
        <TrsContainer />
      </div>
    )
  }
}

export default Transmission
