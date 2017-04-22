import React from 'react'

import Radium from 'radium'
import { Paper, IconButton, Menu, Drawer, Divider } from 'material-ui'

import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more'
import NavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less'

import { cyan700 } from 'material-ui/styles/colors'
import { sharpCurve, sharpCurveDuration, sharpCurveDelay } from '../common/motion'
import Fruitmix from '../common/fruitmix'

import { navMap, fileNavGroup, mediaNavGroup, appifiNavGroup } from './nav'

import AppBar from './AppBar'
import NavDrawer from './NavDrawer'
import QuickNav from './QuickNav'

class Navigation extends React.Component {

  constructor(props) {

    super(props)
    this.navBoundObj = {}
    this.state = {
      nav: 'HOME_DRIVE',
      showDetail: false,
      detailWidth: 400,
      openDrawer: false,
    }

    let token = props.selectedDevice.token
    if (!token.isFulfilled()) throw new Error('token not fulfilled')

    let address = props.selectedDevice.mdev.address
    let userUUID = token.ctx.uuid

    this.fruitmix = new Fruitmix(address, userUUID, token.value().token)
    this.fruitmix.on('updated', (prev, next) => this.setState({ apis: next }))

    this.toggleDetailBound = this.toggleDetail.bind(this)
    this.openDrawerBound = this.openDrawer.bind(this)
  }

  componentDidMount() {
    this.fruitmix.start()
  }

  navTo(nav) {
    this.setState({ nav, openDrawer: false })
  }

  // not used, decorate onto navmap ? TODO
  navBound(navname) {
    return this.navBoundObj[navname] 
      || (this.navBoundObj[navname] = this.navTo.bind(this, navname)) 
  } 

  openDrawer(open) {
    this.setState({openDrawer: open})
  }

  toggleDetail() {
    this.setState({showDetail: !this.state.showDetail})
  }

  renderQuickNavs() {

    let group = fileNavGroup.includes(this.state.nav) 
      ? fileNavGroup
      : mediaNavGroup.includes(this.state.nav)
        ? mediaNavGroup
        : appifiNavGroup.includes(this.state.nav)
          ? appifiNavGroup
          : settingsNavGroup.includes(this.state.nav)
            ? settingsNavGroup
            : null

    return (
      <div style={{width: 72, height: '100%', 
        transition: sharpCurve('width'), backgroundColor: '#FFF', overflow: 'hidden'}}>
        { group && group.map(navname => 
          <QuickNav
            key={`quicknav-${navname}`}
            icon={navMap.get(navname).icon} 
            text={navMap.get(navname).text}
            selected={this.state.nav === navname}
            onTouchTap={this.navBound(navname)}
          />) }
      </div>
    )
  }

  prominent(module) {

    let prominent = module.prominent

    if (!prominent) return false
    if (typeof prominent === 'boolean') 
      return prominent
    if (typeof prominent === 'function') 
      return prominent() // TODO, if function, args required

    return false
  }

  render () {

    const style = {
      width: '100%',  
      height: '100%', 
      display: 'flex', 
      justifyContent: 'space-between',
      overflow: 'hidden'
    }

    let dense = true
    let module = navMap.get(this.state.nav)
    let prominent = this.prominent(module)

    let appbarHeight = prominent ? 96 : 48

    return (
      <div style={style}>

        {/* left frame */} 
        <div style={{height: '100%', position: 'relative', flexGrow: 1}}>
          
          {/* appbar */}
          <AppBar 
            style={{position: 'absolute', width: '100%', height: appbarHeight, 
            backgroundColor: cyan700, overflow: 'hidden'}} 

            toggleDetail={this.toggleDetailBound}
            toggleMenu={this.toggleMenuBound} 
            openDrawer={this.openDrawerBound}
            
            prominent={prominent}
            Toolbar={module.toolbar}
            Title={module.title}
          />
        
          {/* appbar shadow region, for display shadow */}
          <div style={{width: '100%', height: appbarHeight, transition: 'height 300ms'}} />

          {/* content + shortcut container*/}
          <div style={{width: '100%', height: `calc(100% - ${appbarHeight}px)`,
            display: 'flex', justifyContent: 'space-between'}}>

            { this.renderQuickNavs() } 

            {/* content */}
            <div style={{flexGrow: 1, height: '100%', backgroundColor: '#FAFAFA'}}>
              <module.content {...this.state} />
            </div>
            
          </div>
        </div>

        {/* right frame */}
        <div 
          style={{height: '100%', width: this.state.showDetail ? this.state.detailWidth : 0, 
            backgroundColor: '#F5F5F5', transition: sharpCurve('width')
          }}
        >
          world
        </div>

        <NavDrawer 
          open={this.state.openDrawer} 
          onRequestChange={this.openDrawerBound}
          nav={this.state.nav}
          navTo={this.navTo.bind(this)}
        />
      </div>
    )
  }
}

export default Navigation


