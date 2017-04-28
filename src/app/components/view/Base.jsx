import React from 'react'

import { teal500, green600, lightGreen700, lime800, blue500, brown500, purple300, deepPurple400, indigo300, red400, orange800 } from 'material-ui/styles/colors'
import { pinkA200 } from 'material-ui/styles/colors'
import EventEmitter from 'eventemitter3'


class Base extends EventEmitter {

  constructor(ctx) {
    super()
    this.ctx = ctx
    this.state = {}
  }

  setState(props) {
    this.state = Object.assign({}, this.state, props)
    this.emit('updated', this.state)
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

  groupPrimaryColor() {
    let group = this.navGroup()
    switch(group) {
    case 'file':
      return teal500
    case 'media':
      return blue500
    case 'other':
      return deepPurple400
    case 'settings':
      return lime800
    default:
      return 'white'
    }
  }

  groupAccentColor() {
    return pinkA200
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
    return this.groupPrimaryColor()
  } 

  primaryColor() {
    return this.groupPrimaryColor()
  }

  accentColor() {
    return this.groupAccentColor()
  }

  prominent() {
    return false
  }

  showQuickNav() {
    return true
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

