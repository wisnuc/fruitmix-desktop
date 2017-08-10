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
    const dense = true

    const account = views.account.ctx.props.apis.account
    let value = null
    if (!account.isPending() && !account.isRejected() && account.value()) {
      value = account.value()
    }

    let serial = views.account.ctx.props.selectedDevice.mdev.serial
    if (serial.length > 11) serial = serial.substring(serial.length - 11)

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

    /*
    console.log('>>>>>>>>>>>>>>>>>>>')
    console.log(this.props)
    console.log(account)
    console.log(value)
    console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<')
    backgroundImage: 'url(../src/assets/images/bg.png)',
    backgroundSize: 'cover'
    */

    return (

      <Drawer docked={false} width={256} open={open} onRequestChange={onRequestChange}>

        <div style={{ position: 'relative', width: '100%', backgroundColor: primaryColor }} >
          <div style={{ height: 96, width: '100%', display: 'flex', alignItems: 'center' }} >
            {/* set background of icon */}
            <IconButton
              iconStyle={{ width: 67, height: 67, color: 'white' }}
              style={{ width: 105, height: 105, padding: 19 }}
              onTouchTap={() => navTo('account')}
            >
              <ActionAccountCircle />
            </IconButton>
          </div>

          <div style={{ height: 40, marginLeft: 24, marginTop: -8 }}>
            <div style={{ fontSize: 20, fontWeight: 500, color: '#FFF' }}>{ username }</div>
          </div>
        </div>

        <Divider />

        <SubHeader>我的盒子</SubHeader>

        <MenuItem
          icon={views.home.menuIcon()}
          text={views.home.menuName()}
          primaryColor={primaryColor}
          selected={nav === 'home' || nav === 'public'}
          onTouchTap={() => navTo('home')}
        />

        <MenuItem
          icon={views.media.menuIcon()}
          text={views.media.menuName()}
          primaryColor={primaryColor}
          selected={views[nav].navGroup() === 'media'}
          onTouchTap={() => navTo('media')}
        />

        <MenuItem
          icon={views.transmission.menuIcon()}
          text={views.transmission.menuName()}
          primaryColor={primaryColor}
          selected={nav === 'transmission'}
          onTouchTap={() => navTo('transmission')}
        />

        { this.renderGroup('physical') }

        { this.renderGroup('trash') }


        {/*
        <div style={{ height: 4 }} />
        <Divider />
        <div style={{ height: 4 }} />
        */}

        <SubHeader>管理</SubHeader>

        <MenuItem
          icon={views.docker.menuIcon()}
          text="应用市场"
          primaryColor={primaryColor}
          selected={views[nav].navGroup() === 'docker'}
          onTouchTap={() => navTo('docker')}
        />

        {
          isAdmin && <MenuItem
            icon={ActionSettings}
            text="系统设置"
            primaryColor={primaryColor}
            selected={views[nav].navGroup() === 'settings'}
            onTouchTap={() => navTo('adminUsers')}
          />
        }

        <MenuItem
          icon={views.device.menuIcon()}
          text={views.device.menuName()}
          primaryColor={primaryColor}
          selected={views[nav].navGroup() === 'device'}
          onTouchTap={() => navTo('device')}
        />

        { this.renderGroup('update') }

        <div style={{ height: 4 }} />
        <Divider />
        <div style={{ height: 4 }} />

        <MenuItem
          icon={ActionExitToApp}
          text="退出"
          onTouchTap={() => {
            ipcRenderer.send('LOGIN_OUT')
            this.props.navToMain('login')
          }}
        />

      </Drawer>
    )
  }
}

export default NavDrawer
