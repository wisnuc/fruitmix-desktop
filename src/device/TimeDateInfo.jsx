import React from 'react'
import i18n from 'i18n'
import DeviceAccessTime from 'material-ui/svg-icons/device/access-time'

class TimeDate extends React.Component {
  renderList(Icon, titles, values) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%' }}>
        {
          titles.map((title, index) => (
            <div style={{ height: 72, display: 'flex', alignItems: 'center', width: '100%' }} key={title}>
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
    if (!timedate) return <div />

    const Icon = DeviceAccessTime

    /*
      'Local time',
      'Universal time',
      'RTC time',
      'Time zone',
      'NTP synchronized',
      'Network time on'
      'RTC in local TZ'
    */

    const Titles = [
      i18n.__('Universal Time'),
      i18n.__('Local Time'),
      i18n.__('Time Zone'),
      i18n.__('Network Time On'),
      i18n.__('NTP Synchronized'),
      i18n.__('RTC Time'),
      i18n.__('RTC in Local TZ')
    ]

    const Values = [
      timedate['Universal time'],
      timedate['Local time'],
      timedate['Time zone'],
      timedate['Network time on'],
      timedate['NTP synchronized'],
      timedate['RTC time'],
      timedate['RTC in local TZ']
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
