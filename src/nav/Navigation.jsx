import React from 'react'
import UUID from 'uuid'
import i18n from 'i18n'
import { ipcRenderer } from 'electron'

import { Paper, IconButton, Snackbar } from 'material-ui'
import ActionInfo from 'material-ui/svg-icons/action/info'
import SocialNotifications from 'material-ui/svg-icons/social/notifications'

import Fruitmix from '../common/fruitmix'
import { TasksIcon } from '../common/Svg'
import DialogOverlay from '../common/DialogOverlay'
import { sharpCurve } from '../common/motion'

import Tasks from './Tasks'
import Policy from './Policy'
import QuickNav from './QuickNav'
import TransNav from './TransNav'
import NavDrawer from './NavDrawer'
import Notifications from './Notifications'

import Home from '../view/Home'
import Public from '../view/Public'
import Share from '../view/Share'
import Transmission from '../view/Transmission'

import Box from '../view/Box'
import Group from '../view/Group'
import Media from '../view/Media'
import Assistant from '../view/Assistant'
import Account from '../view/Account'
import Docker from '../view/Docker'
import InstalledApps from '../view/InstalledApps'
import AdminUsers from '../view/AdminUsers'
import Device from '../view/Device'
import FirmwareUpdate from '../view/FirmwareUpdate'
import Networking from '../view/Networking'
import TimeDate from '../view/TimeDate'
import FanControl from '../view/FanControl'
import ClientUpdate from '../view/ClientUpdate'
import Settings from '../view/Settings'
import Power from '../view/Power'
import Download from '../view/Download'
import FinishedList from '../view/FinishedList'
import Plugin from '../view/Plugin'

class NavViews extends React.Component {
  constructor (props) {
    super(props)

    this.navBoundObj = {}

    this.state = {}
    this.views = {}

    this.install('home', Home)
    this.install('share', Share)
    this.install('public', Public)
    this.install('transmission', Transmission)

    this.install('box', Box)
    this.install('group', Group)

    this.install('download', Download)
    this.install('finishedList', FinishedList)

    this.install('media', Media)
    this.install('assistant', Assistant)

    this.install('docker', Docker)
    this.install('installedApps', InstalledApps)

    this.install('account', Account)
    this.install('adminUsers', AdminUsers)
    this.install('device', Device)
    this.install('networking', Networking)
    this.install('timeDate', TimeDate)
    this.install('fanControl', FanControl)
    this.install('power', Power)

    this.install('clientSettings', Settings)
    this.install('plugin', Plugin)
    this.install('firmwareUpdate', FirmwareUpdate)
    this.install('clientUpdate', ClientUpdate)

    Object.assign(this.state, {
      /*
      nts: [
        { id: '123', type: 'firmware', title: '检测到新的固件', body: '点击去安装', action: () => this.navTo('firmwareUpdate') },
        { id: '321', type: 'box', title: '收到新的文件', body: '点击去查看', action: () => this.navTo('public') }
      ],
      */
      nts: [],
      nav: null,
      showNotifications: false,
      showDetail: false,
      openDrawer: false,
      showTasks: false,
      snackBar: '',
      conflicts: null
    })

    this.toggleDetailBound = this.toggleDetail.bind(this)
    this.getDetailStatusBound = this.getDetailStatus.bind(this)
    this.openDrawerBound = this.openDrawer.bind(this)
    this.openSnackBarBound = this.openSnackBar.bind(this)
    this.navToDriveBound = this.navToDrive.bind(this)
    this.navToBound = this.navTo.bind(this)

    this.openMovePolicy = (data) => {
      this.setState({ conflicts: data })
    }

    this.handleTask = (uuid, response, conflicts) => {
      console.log('this.handleTask', uuid, response, conflicts)
      conflicts.forEach((c, index) => {
        let policy
        switch (response[index]) {
          case 'rename':
            policy = ['rename', 'rename']
            break
          case 'replace':
            policy = ['replace', 'replace']
            break
          case 'skip':
            policy = ['skip', 'skip']
            break
          case 'merge':
            policy = ['keep', null]
            break
          case 'overwrite':
            policy = ['keep', null]
            break
          default:
            policy = [null, null]
        }
        this.props.apis.pureRequest('handleTask', { taskUUID: uuid, nodeUUID: c.nodeUUID, policy })
      })
    }

    this.removeNts = (nts) => {
      this.setState({ nts: this.state.nts.filter(nt => !nts.includes(nt)) })
    }

    this.addNts = (nts) => {
      this.setState({ nts: [...this.state.nts, ...nts] })
    }

    this.checkFirmWareAsync = async () => {
      const hideFirmNoti = global.config && global.config.global && global.config.global.hideFirmNoti
      if (hideFirmNoti) return
      await this.props.selectedDevice.pureRequestAsync('checkUpdates')
      let [WIP, firm] = [true, null]
      while (WIP) {
        await Promise.delay(1000)
        firm = await this.props.selectedDevice.pureRequestAsync('firm')
        WIP = firm.fetch.state === 'Working'
      }

      /* find new version */
      if (firm.appifi.tagName.localeCompare(firm.releases[0].remote.tag_name) > 0) {
        const nt = {
          id: UUID.v4(),
          type: 'firmware',
          title: i18n.__('New Firmware Version Detected %s', firm.releases[0].remote.tag_name),
          body: i18n.__('New Firmware Version Detected Text'),
          action: () => this.navTo('firmwareUpdate', { noMoreCheck: true })
        }
        this.addNts([nt])
      }
    }

    this.onMoveInDrawer = () => {
      clearTimeout(this.timer)
    }

    this.init = () => {
      this.navTo('group')
      this.setState({ openDrawer: true })
      this.timer = setTimeout(() => this.setState({ openDrawer: false }), 1500)
      this.checkFirmWareAsync().catch(e => console.error('checkFirmWareAsync error', e))
    }
  }

  componentDidMount () {
    this.init()
    ipcRenderer.send('START_TRANSMISSION')
    ipcRenderer.on('snackbarMessage', (e, message) => this.openSnackBar(message.message))
    ipcRenderer.on('conflicts', (e, args) => this.setState({ conflicts: args }))
  }

  componentDidUpdate () {
    this.currentView().willReceiveProps(this.props)
  }

  componentWillUnmount () {
    clearTimeout(this.timer)
    ipcRenderer.removeAllListeners('snackbarMessage')
    ipcRenderer.removeAllListeners('conflicts')
  }

  getDetailStatus () {
    return this.state.showDetail
  }

  install (name, View) {
    this.views[name] = new View(this)
    this.views[name].on('updated', next => this.setState({ [name]: next }))
    this.state.home = this.views[name].state
  }

  navTo (nav, target) {
    if (nav === this.state.nav) {
      this.setState({ openDrawer: false })
    } else {
      this.setState({ nav, openDrawer: false })
      if (this.state.nav) this.views[this.state.nav].navLeave()
      this.props.setPalette(this.views[nav].primaryColor(), this.views[nav].accentColor())
      this.views[nav].navEnter(target)
    }
  }

  navToDrive (driveUUID, dirUUID) {
    const drives = this.props.apis.drives.data // no drives ?
    const drive = drives.find(d => d.uuid === driveUUID)
    if (drive.tag === 'home') this.navTo('home', { driveUUID, dirUUID })
    else if (drive.tag === 'built-in') this.navTo('share', { driveUUID, dirUUID })
    else this.navTo('public', { driveUUID, dirUUID })
  }

  // not used, decorate onto navmap ? TODO
  navBound (navname) {
    return this.navBoundObj[navname] ||
      (this.navBoundObj[navname] = this.navTo.bind(this, navname))
  }

  openDrawer (open) {
    this.setState({ openDrawer: open })
  }

  toggleDetail () {
    this.setState({ showDetail: !this.state.showDetail })
  }

  openSnackBar (message, options) {
    if (options && options.showTasks) this.setState({ showTasks: true, snackBar: message })
    else this.setState({ snackBar: message })
  }

  currentView () {
    if (!this.state.nav) throw new Error('no nav')
    return this.views[this.state.nav]
  }

  appBarHeight () {
    return this.currentView().prominent() ? 128 : 64
  }

  renderQuickNavs () {
    if (!this.state.nav) return null

    const color = this.currentView().primaryColor()
    const hasQuickNavs = this.currentView().hasQuickNav()
    const navGroupList = Object.keys(this.views).filter(key => this.views[key].navGroup() === this.views[this.state.nav].navGroup())

    /* hide QuickNav if there is only one nav */
    if (navGroupList.length === 1) { return <div /> }

    /* is ws215i ? */
    let ws215i = false
    const device = this.props.selectedDevice.device
    if (device && device.data && device.data.ws215i) ws215i = true

    /* is admin ? */
    let isAdmin = false
    const account = this.props.apis.account
    if (!account.isPending() && !account.isRejected() && account.value() && account.value().isAdmin) isAdmin = true

    /* is cloud ? */
    const mdev = this.props.selectedDevice.mdev
    const isCloud = mdev && !!mdev.isCloud

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
            const noRender = <div key={`quicknav-${key}`} />
            if ((!ws215i || !isAdmin) && key === 'fanControl') return noRender
            if (!isAdmin && (['firmwareUpdate', 'power', 'adminUsers', 'adminDrives', 'plugin'].includes(key))) return noRender
            if (isCloud && ['device', 'networking', 'timeDate', 'fanControl', 'power', 'firmwareUpdate'].includes(key)) return noRender
            if (key === 'transmission' || key === 'transmission2') {
              return (
                <TransNav
                  key={`quicknav-${key}`}
                  icon={this.views[key].quickIcon()}
                  text={this.views[key].quickName()}
                  color={color}
                  selected={key === this.state.nav}
                  onTouchTap={this.navBound(key)}
                />
              )
            }
            return (
              <QuickNav
                key={`quicknav-${key}`}
                Icon={this.views[key].quickIcon()}
                text={this.views[key].quickName()}
                color={key === this.state.nav ? color : 'rgba(0,0,0,0.54)'}
                onTouchTap={this.navBound(key)}
              />)
          })
        }
      </div>
    )
  }

  renderDetailButton () {
    const view = this.currentView()
    if (!view.hasDetail()) return null
    let DetailIcon = ActionInfo
    let tooltip = i18n.__('Detail')
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

  renderDialogButton ({ type, Icon, tooltip, num }) {
    const view = this.currentView()
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
            opacity: this.state[type] ? 0.3 : 0,
            transition: 'opacity 300ms'
          }}
        />
        <IconButton tooltip={tooltip}>
          <Icon
            color={view.appBarStyle() === 'light' ? 'rgba(0,0,0,0.54)' : '#FFF'}
            onTouchTap={() => this.setState({ [type]: !this.state[type] })}
            style={{ position: 'absolute', width: 20, height: 20 }}
          />
        </IconButton>
        {
          num < 100
            ? (
              <div
                style={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: '#F44336',
                  fontSize: 10,
                  fontWeight: 500,
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: num ? 1 : 0,
                  transition: 'all 225ms'
                }}
              >
                { num }
              </div>
            )
            : num > 99
              ? (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 9,
                    width: 24,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: '#F44336',
                    fontSize: 10,
                    fontWeight: 500,
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
              99+
                </div>
              )
              : <div />
        }
      </div>
    )
  }

  renderAppBar () {
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
      zIndex: 101
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

          { view.renderNavigationMenu({ style: {}, onTouchTap: () => this.openDrawer(true) }) }

          <div style={{ flex: '0 0 20px' }} />

          {/* non-prominent title */}
          { !view.prominent() && view.renderTitle({ style: titleStyle }) }

          {/* context-sensitive toolbar, passing style for component list */}
          { view.renderToolBar({ style: toolBarStyle }) }

          {/* Global tasks button */}
          { this.renderDialogButton({ type: 'showTasks', Icon: TasksIcon, tooltip: i18n.__('Tasks') }) }

          {/* optional toggle detail button */}
          { this.renderDetailButton() }

          {/* Global notification button */}
          {
            this.renderDialogButton({
              type: 'showNotifications',
              Icon: SocialNotifications,
              tooltip: i18n.__('Notifications'),
              num: this.state.nts.length
            })
          }

          <div style={{ flex: '0 0 12px' }} />
        </div>

        { view.prominent() && view.renderTitle({ style: titleRegionStyle }) }
      </Paper>
    )
  }

  renderAppBarShadow () {
    return <div style={{ width: '100%', height: this.appBarHeight(), transition: 'height 300ms' }} />
  }

  renderDetail () {
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

  renderSnackBar () {
    return (
      <Snackbar
        open={!!this.state.snackBar}
        message={this.state.snackBar}
        autoHideDuration={4000}
        onRequestClose={() => this.setState({ snackBar: '' })}
      />
    )
  }

  render () {
    if (!this.state.nav) return null

    const view = this.views[this.state.nav]

    /* is cloud ? */
    const mdev = this.props.selectedDevice.mdev
    const isCloud = mdev && !!mdev.isCloud

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
          justifyContent: 'space-between'
        }}
      >
        {/* left frame */}
        <div style={{ height: '100%', position: 'relative', flexGrow: 1 }}>
          { this.renderAppBar() }
          { this.renderAppBarShadow() }
          {/* content + shortcut container */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              height: `calc(100% - ${this.appBarHeight()}px)`
            }}
          >

            { view.showQuickNav() && this.renderQuickNavs() }

            {/* content */}
            <div
              id="content-container"
              style={{ width: '100%', height: '100%', paddingLeft: 8, paddingTop: 8, boxSizing: 'border-box' }}
            >
              {
                view.render({
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
          onMouseMove={this.onMoveInDrawer}
          open={this.state.openDrawer}
          onRequestChange={this.openDrawerBound}
          views={this.views}
          nav={this.state.nav}
          navTo={this.navToBound}
          navToMain={this.props.nav}
          isCloud={isCloud}
        />

        {/* drag item */}
        { view.renderDragItems() }

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
                handleTask={this.handleTask}
              />
          }
        </DialogOverlay>

        {/* Tasks */}
        {
          this.state.showTasks &&
            <Tasks
              apis={this.props.apis}
              onRequestClose={() => this.setState({ showTasks: false })}
              showDetail={this.state.showDetail}
              openMovePolicy={this.openMovePolicy}
            />
        }

        {/* Notifications */}
        {
          this.state.showNotifications &&
            <Notifications
              ipcRenderer={ipcRenderer}
              removeNts={this.removeNts}
              apis={this.props.apis}
              onRequestClose={() => this.setState({ showNotifications: false })}
              showDetail={this.state.showDetail}
              nts={this.state.nts}
            />
        }
      </div>
    )
  }
}

/**
  this wrapper is necessary because apis update should be routed to each individual view
  if both apis and views are put into the same component, it is hard to inform view model
  to process states like componentWillReceiveProps does. React props is essentially an
  event routing.
*/
class Navigation extends React.Component {
  constructor (props) {
    super(props)

    /* init apis */
    const token = props.selectedDevice.token
    if (!token.isFulfilled()) throw new Error('token not fulfilled')

    const { address, isCloud } = props.selectedDevice.mdev
    const userUUID = token.ctx.uuid
    this.fruitmix = new Fruitmix(address, userUUID, token.data.token, isCloud, token.data.stationID)
    this.fruitmix.on('updated', (prev, next) => this.setState({ apis: next }))

    this.state = { apis: null }
  }

  componentDidMount () {
    this.fruitmix.start()
  }

  render () {
    return <NavViews apis={this.state.apis} {...this.props} />
  }
}

export default Navigation
