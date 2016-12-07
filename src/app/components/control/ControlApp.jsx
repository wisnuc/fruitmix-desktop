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

const renderLine = (obj, prop) => <LabeledText label={prop} text={obj[prop] || '(none)'} right={4}/>

class TimeDate extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      data: null
    }

    this.properties = [
      'Local time',
      'Universal time',
      'RTC time',
      'Time zone',
      'NTP synchronized',
      'Network time on'
    ]
  }

  componentDidMount() {
    this.timer = setInterval(() => 
      request
        .get('http://192.168.5.132:3000/system/timedate')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err || !res.ok) return
          this.setState(Object.assign({}, this.state, { data: res.body }))
        })     
    , 1000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
    delete this.timer
  }

  render() {
    return (
      <div style={this.props.style}>
        <div style={{marginTop: 24, width: 440}}>
          { this.state.data && 
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
            )], [])
          }
        </div>
      </div>
    )
  }
}

class Storage extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    return <div />
  }
}

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
      ['网络', <ActionSettingsEthernet />, 'ETHERNET'],
      ['时间', <DeviceAccessTime />, 'TIMEDATE'],
      ['风扇', <HardwareToys />, 'FAN'],
      ['关机', <ActionPowerSettingsNew />, 'POWEROFF']
    ]
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

    const detailWidth = 300
    const contentStyle = { marginLeft: 72 }

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

          <div style={{ position: 'absolute', width: '100%', height: 56, display: 'flex', alignItems: 'center' }}>
            <Paper style={{backgroundColor: blueGrey500, width: '100%', height: '100%', display: 'flex',
              alignItems: 'center'}}>
              <div style={{fontSize: 21, color: '#FFF', marginLeft: 72}}>{ title() }</div>
            </Paper>
          </div>

          <div id='layout-middle-container-spacer' style={{height: 56}} />

          <div id='layout-middle-container-lower' 
            style={{ width: '100%', height: 'calc(100% - 56px)', backgroundColor: '#EEEEEE', display:'flex' }}>

            <div style={{ width: '100%', height: '100%', backgroundColor:'#FAFAFA' }}>
              {
                this.state.select === 'STORAGE' ? <Storage /> :
                this.state.select === 'TIMEDATE' ? <TimeDate style={contentStyle} /> : null
              }
            </div>
          </div> 
        </div>
      </div>
    )
  }
}

export default ControlApp
