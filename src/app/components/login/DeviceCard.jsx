import React from 'react'
import ReactDOM from 'react-dom'

import Radium from 'radium'

import { ipcRenderer, clipboard } from 'electron'
import request from 'superagent'
import Debug from 'debug'
const debug = Debug('component:DeviceCard')

import muiThemeable from 'material-ui/styles/muiThemeable'
import LinearProgress from 'material-ui/LinearProgress'
import { Paper, RaisedButton, IconButton, Dialog } from 'material-ui'
import FlatButton from '../common/FlatButton'
import ActionOpenInBrowser from 'material-ui/svg-icons/action/open-in-browser'
import { grey700, grey400, grey500, blueGrey400, blueGrey500 } from 'material-ui/styles/colors'

import keypress from '../common/keypress'

import ErrorBox from './ErrorBox'
import UserBox from './UserBox'
import FirstUserBox from './FirstUserBox'
import GuideBox from './GuideBox'
import Barcelona from './Barcelona'
import Computer from './Computer'
import HoverNav from './HoverNav'

const MaintBox = props => (
    <div style={{width: '100%', height: 64, backgroundColor: 'rgba(128,128,128,0.8)',
      display:'flex', alignItems: 'center', justifyContent: 'space-between', 
      boxSizing: 'border-box', paddingLeft: 24, paddingRight: 24}}>
      
      <div style={{color: '#FFF' }}>{props.text}</div>
      <FlatButton label='维护模式' onTouchTap={props.onMaintain} />
    </div>
  )

class DeviceCard extends React.Component {

  constructor(props) {

    super(props)
    this.state = {
      toggle: false,
      horizontalExpanded: false,
      boot: null,
      storage: null,
      users: null,
    }

    this.unmounted = false

    this.serial = () => {

      let serial = '未知序列号'
      if (props.device.name) {
        let split = props.device.name.split('-')
        if (split.length === 3 && split[0] === 'wisnuc') {
          serial = split[2]
        }
      } 

      return serial
    }

    this.model = () => {

      let model = '个人计算机'
      if (this.props.device.name) {
        let split = this.props.device.name.split('-')
        if (split.length === 3 && split[0] === 'wisnuc') {
          if (split[1] === 'ws215i') {
            model = 'WS215i'
          }
        }
      } 

      return model 
    }

    this.logoType = () => {

      let logoType = Computer
      if (this.props.device.name) {
        let split = this.props.device.name.split('-')
        if (split.length === 3 && split[0] === 'wisnuc') {
          if (split[1] === 'ws215i') {
            logoType = Barcelona
          }
        }
      } 

      return logoType
    }

    ipcRenderer.send('setServerIp', props.device.address)

    this.requestGet = (port, ep, propName) =>
      request.get(`http://${this.props.device.address}:${port}/${ep}`)
        .set('Accept', 'application/json')
        .end((err, res) => {

          if (this.unmounted) return

          debug('request get', ep, propName, err || res.body)

          this.setState(state => { 
            let nextState = {}
            nextState[propName] = err ? err : res.body
            return nextState
          })
        })

    this.refresh = () => {

      if (this.unmounted) return

      this.setState(state => Object.assign({}, state, { boot: null, storage: null, users: null }))

      this.requestGet(3000, 'system/boot', 'boot')
      this.requestGet(3000, 'system/storage', 'storage')
      this.requestGet(3721, 'login', 'users')
    }

    this.requestToken = (uuid, password, callback) => 
      this.unmounted
        ? setImmediate(callback(new Error('device card component unmounted')))
        : request.get(`http://${this.props.device.address}:3721/token`)
            .auth(uuid, password)
            .set('Accept', 'application/json')
            .end((err, res) => 
              this.unmounted 
                ? callback(new Error('device card component unmounted'))
                : callback(err, res))

    this.reset = () => {

      if (this.unmounted) return

      this.setState(state => ({
        toggle: false,
        horizontalExpanded: false,
        boot: null,
        storage: null,
        users: null,
      }))

      this.requestGet(3000, 'system/boot', 'boot')
      this.requestGet(3000, 'system/storage', 'storage')
      this.requestGet(3721, 'login', 'users')
    }

    this.maintain = () => {
      window.store.dispatch({
        type: 'ENTER_MAINTENANCE',
        data: {
          device: this.props.device,
          boot: this.state.boot,
          storage: this.state.storage,
        }
      }) 
    }

    this.onBoxResize = resize => {
      if ((resize === 'VEXPAND' && this.state.toggle === false) || (resize === 'VSHRINK' && this.state.toggle === true))
        this.setState(Object.assign({}, this.state, { toggle: !this.state.toggle }))
      else if (resize === 'HEXPAND' || resize === 'HSHRINK')
        this.props.onResize(resize)
    }

    this.verticalExpand = () => {}
    this.verticalShrink = () => {}

    // quick fix, refresh cannot be used here, setState() cannot be called inside constructor (not mounted)
    this.requestGet(3000, 'system/boot', 'boot')
    this.requestGet(3000, 'system/storage', 'storage')
    this.requestGet(3721, 'login', 'users')
  }

  componentDidMount() {

    // create keypress listener
    this.keypress = new keypress.Listener()

    // listen window keydown keyup event
    window.addEventListener('keydown', this.keypress)
    window.addEventListener('keyup', this.keypress)

    this.keypress.sequence_combo('up up down down left right left right b a enter', () => {

      let text = 'The Contra Code was actually first used in Gradius for NES in 1986 by Konami.'
      console.log(text)

      this.maintain()
    })
  }

  componentWillUnmount() {

    this.unmounted = true

    // clean up keypress
    this.keypress.reset()
    this.keypress.stop_listening()
    this.keypress.destroy()
    this.keypress = null

    // remove listener
    window.removeEventListener('keydown', this.keypress, false)
    window.removeEventListener('keyup', this.keypress, false)
  }

  componentWillEnter(callback) {
    this.props.onWillEnter(ReactDOM.findDOMNode(this), callback) 
  }

  componentWillLeave(callback) {
    this.props.onWillLeave(ReactDOM.findDOMNode(this), callback)
  }

  // this is the logic branching place
  renderFooter() {

    if (this.state.boot === null || this.state.storage === null || this.state.users === null) {
      return (
        <div style={{width: '100%',height: 68,display: 'flex', alignItems: 'center', boxSizing: 'border-box',flexWrap: 'wrap'}}>
          <div style={{height: 4,width: 480}}><LinearProgress mode="indeterminate" /></div>
          <div style={{width: '100%', height: 64, backgroundColor: '#FFF', 
            display: 'flex', alignItems: 'center', boxSizing: 'border-box', paddingLeft: 24}}>
            通讯中....
          </div>
        </div>
      )
    }

    if (this.state.boot instanceof Error || this.state.storage instanceof Error) {
      return (
        <div style={{width: '100%', height: 64, backgroundColor: '#FFF', display: 'flex', alignItems: 'center', boxSizing: 'border-box', paddingLeft: 24}}>
          无法与该设备通讯，它可能刚刚离线或正在启动。 
        </div>
      )
    }
    // not both boot and storage are OK

    // if we have user array (not error)
    if (this.state.users && Array.isArray(this.state.users)) {
      if (this.state.users.length !== 0) 
        return (
          <UserBox 
            style={{width: '100%', transition: 'all 300ms', position:'relative'}} 
            color={this.props.backgroundColor}
            users={this.state.users}
            onResize={this.onBoxResize}
            toggleDim={this.props.toggleDim}
            requestToken={this.requestToken}
          />
        )
      else
        return (
          <FirstUserBox 
            style={{width: '100%', transition: 'all 300ms', position: 'relative'}}
            onResize={this.onBoxResize}
            toggleDim={this.props.toggleDim}
          />
        )
    }
    // now boot and storage ready, users should be error


    // if boot state is normal or alternative and users is ERROR, this is undefined case, should display errorbox
    if ((this.state.boot.state === 'normal' || this.state.boot.state === 'alternative') && this.state.users instanceof Error) 
      return (
        <ErrorBox 
          text='系统启动但应用服务无法连接，请重启服务器。'  
          error={JSON.stringify({
            boot: this.state.boot,
            storage: this.state.storage,
            users: this.state.users
          }, null, '  ')} 
        />
      )

    // now boot state should not be normal or alternative, must be maintenance, assert it!
    if (this.state.boot.state !== 'maintenance') {

      console.log('>>>>>><<<<<<')
      console.log(this.state)
      console.log('<<<<<<>>>>>>')

      setTimeout(() => {
        throw new Error('Undefined State: boot state is not maintenance')
      }, 5000)
      return
    }


    let text = '系统未能启动上次使用的wisnuc应用'
    if (this.state.boot.lastFileSystem) {
      
      if (this.state.boot.bootMode === 'maintenance')
        text = '用户指定启动至维护模式'

      return <MaintBox text={text} onMaintain={this.maintain} />
    }

    // now this.state.boot.lastFileSystem is null
    // 1. if there is suspicious wisnuc, select maintenance
    let storage = this.state.storage
    let fileSystems = [...storage.volumes, ...storage.blocks.filter(blk => !blk.isVolumeDevice && blk.isFileSystem)]

    let suspicious = fileSystems
                      .filter(f => !!f.wisnuc)
                      .find(f => f.wisnuc === 'ERROR' || !f.wisnuc.intact) 

    if (suspicious)
      return <MaintBox text={text} onMaintain={this.maintain} />

    // if (storage.volumes.find(v => v.isMissing))
    if (storage.volumes.length > 0)
      return <MaintBox text={text} onMaintain={this.maintain} />

    return (
      <GuideBox 
        address={this.props.device.address} 
        storage={this.state.storage} 
        onResize={this.onBoxResize} 
        onReset={this.reset}
        onMaintain={this.maintain}
      />
    )

    // there are following possibilities:
    // 1. user forced boot to maintenance mode.
    //    actions depends on system state, including:
    //    a) select one bootable system to boot, if any
    //    b) select one file system and re-init (delete old one)
    //    c) rebuild a file system to install new one
    //
    // 2. the lfs exists but not bootable, either volume missing, or fruitmix deleted.
    //    a) fix
    //    b) reinstall wisnuc
    //    c) rebuild a file system to install new one
    //    
    // 3. no bootable file system
    //    a) reinstall or rebuild
    // 4. more than one bootable file system
    //    a) select one file system and boot
    //    b) reinstall or rebuild
  }

  render() {

    let bcolor = this.state.toggle ? grey500 : this.props.backgroundColor || '#3f51B5'

    let paperStyle = {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: bcolor,
      transition: 'all 300ms'
    }

    return (
      <div style={this.props.style}>

        {/* top container */}
        <Paper id='top-half-container' style={paperStyle} rounded={false}>
          <div style={{width: '100%', display: 'flex', alignItems: 'stretch'}}>
            <HoverNav 
              style={{ flex: this.state.toggle ? '0 0 24px' : '0 0 64px', transition: 'all 300ms' }} 
              direction='left'
              color={bcolor}
              onTouchTap={this.state.toggle ? undefined : this.props.onNavPrev} 
            />
            <div style={{flexGrow: 1, transition: 'height 300ms'}}>
              <div style={{position: 'relative', width:'100%', height: '100%'}}>
              { 
                React.createElement(this.logoType(), { 

                  style: this.state.toggle ?  {
                      position: 'absolute',
                      top: 12,
                      right:0,
                      transition: 'all 300ms'
                    } : {
                      position: 'absolute',
                      top: 64,
                      left: 0,
                      right: 0,
                      margin: 'auto',
                      transition: 'all 300ms'
                    },

                  fill: this.state.toggle ? 'rgba(255,255,255,0.7)' : '#FFF',
                  size: this.state.toggle ? 40 : 80
                }) 
              }
              <div style={{height: this.state.toggle ? 16 : 192, transition: 'height 300ms'}} />
              <div style={{position: 'relative', transition: 'all 300ms'}}>
                <div style={{
                  fontSize: this.state.toggle ? 14 : 24, 
                  fontWeight: 'medium',
                  color: this.state.toggle ? 'rgba(255,255,255,0.7)' : '#FFF', 
                  marginBottom: this.state.toggle ? 0 : 12,
                }}>{this.model()}</div>
                <div 
                  style={{
                    fontSize: 14, 
                    color: 'rgba(255,255,255,0.7)', 
                    marginBottom: 12, 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer'
                  }}
                  onTouchTap={() => 
                    ipcRenderer.send('newWebWindow', '固件版本管理', `http://${this.props.device.address}:3001`)
                  }
                >
                  {this.props.device.address}
                  <ActionOpenInBrowser style={{marginLeft: 8}} color='rgba(255,255,255,0.7)' />
                </div>
                { !this.state.toggle && 
                  <div style={{
                    fontSize: 14, 
                    color: 'rgba(255,255,255,0.7)', 
                    marginBottom: 16
                  }}>{this.serial()}</div> }
              </div>
              </div>
            </div>
            <HoverNav 
              style={{ flex: this.state.toggle ? '0 0 24px' : '0 0 64px', transition: 'all 300ms' }} 
              direction='right'
              color={bcolor}
              onTouchTap={this.state.toggle ? undefined : this.props.onNavNext}
            />
          </div>
        </Paper>

        { this.renderFooter() }
      </div>
    )
  }
}

export default DeviceCard

