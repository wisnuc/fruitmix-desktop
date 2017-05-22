import React from 'react'
import DeviceAccessTime from 'material-ui/svg-icons/device/access-time'
import { CircularProgress } from 'material-ui'

import request from 'superagent'

class TimeDate extends React.Component {

  constructor(props) {
    super(props)
  }

  renderList(Icon, titles, values) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%' }}>
        {
          titles.map((title, index) => (
            <div style={{ height: 72, display: 'flex', alignItems: 'center', width: '100%' }} >
              <div style={{ flex: '0 0 24px' }} />
              <div style={{ flex: '0 0 56px' }} >
                { !index && <Icon color={this.props.primaryColor} /> }
              </div>
              <div>
                <div style={{ fontSize: 16, flex: '0 0 240px', color: 'rgba(0, 0, 0, 0.87)' }}> { values[index] }</div>
                <div style={{ fontSize: 14, flex: '0 0 240px', color: 'rgba(0, 0, 0, 0.54)' }}> { title } </div>
              </div>
              <div style={{ flexGrow: 1 }} />
            </div>
          ))
        }
      </div>
    )
  }

  render() {
    const timedate = this.props.timedate
    if (!timedate) return <CircularProgress />

    const Icon = DeviceAccessTime

    /*
      'Local time',
      'Universal time',
      'RTC time',
      'Time zone',
      'NTP synchronized',
      'Network time on'
    */

    const Titles = [
      '本地时间',
      '世界时',
      'RTC 时间',
      '时区',
      '已完成时间同步',
      '使用网络时间'
    ]

    const Values = [
      timedate['Local time'],
      timedate['Universal time'],
      timedate['RTC time'],
      timedate['Time zone'],
      timedate['NTP synchronized'],
      timedate['Network time on']
    ]
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div style={{ height: 16 }} />
        { this.renderList(Icon, Titles, Values) }
      </div>
    )
  }
}

export default TimeDate
