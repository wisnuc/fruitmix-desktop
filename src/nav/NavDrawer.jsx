import React, { Component, PureComponent } from 'react'
import muiThemeable from 'material-ui/styles/muiThemeable'
import { ipcRenderer } from 'electron'
import Radium from 'radium'

import { Avatar, IconButton, Drawer, Divider } from 'material-ui'
import FlatButton from '../common/FlatButton'
import ActionSettings from 'material-ui/svg-icons/action/settings'
import ActionExitToApp from 'material-ui/svg-icons/action/exit-to-app'
import ActionAccountCircle from 'material-ui/svg-icons/action/account-circle'
import SocialPerson from 'material-ui/svg-icons/social/person'
import CloudIcon from 'material-ui/svg-icons/file/cloud'
import ActionDns from 'material-ui/svg-icons/action/dns'
import { indigo500 } from 'material-ui/styles/colors'

import { DockerIcon } from '../common/Svg'

class SubHeader extends Component {
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

class MenuSpacer extends PureComponent {
  render() {
    return <div style={{ height: this.props.dense ? 4 : 8 }} />
  }
}

@Radium
class MenuItem extends Component {
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

    return (

      <Drawer docked={false} width={256} open={open} onRequestChange={onRequestChange}>

        <div style={{ position: 'relative', width: '100%', backgroundColor: primaryColor }} >
          <div style={{ height: 96, width: '100%', display: 'flex', alignItems: 'center' }} >
            {/* set background of icon */}
            { avatarUrl ? <div
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

          <div style={{ height: 40, marginLeft: 24, marginTop: -8 }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#FFF' }}>{ username }</div>
          </div>

          <div style={{ position: 'absolute', right: 16, top: 8, display: this.props.isCloud ? '' : 'none' }}>
            <IconButton
              iconStyle={{ color: '#FFFFFF' }}
              tooltip="闻上云连接中"
            >
              <CloudIcon />
            </IconButton>
          </div>
        </div>

        <Divider />

        <SubHeader>我的盒子</SubHeader>

        { this.renderGroup('file') }

        {/*
        <MenuItem
          icon={views.home.menuIcon()}
          text={views.home.menuName()}
          primaryColor={primaryColor}
          selected={nav === 'home' || nav === 'public'}
          onTouchTap={() => navTo('home')}
        />

        <MenuItem
          icon={views.transmission.menuIcon()}
          text={views.transmission.menuName()}
          primaryColor={primaryColor}
          selected={nav === 'transmission'}
          onTouchTap={() => navTo('transmission')}
        />
        */}

        <MenuItem
          icon={views.media.menuIcon()}
          text={views.media.menuName()}
          primaryColor={primaryColor}
          selected={views[nav].navGroup() === 'media'}
          onTouchTap={() => navTo('media')}
        />


        { this.renderGroup('physical') }


        {/* this.renderGroup('trash') */}


        {/*
        <div style={{ height: 4 }} />
        <Divider />
        <div style={{ height: 4 }} />
        */}

        <SubHeader>管理</SubHeader>

        {/*
        <MenuItem
          icon={views.docker.menuIcon()}
          text="应用市场"
          primaryColor={primaryColor}
          selected={views[nav].navGroup() === 'docker'}
          onTouchTap={() => navTo('docker')}
        />
        */}

        {
          isAdmin && <MenuItem
            icon={ActionDns}
            text="设备管理"
            primaryColor={primaryColor}
            selected={views[nav].navGroup() === 'device'}
            onTouchTap={() => navTo('adminUsers')}
          />
        }

        <MenuItem
          icon={ActionSettings}
          text="客户端设置"
          primaryColor={primaryColor}
          selected={views[nav].navGroup() === 'settings'}
          onTouchTap={() => navTo('clientSettings')}
        />

        <div style={{ height: 4 }} />
        <Divider />
        <div style={{ height: 4 }} />

        <MenuItem
          icon={ActionExitToApp}
          text="退出"
          onTouchTap={() => {
            ipcRenderer.send('LOGOUT')
            this.props.navToMain('login')
          }}
        />

      </Drawer>
    )
  }
}

export default NavDrawer
