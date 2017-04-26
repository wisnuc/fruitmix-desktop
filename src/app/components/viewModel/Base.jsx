import React from 'react'

import { teal500, blue500, blueGrey700 } from 'material-ui/styles/colors'
import EventEmitter from 'eventemitter3'


class Base extends EventEmitter {

  constructor(ctx) {
    super()
    this.ctx = ctx
  }

  willReceiveProps(nextProps) {
  }

  navEnter() {
  }

  navLeave() {
  }

  navGroup() {
    return 'unfiled'
  }

  groupColor() {
    let group = this.navGroup()
    switch(group) {
    case 'file':
      return teal500
    case 'media':
      return blue500
    case 'settings':
      return blueGrey700
    default:
      return 'white'
    }
  }

  menuName() {
  }

  menuIcon() {
  }

  quickName() {
    return this.menuName()
  }

  quickIcon() {
    return this.menuIcon()
  }

  // 'light' or 'transparent', no appBarColor required
  // 'colored' or 'dark', should further provide appBarColor
  appBarStyle() {
    return 'light'
  }

  appBarColor() {
    return this.groupColor()
  } 

  primaryColor() {
    return this.groupColor()
  }

  prominent() {
    return false
  }

  hasDetail() {
    return false
  }

  detailEnabled() {
    return true
  }

  detailWidth() {
    return 400
  }

  renderTitle({style}) {
    return <div style={style}>{this.menuName()}</div>
  }

  renderToolBar({style}) {
    return <div style={style} />
  }

  renderDetail() {
    return <div />
  }

  renderContent() {
    return <div>placeholder</div>
  }
}

export default Base

