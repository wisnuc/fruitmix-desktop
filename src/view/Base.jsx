import React from 'react'

import { teal600, indigo600, lightBlue600, cyan500, green600, lightGreen700, lime800, blue500, blueGrey400, blueGrey500, brown500, purple300, deepPurple500, indigo300, red400, orange600, pinkA200 } from 'material-ui/styles/colors'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import { IconButton } from 'material-ui'
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
    const group = this.navGroup()
    switch (group) {
      case 'file':
        return teal600
      case 'media':
        return lightBlue600
      case 'trash':
        return lime800
      case 'physical':
        return lightGreen700
      case 'docker':
        return blueGrey500
      case 'settings':
        // return deepPurple500
        return blueGrey400
      case 'device':
        return deepPurple500
      case 'update':
        return blueGrey400
      case 'download':
        return indigo600
      case 'other':
        return deepPurple500
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

  hasQuickNav() {
    return true
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
    return 360
  }

  detailIcon() {
    return null
  }

  renderTitle({ style }) {
    return <div style={style}>{this.menuName()}</div>
  }

  renderNavigationMenu({ style, onTouchTap }) {
    return (
      <div style={style}>
        <IconButton onTouchTap={onTouchTap}>
          <NavigationMenu color="#FFF" />
        </IconButton>
      </div>
    )
  }

  renderToolBar({ style }) {
    return <div style={style} />
  }

  renderSnackBar({ style }) {
    return <div style={style} />
  }

  renderDetail({ style }) {
    return <div style={style} />
  }

  renderContent() {
    return <div>placeholder</div>
  }
}

export default Base

