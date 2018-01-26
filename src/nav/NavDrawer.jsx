import React from 'react'
import i18n from 'i18n'
import Radium from 'radium'
import { ipcRenderer } from 'electron'
import { Avatar, IconButton, Drawer, Divider } from 'material-ui'
import ActionSettings from 'material-ui/svg-icons/action/settings'
import ActionExitToApp from 'material-ui/svg-icons/action/exit-to-app'
import ActionAccountCircle from 'material-ui/svg-icons/action/account-circle'
import CloudIcon from 'material-ui/svg-icons/file/cloud'
import ActionDns from 'material-ui/svg-icons/action/dns'
import { DockerIcon } from '../common/Svg'

class SubHeader extends React.Component {
  render() {
    return (
      <div
        style={{ height: 48,
          fontSize: 14,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          color: 'rgba(0,0,0,0.54)' }}
      >
        <div style={{ flex: '0 0 24px' }} />
        {this.props.children}
      </div>
    )
  }
}

class MenuSpacer extends React.PureComponent {
  render() {
    return <div style={{ height: this.props.dense ? 4 : 8 }} />
  }
}

@Radium
class MenuItem extends React.Component {
  render() {
    const { icon, text, dense, primaryColor, selected, disabled } = this.props

    const iconColor = selected
      ? this.props.primaryColor
      : (disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.54)')

    const fontColor = selected
      ? this.props.primaryColor
      : (disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87)')

    return (
      <div
        style={{
          width: '100%',
          height: dense ? 40 : 48,
          display: 'flex',
          alignItems: 'center',
          ':hover': { backgroundColor: '#EEEEEE' },
          backgroundColor: selected ? '#F5F5F5' : '#FFF'
        }}
        onTouchTap={this.props.onTouchTap}
      >
        <div style={{ flex: '0 0 24px' }} />
        <this.props.icon style={{ width: dense ? 18 : 24, height: dense ? 18 : 24, color: iconColor }} />
        <div style={{ flex: '0 0 32px' }} />
        <div style={{ flexGrow: 1, fontSize: dense ? 13 : 14, color: fontColor, fontWeight: 500 }}>
          {text}
        </div>
        <div style={{ flex: '0 0 16px' }} />
      </div>
    )
  }
}

@Radium
class NavDrawer extends React.Component {
  renderGroup(group, ws215i) {
    const { views, nav, navTo } = this.props

    const primaryColor = views[nav].primaryColor()

    return Object.keys(views)
      .filter(key => views[key].navGroup() === group)
      .map((key) => {
        if (!ws215i && key === 'fanControl') return <div key={key} />
        return (
          <MenuItem
            key={key}
            icon={views[key].menuIcon()}
            text={views[key].menuName()}
            primaryColor={primaryColor}
            selected={key === nav}
            onTouchTap={() => navTo(key)}
          />
        )
      })
  }

  render() {
    const { open, onRequestChange, views, nav, navTo } = this.props
    // console.log(' NavDrawer render', this.props)
    const dense = true

    const account = views.account.ctx.props.apis.account
    let value = null
    if (!account.isPending() && !account.isRejected() && account.value()) {
      value = account.value()
    }

    let username = ''
    let isAdmin = false
    if (value) {
      username = value.username
      isAdmin = value.isAdmin
    }

    const primaryColor = views[nav].primaryColor()

    let ws215i = false
    const device = views.account.ctx.props.selectedDevice.device
    if (device && device.data && device.data.ws215i) {
      ws215i = true
    }

    /* avatar */
    let avatarUrl = null
    const index = global.config.users.findIndex(uc => uc && value && uc.userUUID === value.uuid && uc.weChat)
    if (index > -1) avatarUrl = global.config.users[index].weChat.avatarUrl

    /* station name */
    // console.log('viewsselectedDevice', views.account.ctx.props.selectedDevice)
    let station = null
    const info = views.account.ctx.props.selectedDevice.info
    if (info && info.data && info.data.name) {
      station = info.data.name
    }

    const mdev = views.account.ctx.props.selectedDevice.mdev
    const ip = this.props.isCloud ? mdev.lanip : mdev.address
    if (this.props.isCloud) station = mdev.stationName

    return (
      <Drawer docked={false} width={256} open={open} onRequestChange={onRequestChange}>
        <div
          style={{ width: '100%', height: '100%' }}
          onMouseMove={this.props.onMouseMove}
        >
          <div style={{ position: 'relative', width: '100%', backgroundColor: primaryColor }} >
            <div style={{ height: 96, width: '100%', display: 'flex', alignItems: 'center' }} >
              {/* set background of icon */}
              {
                avatarUrl ?
                  <div
                    style={{ borderRadius: 28, width: 56, height: 56, overflow: 'hidden', marginLeft: 23, cursor: 'pointer' }}
                    onTouchTap={() => navTo('account')}
                  >
                    <img width={56} height={56} alt="" src={avatarUrl} />
                  </div> :
                  <IconButton
                    iconStyle={{ width: 67, height: 67, color: 'white' }}
                    style={{ width: 105, height: 105, padding: 19 }}
                    onTouchTap={() => navTo('account')}
                  >
                    <ActionAccountCircle />
                  </IconButton>
              }
            </div>

            <div style={{ height: 44, marginLeft: 24, marginTop: -12 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#FFF', height: 20 }}>{ username }</div>
              <div
                style={{
                  fontSize: 12,
                  color: '#E0E0E0',
                  ':hover': { color: this.props.isCloud || !isAdmin ? '#E0E0E0' : '#FFF' },
                  cursor: this.props.isCloud || !isAdmin ? '' : 'pointer',
                  height: 18,
                  display: 'flex',
                  alignItems: 'center'
                }}
                onTouchTap={() => isAdmin && !this.props.isCloud && navTo('device')}
              >
                { `${station} ( ${ip} )` }
              </div>
            </div>

            <div style={{ position: 'absolute', right: 16, top: 8, display: this.props.isCloud ? '' : 'none' }}>
              <IconButton
                iconStyle={{ color: '#FFFFFF' }}
                tooltip={i18n.__('Connect via Cloud')}
              >
                <CloudIcon />
              </IconButton>
            </div>
          </div>

          <Divider />

          <SubHeader>{ i18n.__('Box Title') }</SubHeader>

          {/* this.renderGroup('file') */}

          <MenuItem
            icon={views.home.menuIcon()}
            text={i18n.__('Files')}
            primaryColor={primaryColor}
            selected={views[nav].navGroup() === 'file'}
            onTouchTap={() => navTo('home')}
          />

          <MenuItem
            icon={views.media.menuIcon()}
            text={i18n.__('Photos')}
            primaryColor={primaryColor}
            selected={views[nav].navGroup() === 'media'}
            onTouchTap={() => navTo('media')}
          />

          <MenuItem
            icon={views.download.menuIcon()}
            text={views.download.menuName()}
            primaryColor={primaryColor}
            selected={nav === 'download'}
            onTouchTap={() => navTo('download')}
          />

          <SubHeader>{ i18n.__('Management Title') }</SubHeader>

          {/*
          <MenuItem
            icon={views.docker.menuIcon()}
            text={i18n.__('Docker')}
            primaryColor={primaryColor}
            selected={views[nav].navGroup() === 'docker'}
            onTouchTap={() => navTo('docker')}
          />
          */}

          <MenuItem
            icon={views.account.menuIcon()}
            text={i18n.__('Users')}
            primaryColor={primaryColor}
            selected={views[nav].navGroup() === 'user'}
            onTouchTap={() => navTo('account')}
          />

          {
            isAdmin && !this.props.isCloud &&
              <MenuItem
                icon={ActionDns}
                text={i18n.__('Device Management')}
                primaryColor={primaryColor}
                selected={views[nav].navGroup() === 'device'}
                onTouchTap={() => navTo('device')}
              />
          }

          <MenuItem
            icon={ActionSettings}
            text={i18n.__('System Settings')}
            primaryColor={primaryColor}
            selected={views[nav].navGroup() === 'settings'}
            onTouchTap={() => navTo('clientSettings')}
          />

          <div style={{ height: 4 }} />
          <Divider />
          <div style={{ height: 4 }} />

          <MenuItem
            icon={ActionExitToApp}
            text={i18n.__('Exit')}
            onTouchTap={() => { ipcRenderer.send('LOGOUT'); this.props.navToMain('login') }}
          />
        </div>
      </Drawer>
    )
  }
}

export default NavDrawer
