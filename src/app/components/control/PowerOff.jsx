import Debug from 'debug'
const debug = Debug('view:control:poweroff')

import React from 'react'
import { RaisedButton } from 'material-ui'

import request from 'superagent'

import { header1Style, header2Style, header2StyleNotFirst, contentStyle } from './styles'

class PowerOff extends React.Component {

  constructor(props) {
    super(props)

    this.url = `http://${this.props.address}:${this.props.systemPort}/system/boot`

    this.bootOp = (op) => {
      request
        .post(this.url)
        .set('Accept', 'application/json')
        .send({ op })
        .end((err, res) => {
          if (err || !res.ok) 
            return debug('request boot op failed', err || !res.ok, op)

          debug('request boot op success', op)
          // TODO ?
        })
    }
  }

  render() {
    return (
      <div style={this.props.style}>
        <div style={{paddingLeft: 72}}>
          <div style={Object.assign({}, header1Style, { 
            color: this.props.themeColor || 'grey'
          })}>重启和关机</div>

          <RaisedButton label='关机'
            onTouchTap={() => this.bootOp('poweroff')}
          />
          <RaisedButton label='重启' style={{marginLeft: 16}} 
            onTouchTap={() => this.bootOp('reboot')}
          />

          <div style={Object.assign({}, header1Style, { 
            color: this.props.themeColor || 'grey'
          })}>进入维护模式</div>
          <div style={contentStyle}>
            重启后进入维护模式，可以在维护模式下执行磁盘操作或系统维护任务。
          </div>
          <RaisedButton label='重启进入维护模式'
            onTouchTap={() => this.bootOp('rebootMaintenance')}
          />
        </div>
      </div>
    )
  }
}

export default PowerOff
