import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import DeviceAccessTime from 'material-ui/svg-icons/device/access-time'
import { CircularProgress } from 'material-ui'
import Base from './Base'

import request from 'superagent'

class TimeDate extends Base {

  constructor(ctx) {
    super(ctx)

    this.address = ctx.props.selectedDevice.mdev.address
    this.properties = [
      'Local time',
      'Universal time',
      'RTC time',
      'Time zone',
      'NTP synchronized',
      'Network time on'
    ]

    this.state = {data: null}
  }

  willReceiveProps(nextProps) { 
  }

  navEnter() {
    this.timer = setInterval(() => 
      request
        .get(`http://${this.address}:3000/system/timedate`)
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err || !res.ok) {
            return console.log('date time request err', err)
          }
          this.setState(Object.assign({}, this.state, { data: res.body }))
        })     
    , 1000)
  }

  navLeave() {
    clearInterval(this.timer)
    delete this.timer
  }

  navGroup() {
    return 'settings'
  }

  menuName() {
    return '时间与日期'
  }

  menuIcon() {
    return DeviceAccessTime
  }

  quickName() {
    return '时间'
  }

  appBarStyle() {
    return 'colored'
  }

  /** renderers **/
  renderContent() {
    return (
      <div>
        <div style={{paddingTop: 48, paddingLeft: 72, width: 440}}>
          { this.state.data ? 
            this.properties.map(prop => ({
              key: prop,
              value: this.state.data[prop] || '(none)' 
            }))
            .reduce((prev, curr) => [...prev, (
              <div style={{width: '100%', height: 40, display: 'flex', alignItems: 'center',
                fontSize: 14, color: 'rgba(0, 0, 0, 0.87)'}}>
                <div style={{flex: '0 0 160px'}}>{curr.key}</div>
                <div>{curr.value}</div> 
              </div>
            )], []) : <CircularProgress />
          }
        </div>
      </div>
    )
  }
}

export default TimeDate

