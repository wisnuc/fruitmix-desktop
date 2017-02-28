import Debug from 'debug'
const debug = Debug('view:control:poweroff')

import React from 'react'
import FlatButton from '../common/FlatButton'
import { Dialog } from 'material-ui'
import request from 'superagent'

import { header1Style, header2Style, header2StyleNotFirst, contentStyle } from './styles'

class PowerOff extends React.Component {

  constructor(props) {
    super(props)

    this.url = `http://${this.props.address}:${this.props.systemPort}/system/boot`
    this.cancelButton = <FlatButton label='取消' primary={true} onTouchTap={this.handleClose} />
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
  state = {
    open: false,
    choice: null,
  };
  handleOpen = (CHOICE) => {
    this.setState({
      choice: CHOICE,   
      open: true,
    });
    //this.setState({open: true});
  };

  handleClose = () => {
    this.setState({open: false});
  };

  getActions() {
    switch (this.state.choice) {
    case 'POWEROFF':
      return [ 
        this.cancelButton, 
        <FlatButton 
          label='确定' 
          primary={true}
          onTouchTap={() => this.bootOp('poweroff')}
         />
      ]
    case 'REBOOT':
      return [ 
        this.cancelButton, 
        <FlatButton 
          label='确定' 
          primary={true}
          onTouchTap={() => this.bootOp('reboot')}
         />
      ]
    case 'REBOOTMAINTENANCE':
      return [ 
        this.cancelButton, 
        <FlatButton 
          label='确定' 
          primary={true}
          onTouchTap={() => this.bootOp('rebootMaintenance')}
         />
      ]
    }
  }
  render() {
  ////
    const actions = [
      <FlatButton
        label="取消"
        primary={true}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="确定"
        primary={true}
        onTouchTap={this.handleClose}
      />,
    ];
  ////
    return (
      <div style={this.props.style}>
        <div style={{paddingLeft: 72}}>
          <div style={Object.assign({}, header1Style, { 
            color: this.props.themeColor || 'grey'
          })}>重启和关机</div>

          <FlatButton label='关机' primary={true} style={{marginLeft: -16}}
            //onTouchTap={() => this.bootOp('poweroff')}
            onTouchTap={() => this.handleOpen('POWEROFF')}
          />
          <FlatButton label='重启' primary={true} style={{marginLeft: 0}} 
            //onTouchTap={() => this.bootOp('reboot')}
            onTouchTap={() => this.handleOpen('REBOOT')}
          />

          <div style={Object.assign({}, header1Style, { 
            color: this.props.themeColor || 'grey'
          })}>进入维护模式</div>
          <div style={contentStyle}>
            重启后进入维护模式，可以在维护模式下执行磁盘操作或系统维护任务。
          </div>
          <FlatButton label='重启进入维护模式' primary={true} style={{marginLeft: -8}}
            //onTouchTap={() => this.bootOp('rebootMaintenance')}
            onTouchTap={() => this.handleOpen('REBOOTMAINTENANCE')}
          />

          <Dialog
            actions={this.getActions()}
            modal={false}
            open={this.state.open}
            onRequestClose={this.handleClose}
          >
            {this.state.choice==='POWEROFF'?'确定关机？':this.state.choice==='REBOOT'?'确定重启？':'确定重启并进入维护模式？'}
          </Dialog>
        </div>
      </div>
    )
  }
}

export default PowerOff
