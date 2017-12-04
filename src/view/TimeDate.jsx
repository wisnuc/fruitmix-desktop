import React from 'react'
import i18n from 'i18n'
import DeviceAccessTime from 'material-ui/svg-icons/device/access-time'
import Base from './Base'
import TimeDateInfo from '../device/TimeDateInfo'

class TimeDate extends Base {
  constructor(ctx) {
    super(ctx)
  }

  willReceiveProps(nextProps) {
    // console.log('timedate nextProps', nextProps)
    if (!nextProps.selectedDevice || !nextProps.selectedDevice.timedate) return

    const timedate = nextProps.selectedDevice.timedate
    if (timedate.isPending() || timedate.isRejected()) return

    /* now it's fulfilled */
    const value = timedate.value()

    if (value !== this.state.timedate) {
      this.setState({ timedate: value })
    }
  }

  navEnter() {
    this.ctx.props.selectedDevice.request('timedate')
  }

  navLeave() {
  }

  navGroup() {
    return 'device'
  }

  menuName() {
    return i18n.__('TimeDate Menu Name')
  }

  menuIcon() {
    return DeviceAccessTime
  }

  quickName() {
    return i18n.__('TimeDate Quick Name')
  }

  appBarStyle() {
    return 'colored'
  }

  renderContent() {
    return (
      <TimeDateInfo
        timedate={this.state.timedate}
        primaryColor={this.groupPrimaryColor()}
      />
    )
  }
}

export default TimeDate
