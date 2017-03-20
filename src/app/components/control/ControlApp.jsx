import Debug from 'debug'
const debug = Debug('view:control:device')
import React from 'react'
import { Paper, Divider, Dialog, Menu, MenuItem, IconButton, TextField } from 'material-ui'
import FlatButton from '../common/FlatButton'
import { blue500, blueGrey500, deepOrange500 } from 'material-ui/styles/colors'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import SocialShare from 'material-ui/svg-icons/social/share'
import SocialPeople from 'material-ui/svg-icons/social/people'
import FileFileUpload from 'material-ui/svg-icons/file/file-upload'
import FileFileDownload from 'material-ui/svg-icons/file/file-download'
import ActionSettingsEthernet from 'material-ui/svg-icons/action/settings-ethernet'
import ActionPowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new'
import ActionDNS from 'material-ui/svg-icons/action/dns'
import DeviceAccessTime from 'material-ui/svg-icons/device/access-time'
import DeviceStorage from 'material-ui/svg-icons/device/storage'
import HardwareToys from 'material-ui/svg-icons/hardware/toys'
import EditorModeEdit from 'material-ui/svg-icons/editor/mode-edit'
import Checkmark from '../common/Checkmark'
import request from 'superagent'
import TimeDate from './TimeDate'
import Ethernet from './Ethernet'
import Device from './Device'
import Fan from './Fan'
import User from './User'
import PowerOff from './PowerOff'
import ChangePasswordButton from './user/ChangePasswordButton'
import { header1Style, header2Style, header2StyleNotFirst, contentStyle } from './styles'

const LEFTNAV_WIDTH=210
const C = x => f => f ? C(f(x)) : x
const PlaceHolder = () => <div />

class Storage extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      err: null,
      data: null
    }
  }

  componentDidMount() {

    request
      .get(`http://${this.props.address}:3000/system/storage`)
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

/**
  render() {
    return (
      <div style={this.props.style}>
        { this.state.data && JSON.stringify(this.state.data, null, '  ') }
      </div>
    ) 
  }
**/

  render() {
    return <div />
  }
}

// this is a container component
class ControlApp extends React.Component {

  constructor(props) {
    
    super(props)

    this.state = {
      leftNav: true,
      detailOn: false,
      select: 'USER'
    }

    this.settings = [
      ['用户', <SocialPeople />, 'USER', User],
      ['设备', <ActionDNS />, 'DEVICE', Device],
      ['存储', <DeviceStorage />, 'STORAGE', Storage],
      ['网络', <ActionSettingsEthernet />, 'ETHERNET', Ethernet],
      ['时间', <DeviceAccessTime />, 'TIMEDATE', TimeDate],
      ['风扇', <HardwareToys />, 'FAN', Fan],
      ['关机', <ActionPowerSettingsNew />, 'POWEROFF', PowerOff]
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
        disabled={text === '存储' ? true : false}
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

  shouldComponentUpdate(nextProps, nextState) {
    console.log('should update diff')
    if (this.state.leftNav != nextState.leftNav) return true
    if (this.state.detailOn != nextState.detailOn) return true
    if (this.state.select != nextState.select) return true
    return false
  }

  render() {

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
          <Paper style={{position:'absolute', width:'100%', height:56, display:'flex', alignItems:'center', backgroundColor: blueGrey500 }} rounded={false}>
            <div style={{fontSize: 21, color: '#FFF', marginLeft: 72}}>{ title() }</div>
          </Paper>

          <div id='layout-middle-container-spacer' style={{height: 56}} />
          <div id='layout-middle-container-lower' style={{width:'100%', height:'calc(100% - 56px)', backgroundColor: '#FAFAFA', overflowY: 'auto'}}>
            { C(this.settings)
              (settings => settings.find(item => item[2] === this.state.select))
              (found => found && found[3] ? 
                React.createElement(found[3], { 
                  themeColor: blueGrey500, 
                  address: this.address,
                  systemPort: 3000,
                  fruitmixPort: 3721,
                  user: window.store.getState().login.obj 
                }) : <PlaceHolder />)
              () }
          </div> 
        </div>
      </div>
    )
  }
}

export default ControlApp
