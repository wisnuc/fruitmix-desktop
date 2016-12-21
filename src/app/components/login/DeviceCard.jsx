import React from 'react'
import ReactDOM from 'react-dom'

import { ipcRenderer } from 'electron'
import request from 'superagent'
import Debug from 'debug'
const debug = Debug('component:DeviceCard')

import { Paper } from 'material-ui'
import NavigationChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import NavigationChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
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

class MaintenanceBox extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    return <div style={{width: '100%', backgroundColor: 'red', height: 64}}>This is MaintenanceBox</div>
  }
}

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

    this.model = '个人计算机'
    this.logoType = Computer
    this.serial = '未知序列号'
    this.address = props.device.address

    if (props.device.name) {
      let split = props.device.name.split('-')
      if (split.length === 3 && split[0] === 'wisnuc') {
        if (split[1] === 'ws215i') {
          this.model = 'WS215i'
          this.logoType = Barcelona
        }
        this.serial = split[2]
      }
    } 

    ipcRenderer.send('setServerIp', props.device.address)

    this.refresh = () => {

      request.get(`http://${props.device.address}:3000/system/storage`)
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (this.unmounted) return
          this.setState(state => Object.assign({}, state, { 
            storage: (err || !res.ok) ? 'ERROR' : res.body
          }))
        })

      request.get(`http://${props.device.address}:3721/login`)
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (this.unmounted) return
          this.setState(state => Object.assign({}, state, { 
            users: (err || !res.ok) ? 'ERROR' : res.body 
          }))
        })

      request.get(`http://${props.device.address}:3000/system/boot`)
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (this.unmounted) return
          this.setState(state => Object.assign({}, state, {
            boot: (err || !res.ok) ? 'ERROR' : res.body
          }))
        })
    }

    this.refresh()

    this.onBoxResize = resize => {
      if ((resize === 'VEXPAND' && this.state.toggle === false) || (resize === 'VSHRINK' && this.state.toggle === true))
        this.setState(Object.assign({}, this.state, { toggle: !this.state.toggle }))
      else if (resize === 'HEXPAND' || resize === 'HSHRINK')
        this.props.onResize(resize)
    }
  }

  componentWillUpdate(nextProps, nextState) {
    debug('componentWillUpdate', nextProps, nextState)
  }

  componentWillUnmount() {
    this.unmounted = true
  }

  componentWillEnter(callback) {
    this.props.onWillEnter(ReactDOM.findDOMNode(this), callback) 
  }

  componentWillLeave(callback) {
    this.props.onWillLeave(ReactDOM.findDOMNode(this), callback)
  }

  renderFooter() {

    if (this.state.boot === null || this.state.storage === null || this.state.users === null) {
      return <div />
    }

    if (this.state.boot === 'ERROR' || this.state.storage === 'ERROR') {
      return (
        <div style={{width: '100%', height: 64, backgroundColor: '#FFF', display: 'flex', alignItems: 'center', boxSizing: 'border-box', paddingLeft: 64}}>
          无法与该设备通讯，它可能刚刚离线。 
        </div>
      )
    }

    // if we have user
    if (this.state.users && Array.isArray(this.state.users) && this.state.users.length !== 0) 
      return (
        <UserBox 
          style={{width: '100%', backgroundColor: '#FFF', transition: 'all 300ms'}} 
          color={this.props.backgroundColor}
          users={this.state.users}
          onResize={this.onBoxResize}
        />
      )

    // if we have no user
    if (this.state.users && Array.isArray(this.state.users) && this.state.users.length === 0)
      return (
        <div>No User</div>
      )

    if (this.state.boot && this.state.boot.state === 'maintenance') {
      if (!this.state.boot.lastFileSystem)
        return (
          <GuideBox 
            address={this.props.device.address} 
            storage={this.state.storage} 
            onResize={this.onBoxResize} 
          />
        )
      else
        return <MaintenanceBox />
    } 
    return <div />
  }

  render() {

    let paperStyle = {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: this.props.backgroundColor || '#3F51B5',
      transition: 'all 300ms'
    }

    return (
      <div style={this.props.style}>

        {/* top container */}
        <Paper id='top-half-container' style={paperStyle} >
          <div style={{width: '100%', display: 'flex', alignItems: 'stretch'}}>
            <HoverNav style={{flex: '0 0 64px'}} onTouchTap={this.props.onNavPrev} >
              <NavigationChevronLeft style={{width:32, height:32}} color='#FFF'/>
            </HoverNav>
            <div style={{flexGrow: 1, transition: 'height 300ms'}}>
              <div style={{position: 'relative', width:'100%', height: '100%'}}>
              { 
                React.createElement(this.logoType, { 

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

                  fill: '#FFF',
                  size: this.state.toggle? 40 : 80
                }) 
              }
              <div style={{height: this.state.toggle ? 16 : 192, transition: 'height 300ms'}} />
              <div style={{position: 'relative', transition: 'all 300ms'}}>
                <div style={{
                  fontSize: this.state.toggle ? 14 : 24, 
                  fontWeight: 'medium',
                  color: '#FFF', 
                  marginBottom: this.state.toggle ? 0 : 12,
                }}>{this.model}</div>
                <div style={{fontSize: 14, color: '#FFF', marginBottom: 12, opacity: 0.7}}>
                  {this.props.device.address}
                </div>
                { !this.state.toggle && <div style={{fontSize: 14, color: '#FFF', marginBottom: 16, opacity: 0.7}}>{this.serial}</div> }
              </div>
              </div>
            </div>
            <HoverNav style={{flex: '0 0 64px'}} onTouchTap={this.props.onNavNext} >
              <NavigationChevronRight style={{width:32, height:32}} color='#FFF'/>
            </HoverNav>
          </div>
        </Paper>

        { this.renderFooter() }
      </div>
    )
  }
}

export default DeviceCard
