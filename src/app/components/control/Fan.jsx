import React from 'react'
import { Paper, FlatButton } from 'material-ui'
import HardwareKeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up'
import HardwareKeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down'

import request from 'superagent'

class Fan extends React.Component {
  
  constructor(props) {

    super(props)
    this.state = {
      fanScale: null,
      fanSpeed: null
    }

    this.url = `http://${this.props.address}:${this.props.systemPort}/system/fan`
    this.timer = null

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

  componentDidMount() {

    this.timer = setInterval(() => request
      .get(this.url)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err || !res.ok) return
        if (this.timer) this.setState(res.body)
      }), 1000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
    this.timer = null
  }

  render() {

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
      <div style={this.props.style}>

        {/* left and right */}
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
            <div style={{width:240, height:144, fontSize:45, color: this.props.themeColor,
              display:'flex', alignItems: 'center', justifyContent: 'center',
            }}>{this.state.fanSpeed}</div>
            <div style={footerStyle}>单位: RPM</div>
          </Paper>
        </div>
      </div>
    )
  }
}

export default Fan
