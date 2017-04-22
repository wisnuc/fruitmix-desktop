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

  render () {

    let layoutProps = {
      
    }

    let Container = navMap.get(this.state.nav)

    return <Container layoutProps={layoutProps} />
  }
}

export default Navigation


