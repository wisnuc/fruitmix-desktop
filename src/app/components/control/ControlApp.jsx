import React from 'react'

import { Divider, Menu, MenuItem, IconButton } from 'material-ui'
import { blue500, blueGrey500 } from 'material-ui/styles/colors'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import SocialShare from 'material-ui/svg-icons/social/share'
import SocialPeople from 'material-ui/svg-icons/social/people'
import FileFileUpload from 'material-ui/svg-icons/file/file-upload'
import FileFileDownload from 'material-ui/svg-icons/file/file-download'
import ActionSettingsEthernet from 'material-ui/svg-icons/action/settings-ethernet'
import ActionPowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new'
import DeviceAccessTime from 'material-ui/svg-icons/device/access-time'
import DeviceStorage from 'material-ui/svg-icons/device/storage'
import HardwareToys from 'material-ui/svg-icons/hardware/toys'

import { sharpCurve } from '../common/motion'

const LEFTNAV_WIDTH=210

import { FlatButton, Paper } from 'material-ui'

import request from 'superagent'

import TimeDate from './TimeDate'

const C = x => f => f ? C(f(x)) : x

let labeledTextStyle = {
  height: 48,
  display: 'flex',
  flexDirection: 'row',
  fontSize: 13,
  lineHeight: 1.5,
}

const LabeledText = ({label, text, right, styleOverlay}) => 
  ( 
    <div style={styleOverlay ? Object.assign({}, labeledTextStyle, styleOverlay) : labeledTextStyle}>
      <div style={{flex:1, fontWeight:100, fontFamily:'monospace', opacity:'0.54'}}>{label}:</div>
      <div style={{flex:(right || 4), fontFamily:'monospace', opacity:'0.87'}}>{text}</div>
    </div>
  )

class Storage extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    return <div />
  }
}

const renderLine = () => (
  <div style={{height: 40, color: 'rgba(0, 0, 0, 0.87)', display: 'flex', alignItems: 'center'}}>
    <div style={{flex: '0 0 160px'}}>{key}</div>
    <div>{value}</div>
  </div>
)

const NetFace = (props) => {

  const renderLine = (key, value) => (
    <div style={{height: 40, color: 'rgba(0, 0, 0, 0.87)', fontSize: 14, 
      display: 'flex', alignItems: 'center'}}>
      <div style={{flex: '0 0 160px'}}>{key}</div>
      <div>{value}</div>
    </div>
  )

  return (
    <div style={props.style}>
      <div style={{
        fontSize: 24,
        fontWeight: 400,
        color: blueGrey500,
        marginTop: 32,
        marginBottom: 32
      }}>
        {props.data.name}
      </div>
      { renderLine('地址类型', props.data.family) }
      { renderLine('网络地址', props.data.address) }
      { renderLine('子网掩码', props.data.netmask) }
      { renderLine('MAC地址', props.data.mac.toUpperCase()) }
    </div>
  )
}

class Ethernet extends React.Component {

  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {

    if (!this.props.address) return

    request.get(`http://${this.props.address}:3000/system/net`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err || !res.ok) return
        this.setState(Object.assign({}, this.state, { data: res.body }))
      })
  }

  extract(itfs) {

    let arr = []
    for (let name in itfs) {
      let ipv4 = itfs[name].find(addr => addr.internal === false && addr.family === 'IPv4')
      if (ipv4) arr.push(Object.assign(ipv4, { name }))
    } 
    return arr
  }

  render() {

    if (!this.state.data) return <div />
    return (
      <div style={this.props.style}>
        { this.extract(this.state.data.os).map(itf => <NetFace data={itf} />) }
      </div>
    )
  } 
}

const PlaceHolder = () => <div />

class ControlApp extends React.Component {

  constructor(props) {
    
    super(props)

    this.state = {
      leftNav: true,
      detailOn: false,
      select: 'USER'
    }

    this.settings = [
      ['用户', <SocialPeople />, 'USER'],
      ['存储', <DeviceStorage />, 'STORAGE'],
      ['网络', <ActionSettingsEthernet />, 'ETHERNET', Ethernet],
      ['时间', <DeviceAccessTime />, 'TIMEDATE', TimeDate],
      ['风扇', <HardwareToys />, 'FAN'],
      ['关机', <ActionPowerSettingsNew />, 'POWEROFF']
    ]

    let { device, selectIndex } = window.store.getState().login
    if (device && device[selectIndex]) {
      this.address = device[selectIndex].address
      console.log(this.address)
    }
  }

  renderMenuItem(text, icon, select) {
    return (
      <MenuItem 
        key={`control-panel-${select}`}
        style={{fontSize:14}} 
        primaryText={text} 
        leftIcon={icon}
        onTouchTap={() => this.setState(Object.assign({}, this.state, { select }))} 
      />
    )
  } 

  renderMenu() {

    return (
      <Menu autoWidth={false} listStyle={{width: LEFTNAV_WIDTH}}>
        { this.settings.map(item => this.renderMenuItem(item[0], item[1], item[2])) }        
      </Menu>
    )
  }

  render() {

    const contentStyle = { paddingLeft: 72, paddingTop: 24 }

    const title = () => {
      let found = this.settings.find(item => item[2] === this.state.select)
      return found ? found[0] : '未知控制'
    }

    return (
      <div id='control-app-outer' style={ this.props.style }>

        <div id='control-layout-leftnav-column' 
          style={{
            position: 'absolute',
            width: LEFTNAV_WIDTH, 
            height: '100%', 
            backgroundColor: '#FFF',
            boxSizing: 'border-box',
            borderStyle: 'solid',
            borderWidth: '0 1px 0 0',
            borderColor: '#BDBDBD'
        }}>
          <div style={{width: '100%', height: 56, display: 'flex', alignItems: 'center' }}>
            <div style={{ marginLeft: 72, fontSize: 16, color: 'rgba(0, 0, 0, 0.54)'}}>设置</div>
          </div>
          <Divider />
          { this.renderMenu() }
        </div>          

        <div id='control-layout-middle-container'
          style={{
            position: 'absolute',
            left: LEFTNAV_WIDTH,
            backgroundColor: 'yellow',
            width: `calc(100% - ${LEFTNAV_WIDTH}px)`,
            height:'100%'
          }}
        >
          <Paper style={{position:'absolute', width:'100%', height:56, display:'flex', alignItems:'center',
            backgroundColor: blueGrey500 }}>
            <div style={{fontSize: 21, color: '#FFF', marginLeft: 72}}>{ title() }</div>
          </Paper>

          <div id='layout-middle-container-spacer' style={{height: 56}} />
          <div id='layout-middle-container-lower' style={{width:'100%', height:'calc(100% - 56px)', 
            backgroundColor: '#FAFAFA'}}>
            { C(this.settings)
              (settings => settings.find(item => item[2] === this.state.select))
              (found => found && found[3] ? 
                React.createElement(found[3], { 
                  style: contentStyle,
                  address: this.address
                }) : <PlaceHolder />)
              ()
            }
          </div> 
        </div>
      </div>
    )
  }
}

export default ControlApp
