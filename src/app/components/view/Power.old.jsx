import React, { Component, PureComponent } from 'react'
import Radium from 'radium'
import { ipcRenderer } from 'electron'
import request from 'superagent'

import { Dialog, CircularProgress } from 'material-ui'
import ActionPowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new'
import { pinkA200 } from 'material-ui/styles/colors'
import { header1Style, header2Style, header2StyleNotFirst, contentStyle } from '../control/styles'
import FlatButton from '../common/FlatButton'

import Debug from 'debug'
const debug = Debug('view:admin:power')

import Base from './Base'
// import FlatButton from '../mdc/FlatButton'

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
      device: null
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

    this.requestGet = (ip, port, ep, propName) => {
      request.get(`http://${ip}:${port}/${ep}`)
      .set('Accept', 'application/json')
      .timeout(120000)
      .end((err, res) => {
        if (this.unmounted) return
        debug('request get', ep, propName, err || res.body)
        this.setState(state => { 
          let nextState = {}
          nextState[propName] = err ? err : res.body
          return nextState
          })  
        })
    }
  }

  GetNewDevice(serial){
    debug("window.store.getState().mdns", window.store.getState().mdns);
    var newip = null;
    for(var mdns of window.store.getState().mdns){
      if(mdns.serial === serial){
        newip = mdns.ip;
      }
    }
    debug("ip and serial are: ",newip,serial)
    setTimeout(() => {
      this.requestGet(newip, 3000, 'system/boot', 'boot');
      this.requestGet(newip ,3000, 'system/storage', 'storage');
      this.requestGet(newip, 3721, 'login', 'users');
    }, 3000);
  }

  handleOpen(CHOICE){
    this.setState({
      choice: CHOICE,   
      open: true,
    })
  }

  handleClose(){
    this.setState({
      open:false,
      rebooting: false
    })
  }

  renderReBooting() {
    var text;
    debug("PowerOff props and state ",this.props,this.state)
    if (this.state.poweroff){
      return( <div>已关机<br/>5秒后将转到登陆页面</div> )
    }
    return( <div>重启中......<br/>5秒后将转到登陆页面</div> ) 

    //TODO the following code is not use, maybe use it later
    if (this.state.boot === null || this.state.storage === null || this.state.users === null) {
      return ( <div>重启中...</div> )
    }
    if (this.state.boot.bootMode){
      if(this.state.boot.bootMode === 'maintenance'){
        text = "已重新启动,将进入维护模式页面"
        setTimeout(function(){
          window.store.dispatch({
            type: 'ENTER_MAINTENANCE',
            data: {
              device: this.state.device,//FIXME
              boot: this.state.boot,
              storage: this.state.storage,
            }
          })
        },3000)
      }
      else{
        text = "重启成功，将转到登陆页面"
        setTimeout(function(){
          window.store.dispatch({type:'LOGIN_OFF'})
          ipcRenderer.send('loginOff')
        },3000)
      }
    }
    else {
      debug("reboot error this.state.boot.lastFileSystem",this.state.boot.lastFileSystem)
      debug("reboot error this.state.boot.bootMode",this.state.boot.bootMode)
      text = "有点不对劲，将转到登陆页面";
      setTimeout(function(){
        window.store.dispatch({type:'LOGIN_OFF'})
        ipcRenderer.send('loginOff')
      },3000)

    }

    return ( <div> {text} </div> )
  }

  rebootActions(){
    return [
      <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <CircularProgress color={pinkA200} />
      </div>,
      <FlatButton label='晓得了' primary={true} onTouchTap={this.handleClose} />
    ]
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
            this.bootOp('poweroff')
            setTimeout(function(){
               window.store.dispatch({type:'LOGIN_OFF'})
               ipcRenderer.send('loginOff')
            },5000)
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
            this.bootOp('reboot');
            setTimeout(function(){
              window.store.dispatch({type:'LOGIN_OFF'})
              ipcRenderer.send('loginOff')
            },5000)
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
            this.bootOp('rebootMaintenance')
            setTimeout(function(){
              window.store.dispatch({type:'LOGIN_OFF'})
              ipcRenderer.send('loginOff')
            },5000)
          }}
         />
      ]
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

  /** renderers **/
  renderContent() {

    return (
      <div style={{width: '100%', height: '100%'}}>
        <div style={{paddingLeft: 72}}>
          <div style={Object.assign({}, header1Style, { 
            color: 'grey'
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
            color: 'grey'
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
            modal={true}
            open={this.state.open}
            onRequestClose={this.handleClose}
          >
            {this.state.choice==='POWEROFF'?'确定关机？':this.state.choice==='REBOOT'?'确定重启？':'确定重启并进入维护模式？'}
          </Dialog>
          <Dialog
            actions={this.rebootActions()}
            modal={true}
            open={this.state.rebooting}
            onRequestClose={this.handleClose}
          >
          {this.renderReBooting()}
          </Dialog>
        </div>
      </div>
    )
  }
}

export default Power

