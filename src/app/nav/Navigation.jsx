import React from 'react'
import Debug from 'debug'
import { ipcRenderer } from 'electron'

import { Paper, IconButton, Snackbar } from 'material-ui'
import SocialNotifications from 'material-ui/svg-icons/social/notifications'
import ActionInfo from 'material-ui/svg-icons/action/info'

import Fruitmix from '../common/fruitmix'
import DialogOverlay from '../common/DialogOverlay'
import Policy from '../common/Policy'
import { sharpCurve, sharpCurveDuration, sharpCurveDelay } from '../common/motion'

import NavDrawer from './NavDrawer'
import QuickNav from './QuickNav'

import Home from '../view/Home'
import Public from '../view/Public'
import Physical from '../view/Physical'
import Transmission from '../view/Transmission'

import Media from '../view/Media'
import Assistant from '../view/Assistant'
import Trash from '../view/Trash'
import Account from '../view/Account'
import Docker from '../view/Docker'
import InstalledApps from '../view/InstalledApps'
import AdminUsers from '../view/AdminUsers'
import AdminDrives from '../view/AdminDrives'
import Device from '../view/Device'
import FirmwareUpdate from '../view/FirmwareUpdate'
import Networking from '../view/Networking'
import TimeDate from '../view/TimeDate'
import FanControl from '../view/FanControl'
import ClientUpdate from '../view/ClientUpdate'
import Settings from '../view/Settings'
import Power from '../view/Power'

const debug = Debug('component:nav:Navigation')

class NavViews extends React.Component {

  constructor(props) {
    super(props)

    this.navBoundObj = {}

    this.state = {}
    this.views = {}

    this.install('home', Home)
    this.install('public', Public)
    // this.install('physical', Physical)
    // this.install('fileSharedWithMe', FileSharedWithMe)
    // this.install('fileSharedWithOthers', FileSharedWithOthers)
    this.install('transmission', Transmission)

    this.install('media', Media)
    this.install('assistant', Assistant)
    // this.install('mediaShare', MediaShare)
    // this.install('mediaAlbum', MediaAlbum)

    this.install('trash', Trash)

    this.install('docker', Docker)
    this.install('installedApps', InstalledApps)

    this.install('account', Account)
    this.install('adminUsers', AdminUsers)
    this.install('adminDrives', AdminDrives)
    this.install('device', Device)
    this.install('networking', Networking)
    this.install('timeDate', TimeDate)
    this.install('fanControl', FanControl)
    this.install('clientSettings', Settings)
    this.install('clientUpdate', ClientUpdate)
    // this.install('firmwareUpdate', FirmwareUpdate)
    this.install('power', Power)


    Object.assign(this.state, {
      nav: null,
      showDetail: false,
      openDrawer: false,
      snackBar: '',
      conflicts: null
    })

    this.toggleDetailBound = this.toggleDetail.bind(this)
    this.getDetailStatusBound = this.getDetailStatus.bind(this)
    this.openDrawerBound = this.openDrawer.bind(this)
    this.openSnackBarBound = this.openSnackBar.bind(this)
    this.navToDriveBound = this.navToDrive.bind(this)
  }

  install(name, View) {
    this.views[name] = new View(this)
    this.views[name].on('updated', next => this.setState({ [name]: next }))
    this.state.home = this.views[name].state
  }

  componentDidMount() {
    this.navTo('home')
    ipcRenderer.send('START_TRANSMISSION')
    ipcRenderer.on('snackbarMessage', (e, message) => {
      this.openSnackBar(message.message)
    })
    ipcRenderer.on('conflicts', (e, args) => {
      debug('ipcRnederer on conflicts', args)
      this.setState({ conflicts: args })
    })
  }

  componentDidUpdate() {
    this.currentView().willReceiveProps(this.props)
  }

  navTo(nav, target) {
    debug('navTo', nav, target, this.state.nav)
    if (nav === this.state.nav) return
    this.setState({ nav, openDrawer: false, showDetail: false })
    if (this.state.nav) this.views[this.state.nav].navLeave()
    this.props.setPalette(this.views[nav].primaryColor(), this.views[nav].accentColor())
    this.views[nav].navEnter(target)
  }

  navToDrive(driveUUID, dirUUID) {
    const drives = this.props.apis.drives.data // no drives ?
    const drive = drives.find(d => d.uuid === driveUUID)
    if (drive.tag === 'home') this.navTo('home', { driveUUID, dirUUID })
    else this.navTo('public', { driveUUID, dirUUID })
    debug('navToDrive', driveUUID, dirUUID, this.props)
  }

  // not used, decorate onto navmap ? TODO
  navBound(navname) {
    return this.navBoundObj[navname]
      || (this.navBoundObj[navname] = this.navTo.bind(this, navname))
  }

  openDrawer(open) {
    this.setState({ openDrawer: open })
  }

  toggleDetail() {
    this.setState({ showDetail: !this.state.showDetail })
  }

  getDetailStatus() {
    return this.state.showDetail
  }

  openSnackBar(message) {
    this.setState({ snackBar: message })
  }

  currentView() {
    if (!this.state.nav) throw new Error('no nav')
    return this.views[this.state.nav]
  }

  renderQuickNavs() {
    if (!this.state.nav) return null

    const color = this.currentView().primaryColor()
    const group = this.views[this.state.nav].navGroup()
    const hasQuickNavs = this.currentView().hasQuickNav()
    const navGroupList = Object.keys(this.views).filter(key => this.views[key].navGroup() === this.views[this.state.nav].navGroup())

    /* hide QuickNav if there is only one nav */
    if (navGroupList.length === 1) { return <div /> }

    /* is ws215i ? */
    let ws215i = false
    const device = this.props.selectedDevice.device
    if (device && device.data && device.data.ws215i) {
      ws215i = true
    }

    /* is admin ? */
    let isAdmin = false
    const account = this.props.apis.account
    // debug('renderQuickNavs', account)
    if (!account.isPending() && !account.isRejected() && account.value() && account.value().isAdmin) {
      isAdmin = true
    }

    return (
      <div
        style={{
          width: 72,
          height: '100%',
          paddingTop: 8,
          transition: sharpCurve('width'),
          backgroundColor: '#FFF',
          overflow: 'hidden'
        }}
      >
        {
          hasQuickNavs && navGroupList.map((key) => {
            if ((!ws215i || !isAdmin) && key === 'fanControl') return <div key={`quicknav-${key}`} />
            if (!isAdmin && (key === 'firmwareUpdate' || key === 'power')) return <div key={`quicknav-${key}`} />
            return (
              <QuickNav
                key={`quicknav-${key}`}
                icon={this.views[key].quickIcon()}
                text={this.views[key].quickName()}
                color={color}
                selected={key === this.state.nav}
                onTouchTap={this.navBound(key)}
              />)
          })
        }
      </div>
    )
  }

  appBarHeight() {
    return this.currentView().prominent() ? 128 : 64
  }

  renderDetailButton() {
    const view = this.currentView()
    if (!view.hasDetail()) return null
    let DetailIcon = ActionInfo
    let tooltip = '详情'
    if (view.detailIcon()) {
      DetailIcon = view.detailIcon()
      tooltip = ''
    }

    const onTouchTap = view.detailEnabled()
      ? this.toggleDetail.bind(this)
      : undefined

    const color = view.detailEnabled()
      ? 'rgba(255,255,255,1)'
      : 'rgba(255,255,255,0.3)'

    return (
      <div style={{ width: 48, height: 48, position: 'relative' }} >

        <div
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            width: 40,
            height: 40,
            backgroundColor: '#FFF',
            borderRadius: 20,
            opacity: this.state.showDetail ? 0.3 : 0,
            transition: 'opacity 300ms'
          }}
        />

        <IconButton style={{ position: 'absolute' }} onTouchTap={onTouchTap} tooltip={tooltip}>
          <DetailIcon color={color} />
        </IconButton>
      </div>
    )
  }

  renderAppBar() {
    const view = this.currentView()
    let backgroundColor
    switch (view.appBarStyle()) {
      case 'light':
        backgroundColor = '#FFF'
        break
      case 'colored':
      case 'dark':
        backgroundColor = view.appBarColor()
        break
      case 'transparent':
      default:
        break
    }


    const appBarStyle = {
      position: 'absolute',
      width: '100%',
      height: this.appBarHeight(),
      backgroundColor,
      overflow: 'hidden'
    }

    const topBarStyle = {
      width: '100%',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }

    const titleStyle = {
      color: '#FFF',
      fontSize: 20,
      fontWeight: 500
    }

    const toolBarStyle = {
      flexGrow: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end'
    }

    const titleRegionStyle = {
      width: view.showQuickNav() ? 'calc(100% - 72)' : '100%',
      height: 64,
      marginLeft: view.showQuickNav() ? 72 : 0,
      display: 'flex',
      alignItems: 'center',
      color: '#FFF',
      fontSize: 20,
      fontWeight: 500,
      flexWrap: 'wrap'
    }

    return (
      <Paper style={appBarStyle} rounded={false}>

        <div style={topBarStyle}>

          <div style={{ flex: '0 0 12px' }} />

          {/** NavigationMenu ({ style, onTouchTap })**/}
          { view.renderNavigationMenu({ style: {}, onTouchTap: () => this.openDrawer(true) }) }

          <div style={{ flex: '0 0 20px' }} />

          {/** non-prominent title **/}
          { !view.prominent() && view.renderTitle({ style: titleStyle }) }

          {/** context-sensitive toolbar, passing style for component list **/}
          { view.renderToolBar({ style: toolBarStyle }) }

          {/** global notification button **/}
          <IconButton>
            <SocialNotifications color={view.appBarStyle() === 'light' ? 'rgba(0,0,0,0.54)' : 'rgba(255,255,255,0.5)'} />
          </IconButton>

          {/** optional toggle detail button **/}
          { this.renderDetailButton() }

          <div style={{ flex: '0 0 12px' }} />
        </div>

        { view.prominent() && view.renderTitle({ style: titleRegionStyle }) }
      </Paper>
    )
  }

  renderAppBarShadow() {
    return <div style={{ width: '100%', height: this.appBarHeight(), transition: 'height 300ms' }} />
  }

  renderDetail() {
    const view = this.currentView()

    if (!view.hasDetail() || !view.detailEnabled()) return null

    const style = {
      flexShrink: 0,
      height: '100%',
      backgroundColor: '#FAFAFA',
      width: this.state.showDetail ? view.detailWidth() : 0,
      transition: sharpCurve('width')
    }
    /* {style}, function to close Detail page */
    return view.renderDetail({ style, openSnackBar: this.openSnackBarBound })
  }

  renderSnackBar() {
    // debug('renderSnackBar', this.state.snackBar)
    return (
      <Snackbar
        open={!!this.state.snackBar}
        message={this.state.snackBar}
        autoHideDuration={4000}
        onRequestClose={() => this.setState({ snackBar: '' })}
      />
    )
  }

  render() {
    if (!this.state.nav) return null

    const style = {
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      overflow: 'hidden'
    }

    const view = this.views[this.state.nav]
    const prominent = view.prominent()
    const cardTitleStyle = {
      height: 64,
      display: 'flex',
      alignItems: 'center',
      color: 'rgba(0,0,0,0.54)',
      fontSize: 20,
      fontWeight: 500,
      flexWrap: 'wrap'
    }

    return (
      <div style={style}>

        {/* left frame */}
        <div style={{ height: '100%', position: 'relative', flexGrow: 1 }}>

          { this.renderAppBar() }
          { this.renderAppBarShadow() }

          {/* content + shortcut container*/}
          <div
            style={{ width: '100%',
              height: `calc(100% - ${this.appBarHeight()}px)`,
              display: 'flex',
              justifyContent: 'space-between' }}
          >

            { view.showQuickNav() && this.renderQuickNavs() }

            {/* content */}
            <div style={{ width: '100%', height: '100%', paddingLeft: 8, paddingTop: 8, boxSizing: 'border-box' }} id="content-container">
              {
                view.renderContent({
                  navTo: this.navTo.bind(this),
                  toggleDetail: this.toggleDetailBound,
                  openSnackBar: this.openSnackBarBound,
                  getDetailStatus: this.getDetailStatusBound,
                  navToDrive: this.navToDriveBound
                })
              }
            </div>
          </div>
        </div>

        {/* right frame */}
        { this.renderDetail() }

        <NavDrawer
          open={this.state.openDrawer}
          onRequestChange={this.openDrawerBound}
          views={this.views}
          nav={this.state.nav}
          navTo={this.navTo.bind(this)}
          navToMain={this.props.nav}
        />

        {/* snackBar */}
        { this.renderSnackBar() }

        {/* upload policy */}
        <DialogOverlay open={!!this.state.conflicts} onRequestClose={() => this.setState({ conflicts: null })} >
          {
            this.state.conflicts &&
              <Policy
                primaryColor={this.currentView().primaryColor()}
                data={this.state.conflicts}
                ipcRenderer={ipcRenderer}
              />
          }
        </DialogOverlay>
      </div>
    )
  }
}

/**
  this wrapper is necessary because apis update should be routed to each individual view
  if both apis and views are put into the same component, it is hard to inform view model
  to process states like componentWillReceiveProps does. React props is essentially an
  event routing.
**/
class Navigation extends React.Component {

  constructor(props) {
    super(props)

    /** init apis **/
    const token = props.selectedDevice.token
    if (!token.isFulfilled()) throw new Error('token not fulfilled')

    const address = props.selectedDevice.mdev.address
    const userUUID = token.ctx.uuid
    this.fruitmix = new Fruitmix(address, userUUID, token.value().token)
    this.fruitmix.on('updated', (prev, next) => this.setState({ apis: next }))

    this.state = { apis: null }
  }

  componentDidMount() {
    this.fruitmix.start()
  }

  render() {
    return <NavViews apis={this.state.apis} {...this.props} />
  }
}

export default Navigation
