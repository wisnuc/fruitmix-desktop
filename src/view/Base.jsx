import React from 'react'
import i18n from 'i18n'

import { teal600, indigo600, lightBlue600, cyan700, green600, lightGreen700, lime800, blue500, blueGrey400, blueGrey500, brown500, purple300, deepPurple500, indigo300, red400, orange600, pinkA200 } from 'material-ui/styles/colors'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import ErrorIcon from 'material-ui/svg-icons/alert/error'
import { IconButton } from 'material-ui'
import EventEmitter from 'eventemitter3'

class Base extends EventEmitter {
  constructor(ctx) {
    super()
    this.ctx = ctx
    this.state = {}

    this.handleProps = (apis, keys) => {
      /* waiting */
      if (!apis || keys.findIndex(key => !apis[key] || apis[key].isPending()) > -1) return null

      /* handle rejected */
      const rejected = keys.find(key => apis[key].isRejected())
      const reason = rejected && apis[rejected].reason()
      if (rejected && reason !== this.state.error) return this.setState({ error: reason })
      if (rejected) return null

      /* now all keys are fulfilled */
      keys.forEach((key) => {
        const value = apis[key].value()
        if (this.state[key] !== value) this.setState({ [key]: value, error: null })
      })
    }
  }

  setState(props) {
    this.state = Object.assign({}, this.state, props)
    this.emit('updated', this.state)
  }

  forceUpdate() {
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
      case 'box':
        return teal600
      case 'group':
        return teal600
      case 'media':
        return lightBlue600
      case 'public':
        return lightGreen700
      case 'physical':
        return lightGreen700
      case 'docker':
        return blueGrey500
      case 'settings':
        return blueGrey400
      case 'device':
        return deepPurple500
      case 'update':
        return blueGrey400
      case 'download':
        return indigo600
      case 'user':
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

  renderDragItems() {
    return <div />
  }

  renderDefaultError() {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: '#FAFAFA'
          }}
        >
          <ErrorIcon style={{ height: 64, width: 64, color: 'rgba(0,0,0,0.27)' }} />
          <div style={{ fontSize: 20, color: 'rgba(0,0,0,0.27)' }}> { i18n.__('Error in Base Text') } </div>
        </div>
      </div>
    )
  }

  renderContent() {
    return <div>placeholder</div>
  }

  /* render error or content */
  render(props) {
    if (this.state.error) return this.renderDefaultError(props)
    return this.renderContent(props)
  }
}

export default Base
