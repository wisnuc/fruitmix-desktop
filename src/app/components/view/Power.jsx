import React, { Component, PureComponent } from 'react'
import Radium from 'radium'
import request from 'superagent'
import Paper from 'material-ui/Paper'
import { Dialog, CircularProgress } from 'material-ui'
import ActionPowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new'
import { pinkA200 } from 'material-ui/styles/colors'
import { header1Style, header2Style, header2StyleNotFirst, contentStyle } from '../control/styles'
import FlatButton from '../common/FlatButton'
import Base from './Base'
import Checkmark from '../common/Checkmark'

import Debug from 'debug'
const debug = Debug('view:admin:power')


class Power extends Base {

  constructor(ctx) {

    super(ctx)
    let address = ctx.props.selectedDevice.mdev.address
    this.url = `http://${address}:3000/system/boot`
    this.state = {
      open: false,
      rebooting: false,
      choice: null,
      boot: null,
      storage: null,
      users: null,
      poweroff: null,
      device: null,
      progressDisplay:'none',
      operationDone:false
    }

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
          if(op === 'poweroff') {
            this.setState({rebooting: true,poweroff: true});
          } else {
            this.setState({rebooting: true});
          }
        })
    }

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

  handleOpen(CHOICE){
    this.setState({
      choice: CHOICE,   
      open: true,
    })
  }

  handleClose = () => {
    this.setState({
      open:false,
      rebooting: false
    })
  }

  getActions() {
    switch (this.state.choice) {
    case 'POWEROFF':
      return [ 
        this.cancelButton, 
        <FlatButton 
          label='确定' 
          primary={true}
          onTouchTap={() => {
            // TODO FIX
            this.setState({
              progressDisplay: 'block',
              open: false
            })
            setTimeout(() => {
              this.setState({
                operationDone: true
              })
            }, 5000)
            // this.bootOp('poweroff')
            // setTimeout(function(){
            //    window.store.dispatch({type:'LOGIN_OFF'})
            // },5000)
          }}
         />
      ]
    case 'REBOOT':
      return [ 
        this.cancelButton, 
        <FlatButton 
          label='确定' 
          primary={true}
          onTouchTap={() => {
            this.setState({
              progressDisplay: 'block',
              open: false
            })
            setTimeout(() => {
              this.setState({
                operationDone: true
              })
            }, 5000)
            // this.bootOp('reboot');
            // setTimeout(function(){
            //   window.store.dispatch({type:'LOGIN_OFF'})
            // },5000)
          }}
         />
      ]
    case 'REBOOTMAINTENANCE':
      return [ 
        this.cancelButton, 
        <FlatButton 
          label='确定' 
          primary={true}
          onTouchTap={() => {
            this.setState({
              progressDisplay: 'block',
              open: false
            })
            setTimeout(() => {
              this.setState({
                operationDone: true
              })
            }, 5000)
            // this.bootOp('rebootMaintenance')
            // setTimeout(function(){
            //   window.store.dispatch({type:'LOGIN_OFF'})
            // },5000)
          }}
         />
      ]
    }
  }

  renderDiaContent(){
    if (this.state.operationDone){
      let hintText = '';
      let linkText = '';
      switch(this.state.choice){
      case 'POWEROFF':
        hintText = '设备已关机，去'
        linkText = '登陆'
        break;
      case 'REBOOT':
        hintText = '设备已重启完毕，去'
        linkText = '登陆'
        break;
      case 'REBOOTMAINTENANCE':
        hintText = '设备已重启至维护模式，去'
        linkText = '维护'
        break;
      }
      // <span style={{color:'#1d72f0',textDecoration: 'underline', cursor:'pointer' }}>{linkText}</span>
      return [
        <div style={{marginTop:80, marginLeft:194}}>
          <Checkmark delay={300}/>
        </div>,
        <div style={{ textAlign:'center', marginTop: 30}}>{hintText}
          <FlatButton label={linkText} primary={true} onTouchTap={() => {}}/>
        </div>
      ]
    } else {
      let hintText = ''
      switch(this.state.choice){
      case 'POWEROFF':
        hintText = '设备正在关机...'
        break;
      case 'REBOOT':
        hintText = '设备正在重启...'
        break;
      case 'REBOOTMAINTENANCE':
        hintText = '设备正在重启至维护模式 ...'
        break;
      }
      return (
        <div>
          <CircularProgress style={{ marginTop: 48, marginLeft: 200 }} size={100} />
          <div style={{ textAlign:'center', marginTop:45}}>{hintText}</div>
        </div>
      )
    }    
  }

  /** renderers **/
  renderContent() {

    let progressDiaStyle = {
      position: 'fixed',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.541176)',
      opacity: 1,
      display: this.state.progressDisplay
    }

    let paperStyle = {
      position:'absolute',
      width:500,
      height: 300,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white'
    }

    return (
      <div style={{width: '100%', height: '100%'}}>
        <div style={{paddingLeft: 72}}>
          <div style={Object.assign({}, header1Style, { color: 'grey' })}>重启和关机</div>

          <FlatButton label='关机' primary={true} style={{marginLeft: -16}}
            onTouchTap={() => this.handleOpen('POWEROFF')}
          />
          <FlatButton label='重启' primary={true} style={{marginLeft: 0}}
            onTouchTap={() => this.handleOpen('REBOOT')}
          />

          <div style={Object.assign({}, header1Style, { 
            color: 'grey'
          })}>进入维护模式</div>
          <div style={contentStyle}>
            重启后进入维护模式，可以在维护模式下执行磁盘操作或系统维护任务。
          </div>
          <FlatButton label='重启进入维护模式' primary={true} style={{marginLeft: -8}}
            onTouchTap={() => this.handleOpen('REBOOTMAINTENANCE')}
          />

          <Dialog
            actions={this.getActions()}
            modal={true}
            open={this.state.open}
            onRequestClose={this.handleClose}
          >
            {this.state.choice==='POWEROFF'?'确定关机？':this.state.choice==='REBOOT'?'确定重启？':'确定重启并进入维护模式？'}
          </Dialog>

          <div style={progressDiaStyle}>
            <Paper style={paperStyle} zDepth={2} thickness={7}>
            { this.renderDiaContent()}
            </Paper>
          </div>

        </div>
      </div>
    )
  }
}

export default Power

