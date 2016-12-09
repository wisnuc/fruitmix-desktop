import Debug from 'debug'

const debug = Debug('view:control:device')

import React from 'react'

import { Paper, Divider, Menu, MenuItem, IconButton, FlatButton, RaisedButton } from 'material-ui'
import { blue500, blueGrey500 } from 'material-ui/styles/colors'
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
import HardwareKeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up'
import HardwareKeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down'


const LEFTNAV_WIDTH=210

import request from 'superagent'

import TimeDate from './TimeDate'
import Ethernet from './Ethernet'

import { header1Style, header2Style, header2StyleNotFirst, contentStyle } from './styles'

const C = x => f => f ? C(f(x)) : x

const PlaceHolder = () => <div />

class PowerOff extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div style={this.props.style}>
        <div style={{paddingLeft: 72}}>
          <div style={Object.assign({}, header1Style, { color: this.props.themeColor || 'grey'})}>重启和关机</div>
          <RaisedButton label='关机'/>
          <RaisedButton label='重启' style={{marginLeft: 16}} />
          <div style={Object.assign({}, header1Style, { color: this.props.themeColor || 'grey'})}>进入维护模式</div>
          <div style={contentStyle}>重启后进入维护模式，可以在维护模式下执行磁盘操作或系统维护任务。</div>
          <RaisedButton label='重启进入维护模式'/>
        </div>
      </div>
    )
  }
}

class User extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      err: null,
      data: null
    }
  }

  componentDidMount() {

    request
      .get(`http://${this.props.address}:3721/login`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        console.log(err || !res.ok || res.body)
        if (err) {
          this.setState(Object.assign({}, this.state, { err, data: null }))
        }
        else if (!res.ok) {
          this.setState(Object.assign({}, this.state, { err: new Error('response not ok'), data: null }))
        }
        else { 
          this.setState(Object.assign({}, this.state, { err: null, data: res.body }))
        }
      })
  }

  renderLine(key, value, icon) {
    return (
      <div style={{height: 48, fontSize: 14, color: 'rgba(0, 0, 0, 0.87)', display: 'flex', alignItems: 'center'}}>
        <div style={{flex: '0 0 120px'}}>{key}</div>
        <div style={{flex: '0 0 160px'}}>{value}</div>
        { icon && <IconButton>{icon}</IconButton> }
      </div>
    )
  }

  render() {

    let user = window.store.getState().login.obj

    return (
      <div style={this.props.style}>
        <div style={{paddingLeft: 72}}>
          <div style={Object.assign({}, header1Style, { color: blueGrey500 })}>{ user.username }</div>
          <div style={contentStyle}>
            { user.isAdmin && user.isFirstUser ? 
              '您是系统的第一个用户，是最高权限的系统管理员。' :
              user.isAdmin ? '您是系统管理员。' : '您是系统普通用户。' }
          </div>
          <div style={Object.assign({}, header1Style, { color: blueGrey500 })}>修改信息</div>
          <div style={header2Style}>用户名</div>
          <div style={contentStyle}>
            WISNUC OS内部使用不可修改的唯一用户ID标识用户身份。用户名仅用于用户登录等信息显示，Windows共享文件访问和其他需要登录的网络文件服务在登录时使用。
          </div>
          <div style={contentStyle}>
            用户名可以使用中文字符，包括可显示的标点符号。Windows共享文件访问也支持中文字符的用户名，但不是所有客户端软件都支持中文名，所以，如果您使用的网络文件系统服务客户端软件（例如Android或者iOS上的samba客户端）不支持中文用户名，您只能使用英文大小写字母的用户名。
          </div>
          <RaisedButton label='修改用户名' />

          <div style={header2StyleNotFirst}>密码</div>
          <div style={contentStyle}>WISNUC OS的所有客户端、Web浏览器和网络文件服务使用相同的用户名密码组合。</div>
          <div style={contentStyle}>WISNUC OS不会保存任何形式的用户明文密码。</div>
          <RaisedButton label='修改密码' />
          <div style={{height: 30}} />
          <Divider style={{width: 760}}/>
          <div style={Object.assign({}, header1Style, { color: blueGrey500 })}>所有用户</div>
          <div style={{height: 48}} />
        </div>
      </div>
    )
  }
}

class Fan extends React.Component {
  
  constructor(props) {
    super(props)
  }

  render() {

    const titleStyle = {
      width:240,
      height:48,
      fontWeight: 'bold',
      fontSize: 16,
      color: 'red',
      backgroundColor: '#FFF',
      opacity:1,
      display:'flex',
      alignItems: 'center',
      paddingLeft: 16,
    }

    const footerStyle = {
      width:240,
      height:96,
      fontSize: 16,
      opacity:0.54,
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
              <FlatButton icon={<HardwareKeyboardArrowUp />} primary={true} />
              <div style={{fontSize:34, margin:8, 
                opacity:0.54, display:'flex', justifyContent:'center'}}>{'50%'}</div>
              <FlatButton icon={<HardwareKeyboardArrowDown />} primary={true} />
            </div>
            <div style={footerStyle}>
              <div>点击上下箭头</div>
              <div>调节马达动力</div>
            </div>
          </Paper>

          <Paper style={{padding:0, marginLeft:24}}>
            <div style={titleStyle}>风扇转速</div>
            <div style={{height:48}} />
            <div style={{width:240, height:144, fontSize:56, opacity:0.87,
              display:'flex', alignItems: 'center', justifyContent: 'center',
              color: 'green' }}>{'1234'}</div>
            <div style={footerStyle}>unit: RPM</div>
          </Paper>
        </div>
      </div>
    )
  }
}

class Device extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      err: null,
      data: null
    }
  }

  componentDidMount() {

    request
      .get(`http://${this.props.address}:3000/system/device`)
      .set('Accept', 'application/json')
      .end((err, res) => {

        debug('request', err || !res.ok || res.body)

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

  renderWS215i(ws215i) {
    return [
      <div style={Object.assign({}, header1Style, { color: this.props.themeColor })}>硬件</div>,
      <div style={header2Style}>闻上家用私有云</div>,
      <div style={contentStyle}>型号: WS215i</div>, 
      <div style={contentStyle}>硬件序列号: {ws215i.serial}</div>,
      <div style={contentStyle}>MAC地址: {ws215i.mac.toUpperCase()}</div>
    ]
  }

  renderDmiDecode(dmidecode) {
    return []
  }

  renderCpuInfo(cpuInfo) {
    return [
      <div style={header2StyleNotFirst}>CPU</div>,
      <div style={contentStyle}>CPU核心数: {cpuInfo.length}</div>,
      <div style={contentStyle}>CPU类型: {cpuInfo[0].modelName}</div>,
      <div style={contentStyle}>Cache: {cpuInfo[0].cacheSize}</div>
    ]
  }

  renderMemInfo(memInfo) {
    return [
      <div style={header2StyleNotFirst}>内存</div>,
      <div style={contentStyle}>总内存: {memInfo.memTotal}</div>,
      <div style={contentStyle}>未使用内存: {memInfo.memFree}</div>,
      <div style={contentStyle}>可用内存: {memInfo.memAvailable}</div>
    ]
  } 

  renderRelease(release, commit) {
    let rel = [
      <div style={Object.assign({}, header1Style, { color: this.props.themeColor })}>软件</div>
    ]
    
    if (!release)
      rel.push(<div style={contentStyle}>未能获得软件版本信息，您可能在使用开发版本软件。</div>)
    else {
      rel.push(<div style={contentStyle}>版本: {release.tag_name + (release.prerelease ? ' beta' : '')}</div>)
      rel.push(<div style={contentStyle}>版本类型: {release.prerelease ? '测试版' : '正式版'}</div>)
      rel.push(<div style={contentStyle}>发布时间: {new Date(release.published_at).toLocaleDateString('zh-CN')}</div>)
      rel.push(<div style={contentStyle}>源码版本: {commit ? commit.slice(0,12) : '未知'}</div>)
    }

    return rel
  }

  render() {

    let children = []

    if (this.state.data) {

      let { cpuInfo, memInfo, ws215i, dmidecode, release, commit } = this.state.data

      debug('release commit', release, commit)

      if (ws215i)
        children = children.concat(this.renderWS215i(ws215i))
      if (dmidecode)
        children = children.concat(this.renderDmiDecode(dmidecode))

      children = children.concat(this.renderCpuInfo(cpuInfo))
      children = children.concat(this.renderMemInfo(memInfo))

      if (release)
        children = children.concat(this.renderRelease(release, commit))
      
      children.push(<div style={{height:30}} />)
    }

    return (
      <div style={this.props.style}>
        <div style={{paddingLeft: 72}}>
          { children }
        </div>
      </div>
    ) 
  }
}

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

  render() {
    return (
      <div style={this.props.style}>
        { this.state.data && JSON.stringify(this.state.data) }
      </div>
    ) 
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
              (found => found && found[3] ? React.createElement(found[3], { themeColor: blueGrey500, address: this.address }) : <PlaceHolder />)
              () }
          </div> 
        </div>
      </div>
    )
  }
}

export default ControlApp
