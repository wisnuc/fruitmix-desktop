import Debug from 'debug'
const debug = Debug('view:control:poweroff')

import { ipcRenderer } from 'electron'
import React from 'react'

import FlatButton from '../common/FlatButton'
import { Dialog, CircularProgress } from 'material-ui'
import { pinkA200 } from 'material-ui/styles/colors'

import request from 'superagent'

import { header1Style, header2Style, header2StyleNotFirst, contentStyle } from './styles'

class PowerOff extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      open: false,
      rebooting: false,
      choice: null,
      boot: null,
      storage: null,
      users: null,
    };
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
          // Get reboot status
          debug("this.props of PowerOff",this.props)
          debug("window.store.getState().mdns", window.store.getState().mdns);
          let oldip = this.props.address;
          let serial = null; 
          for(var mdns of window.store.getState().mdns){
            if(mdns.adress === oldip){
              serial = mdns.serial;
            }
          }
          this.setState({rebooting: true});
          //FIXME
          //this.GetNewDevice(serial);
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
  //FIXME need to handle situation when ip change
  GetNewDevice = (serial) => {
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


  handleOpen = (CHOICE) => {
    this.setState({
      choice: CHOICE,   
      open: true,
    });
    //this.setState({open: true});
  };
  handleClose = () => {
    this.setState({
      open: false,
      rebooting: false,
      });
  };

  //FIXME
  renderReBooting() {
    var text;
    if (this.state.boot === null || this.state.storage === null || this.state.users === null) {
      return (
        <div>重启中... <br/>3秒后将转到登陆页面</div>
          )
    }
    if (this.state.boot.bootMode){
      if(this.state.boot.bootMode === 'maintenance'){
        text = "已重新启动,将进入维护模式页面"
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
      debug("this.state.boot.lastFileSystem",this.state.boot.lastFileSystem)
      debug("this.state.boot.bootMode",this.state.boot.bootMode)
      text = "有点不对劲，将转到登陆页面";
      setTimeout(function(){
        window.store.dispatch({type:'LOGIN_OFF'})
        ipcRenderer.send('loginOff')
      },3000)

    }
    //if (this.state.boot instanceof Error || this.state.storage instanceof Error) {
    //  return (
    //    <div>无法与该设备通讯，请稍等或手动重启</div>
    //  )
    //}
    return (
      <div> {text} </div>
      )
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
            },3000)
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
            //FIXME
            setTimeout(function(){
              window.store.dispatch({type:'LOGIN_OFF'})
              ipcRenderer.send('loginOff')
            },3000)
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
            //FIXME
            setTimeout(function(){
              window.store.dispatch({type:'LOGIN_OFF'})
              ipcRenderer.send('loginOff')
            },3000)
          }}
         />
      ]
    }
  }
  render() {
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

export default PowerOff
