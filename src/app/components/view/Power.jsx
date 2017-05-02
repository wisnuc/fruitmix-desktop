import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import ActionPowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new'

import Base from './Base'
import FlatButton from '../mdc/FlatButton'

class Power extends Base {

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
    return '重启与关机'
  }

  menuIcon() {
    return ActionPowerSettingsNew
  }

  quickName() {
    return '重启关机'
  }

  appBarStyle() {
    return 'colored'
  }

  /** renderers **/
  renderContent() {

    return (
      <div className='mdc-theme-teal' style={{width: '100%', height: '100%'}}>
        <FlatButton />
      </div>
    )
  }
}

export default Power

