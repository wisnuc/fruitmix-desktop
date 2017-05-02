import React, { Component, PureComponent } from 'react'
import Radium from 'radium'
import request from 'superagent'

import HardwareToys from 'material-ui/svg-icons/hardware/toys'
import { Paper, FlatButton } from 'material-ui'
import HardwareKeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up'
import HardwareKeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down'

import Base from './Base'

class FanControl extends Base {

  constructor(ctx) {

    super(ctx)
    let address = ctx.props.selectedDevice.mdev.address
    // this.url = `http://${address}:3000/system/fan`
    // TODO  url for test
    this.url = '192.168.5.182:3000/system/fan'
    this.timer = null
    this.state = {
      fanScale: null,
      fanSpeed: null
    }

    this.setFanScale = (fanScale) => {
      request
        .post(this.url)
        .set('Accept', 'application/json')
        .send({ fanScale }) 
        .end((err, res) => console.log(err || !res.ok || res.body))
    }

    this.increment = () => {

      if (typeof this.state.fanScale !== 'number') return
      
      let fanScale = this.state.fanScale 
      fanScale += 5
      if (fanScale > 100) fanScale = 100

      this.setFanScale(fanScale)
    }

    this.decrement = () => {

      if (typeof this.state.fanScale !== 'number') return
  
      let fanScale = this.state.fanScale
      fanScale -= 5
      if (fanScale < 5) fanScale = 5

      this.setFanScale(fanScale)
    }
  }

  willReceiveProps(nextProps) { 
  }

  navEnter() {
    this.timer = setInterval(() => request
      .get(this.url)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err || !res.ok) return
        if (this.timer) this.setState(res.body)
      }), 1000)
  }

  navLeave() {
    clearInterval(this.timer)
    this.timer = null
  }

  navGroup() {
    return 'settings'
  }

  menuName() {
    return '风扇控制'
  }

  menuIcon() {
    return HardwareToys
  }

  quickName() {
    return '风扇'
  }

  appBarStyle() {
    return 'colored'
  }

  /** renderers **/
  renderContent() {

    const titleStyle = {
      width:240,
      height:48,
      fontSize: 16,
      color: 'rgba(0,0,0,0.87)',
      backgroundColor: '#FFF',
      opacity:1,
      display:'flex',
      alignItems: 'center',
      paddingLeft: 16,
    }

    const footerStyle = {
      width:240,
      height:96,
      fontSize: 14,
      color: 'rgba(0,0,0,0.54)',
      display:'flex',
      flexDirection:'column',
      alignItems: 'center',
      justifyContent:'center'
    }

    return (
      <div style={{width: '100%', height: '100%'}}>

        <div style={{paddingLeft: 72, paddingTop:48, display:'flex'}}>

          <Paper style={{padding:0}}>
            <div style={titleStyle}>马达动力</div>
            <div style={{height:48}} />
            <div style={{width:240, height:144, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
              <FlatButton icon={<HardwareKeyboardArrowUp />} primary={true} 
                onTouchTap={this.increment} />
              <div style={{fontSize:34, margin:8, color:'rgba(0,0,0,0.54)', display:'flex', justifyContent:'center'}}>{this.state.fanScale}</div>
              <FlatButton icon={<HardwareKeyboardArrowDown />} primary={true} 
                onTouchTap={this.decrement} />
            </div>
            <div style={footerStyle}>
              <div>点击上下箭头</div>
              <div>调节马达动力</div>
            </div>
          </Paper>

          <Paper style={{padding:0, marginLeft:24}}>
            <div style={titleStyle}>风扇转速</div>
            <div style={{height:48}} />
            <div style={{width:240, height:144, fontSize:45,
              display:'flex', alignItems: 'center', justifyContent: 'center',
            }}>{this.state.fanSpeed}</div>
            <div style={footerStyle}>单位: RPM</div>
          </Paper>
        </div>
      </div>
    )
  }
}

export default FanControl

