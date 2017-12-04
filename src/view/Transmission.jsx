import React, { Component, PureComponent } from 'react'
import i18n from 'i18n'
import Radium from 'radium'
import { ipcRenderer } from 'electron'

import ActionSwapVerticalCircle from 'material-ui/svg-icons/action/swap-vertical-circle'
import TrsContainer from '../file/TransmissionContainer'
import Base from './Base'

class Transmission extends Base {
  constructor(ctx) {
    super(ctx)
    this.state = {}
  }

  navEnter() {
    ipcRenderer.send('GET_TRANSMISSION')
  }

  navGroup() {
    return 'file'
  }

  menuName() {
    return i18n.__('Transmission Menu Name')
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
    return <div style={Object.assign({}, style, { marginLeft: 184 })}>{ i18n.__('Transmission Title') }</div>
  }

  renderContent({ navToDrive }) {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
        <TrsContainer navToDrive={navToDrive} />
      </div>
    )
  }
}

export default Transmission
