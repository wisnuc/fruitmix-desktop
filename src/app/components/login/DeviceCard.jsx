import React from 'react'
import ReactDOM from 'react-dom'

import { ipcRenderer, clipboard } from 'electron'
import request from 'superagent'
import Debug from 'debug'
const debug = Debug('component:DeviceCard')

import muiThemeable from 'material-ui/styles/muiThemeable'
import { Paper, FlatButton, RaisedButton, IconButton, Dialog } from 'material-ui'
import NavigationChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import NavigationChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import ActionOpenInBrowser from 'material-ui/svg-icons/action/open-in-browser'
import { grey700, grey400, grey500, blueGrey400, blueGrey500 } from 'material-ui/styles/colors'

import keypress from '../common/keypress'

import ErrorBox from './ErrorBox'
import UserBox from './UserBox'
import GuideBox from './GuideBox'

const Barcelona = ({style, fill, size}) => (
  <div style={Object.assign(style, {width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 300ms'})}>
    <svg style={{fill, width: Math.floor(size * 128 / 192), height: Math.floor(size * 176 / 192), transition: 'all 300ms'}}
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 352">
      <path d="m 218.80203,48.039815 c -14.29555,11.911857 -25.3383,24.549958 -45.64007,35.359768 -7.02132,4.468951 -23.85238,6.000285 -34.76376,2.406502 C 111.22305,78.031495 92.140083,67.296886 70.422926,57.663153 48.215526,46.811935 22.865307,36.618679 5.6439616,24.553833 -1.5344798,20.331611 -0.35135786,13.918033 13.868086,11.892977 43.143517,7.1450877 75.870493,6.5837609 107.132,4.6866422 147.52562,3.0153376 187.86409,-0.22170151 228.69047,0.37596259 242.35579,0.23107113 257.06988,3.8096879 254.79285,9.2910307 251.48569,20.8655 236.4618,31.431442 225.3584,42.204703 c -2.18031,1.945806 -4.36853,3.890424 -6.55637,5.835112 z" />
      <path d="M 0.71584761,36.189436 C 5.7333591,46.742429 28.494578,54.650053 44.647666,63.186203 c 29.265921,13.132026 55.055587,27.478913 89.289864,39.017527 22.53176,8.66966 45.71976,-2.309934 53.39004,-9.921384 23.06458,-18.643025 45.06127,-37.527084 63.37844,-56.857692 4.39395,-3.966197 5.48956,-13.906509 4.83954,-4.430211 -0.4744,81.122537 0.0256,162.248467 -0.49302,243.368927 -7.81768,16.05486 -29.68046,30.63968 -45.31272,45.8063 -12.79139,10.22313 -21.6348,21.65006 -43.34582,29.94174 -24.20287,5.91627 -44.5008,-6.09059 -59.21752,-11.5605 C 74.058118,323.37123 39.752306,308.43334 10.445173,292.23628 -5.6879281,283.85313 2.7946672,273.33309 0.66866322,263.84413 0.57030725,187.95925 0.87058396,112.0742 0.71584761,36.189436 Z" />
    </svg>
  </div>
)

const Computer = ({style, fill, size}) => (
  <div style={Object.assign(style, {width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 300ms'})}>
    <svg style={{fill, width: Math.floor(size * 128 / 192), height: Math.floor(size * 176 / 192), transition: 'all 300ms'}}
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 89.471 89.471">
      <path d="M67.998,0H21.473c-1.968,0-3.579,1.61-3.579,3.579v82.314c0,1.968,1.61,3.579,3.579,3.579h46.525 c1.968,0,3.579-1.61,3.579-3.579V3.579C71.577,1.61,69.967,0,67.998,0z M44.736,65.811c-2.963,0-5.368-2.409-5.368-5.368 c0-2.963,2.405-5.368,5.368-5.368c2.963,0,5.368,2.405,5.368,5.368C50.104,63.403,47.699,65.811,44.736,65.811z M64.419,39.704 H25.052v-1.789h39.367V39.704z M64.419,28.967H25.052v-1.789h39.367V28.967z M64.419,17.336H25.052V6.599h39.367V17.336z"/>
    </svg>
  </div>
)

class HoverNav extends React.Component {

  constructor(props) {
    super(props)
    this.state = { hover: false }

    this.onMouseEnter = () => 
      this.setState(state => Object.assign({}, this.state, { hover: true }))

    this.onMouseLeave = () =>
      this.setState(state => Object.assign({}, this.state, { hover: false }))

    this.style = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.54
    }
  }

  render() {

    const enabled = !!this.props.onTouchTap
    return (
      <div style={this.props.style}>
        <div 
          style={ (enabled && this.state.hover) ? Object.assign({}, this.style, { backgroundColor: '#000', opacity: 0.1 }) : this.style }
          onMouseEnter={enabled && this.onMouseEnter}
          onMouseLeave={enabled && this.onMouseLeave}
          onTouchTap={enabled && this.props.onTouchTap}
        >
          { enabled && this.props.children }
        </div>
      </div>
    )
  }
}

class FirstUserBox extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      expanded: false
    }
  }

  render() {
    return (
      <div style={{width: '100%'}}>
        <div style={{width: '100%', height: '100%'}}>
          <div style={{width: '100%', height: this.state.expanded ? 320 : 0, transition: 'height 300ms', overflow: 'hidden', backgroundColor: '#FFF',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', boxSizing: 'border-box', paddingLeft: 64}}>
            
            <div style={{marginTop: 34, fontSize: 24, color: '#000', opacity: 0.54}}>创建第一个用户</div>
            <div style={{marginTop: 8, marginBottom: 12, fontSize: 20, color: '#000', opacity: 0.54}}>该用户将成为系统中最高权限的管理员</div>
            <TextField hintText='用户名'/>
            <TextField hintText='密码' />
            <TextField hintText='确认密码' />
            <div style={{display: 'flex'}}>
              <FlatButton label='确认' />
              <FlatButton label='取消' onTouchTap={() => {
                this.setState(Object.assign({}, this.state, { expanded: false }))
                this.props.onResize('VSHRINK') 
              }}/>
            </div>
          </div>
          <div style={{width: '100%', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFA'}}>
            <div style={{marginLeft: 16}}>该设备已安装WISNUC OS，但尚未创建用户。</div>
            <FlatButton style={{marginRight: 16}} label='创建用户' disabled={this.state.expanded} onTouchTap={() => {
              this.setState(Object.assign({}, this.state, { expanded: true }))
              this.props.onResize('VEXPAND')
              // setTimeout(() => this.props.onResize('HEXPAND'), 350)
            }}/>
          </div>
        </div>
      </div>
    )
  }
}

const MaintBox = props => (
    <div style={{width: '100%', height: 64, backgroundColor: 'rgba(128,128,128,0.8)',
      display:'flex', alignItems: 'center', justifyContent: 'space-between', 
      boxSizing: 'border-box', paddingLeft: 64, paddingRight: 64}}>
      
      <div style={{color: '#FFF' }}>{props.text}</div>
      <FlatButton label='维护模式' onTouchTap={props.onMaintain} />
    </div>
  )

/**
 * This component provides a card
 */

// @muiThemeable() cannot use!!!
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
        <div style={{width: '100%', height: 64, backgroundColor: '#FFF', 
          display: 'flex', alignItems: 'center', boxSizing: 'border-box', paddingLeft: 64}}>
          通讯中....
        </div>
      )
    }

    if (this.state.boot instanceof Error || this.state.storage instanceof Error) {
      return (
        <div style={{width: '100%', height: 64, backgroundColor: '#FFF', display: 'flex', alignItems: 'center', boxSizing: 'border-box', paddingLeft: 64}}>
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
          />
        )
      else
        return <div>No User </div>
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

    let paperStyle = {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: this.state.toggle 
        ? grey500 // '#00BCD4' // '#0097A7' // cyan700  '#00BCD4' // cyan500
        : this.props.backgroundColor || '#3F51B5',

      transition: 'all 300ms'
    }

    return (
      <div style={this.props.style}>

        {/* top container */}
        <Paper id='top-half-container' style={paperStyle} rounded={false}>
          <div style={{width: '100%', display: 'flex', alignItems: 'stretch'}}>
            <HoverNav 
              style={{
                flex: this.state.toggle ? '0 0 24px' : '0 0 64px', 
                transition: 'all 300ms'
              }} 
              onTouchTap={this.state.toggle ? undefined : this.props.onNavPrev} 
            >
              { !this.state.toggle && <NavigationChevronLeft style={{width:32, height:32}} color='#FFF'/> }
            </HoverNav>
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
              style={{
                flex: this.state.toggle ? '0 0 24px' : '0 0 64px',
                transition: 'all 300ms'
              }} 
              onTouchTap={this.state.toggle ? undefined : this.props.onNavNext} 
            >
              { !this.state.toggle && <NavigationChevronRight style={{width:32, height:32}} color='#FFF'/> }
            </HoverNav>
          </div>
        </Paper>

        { this.renderFooter() }
      </div>
    )
  }
}

export default DeviceCard
