import React, { Component, PureComponent } from 'react'
import Radium from 'radium'
import request from 'superagent'
import DeviceStorage from 'material-ui/svg-icons/device/storage'

import Base from './Base'

class Storage extends Base {

  constructor(ctx) {

    super(ctx)
    let address = ctx.props.selectedDevice.mdev.address
    this.url = `http://${address}:3000/system/storage`
    this.state = {
      err: null,
      data: null
    }
  }

  willReceiveProps(nextProps) { 
  }

  navEnter() {
    request
      .get(this.url)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err) {
          this.setState(Object.assign({}, this.state, { err, data: null }))
        }
        else if (!res.ok) {
          this.setState(Object.assign({}, this.state, { err: new Error('response not ok'), data: null }))
        }
        else 
          this.setState(Object.assign({}, this.state, { err: null, data: res.body }))
      })
  }

  navLeave() {
  }

  navGroup() {
    return 'settings'
  }

  menuName() {
    return '存储信息'
  }

  menuIcon() {
    return DeviceStorage
  }

  quickName() {
    return '存储'
  }

  appBarStyle() {
    return 'colored'
  }

  /** renderers **/
  renderContent() {

    return (
      <div style={{width: '100%', height: '100%', overflow: 'scroll'}}>
        hello
      </div>
    )

    // return (
    //   <div style={{width: '100%', height: '100%', overflow: 'scroll'}}>
    //     { this.state.data ? JSON.stringify(this.state.data, null, '  ').toString() : '' }
    //   </div>
    // )
  }
}

export default Storage

