import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import ActionSwapVerticalCircle from 'material-ui/svg-icons/action/swap-vertical-circle'
import TrsContainer from '../file/TransmissionContainer2'
import Base from './Base'
require('../../../assets/css/main.css')

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


  /** renderers **/
  renderContent() {

    return (
      <div style={{width: '100%', height: '100%', overflow:'auto'}}>
        <TrsContainer/>
      </div>
    )
  }
}

export default Transmission

