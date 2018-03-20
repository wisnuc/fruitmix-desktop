import React from 'react'
import i18n from 'i18n'
import DeviceAccessTime from 'material-ui/svg-icons/device/access-time'
import Base from './Base'
import TimeDateInfo from '../device/TimeDateInfo'

class TimeDate extends Base {
  willReceiveProps (nextProps) {
    this.handleProps(nextProps.selectedDevice, ['timedate'])
  }

  navEnter () {
    this.ctx.props.selectedDevice.request('timedate')
  }

  navGroup () {
    return 'device'
  }

  menuName () {
    return i18n.__('TimeDate Menu Name')
  }

  menuIcon () {
    return DeviceAccessTime
  }

  quickName () {
    return i18n.__('TimeDate Quick Name')
  }

  appBarStyle () {
    return 'colored'
  }

  renderContent () {
    return (
      <TimeDateInfo
        timedate={this.state.timedate}
        primaryColor={this.groupPrimaryColor()}
      />
    )
  }
}

export default TimeDate
