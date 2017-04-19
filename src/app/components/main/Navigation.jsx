import React from 'react'

import Radium from 'radium'
import { Paper, IconButton, Menu, Drawer, Divider } from 'material-ui'

import ActionInfo from 'material-ui/svg-icons/action/info'
import ActionDashboard from 'material-ui/svg-icons/action/dashboard'
import ActionExtension from 'material-ui/svg-icons/action/extension'
import ActionSettings from 'material-ui/svg-icons/action/settings'
import ActionExitToApp from 'material-ui/svg-icons/action/exit-to-app'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import SocialNotifications from 'material-ui/svg-icons/social/notifications'

import DeviceStorage from 'material-ui/svg-icons/device/storage'
import FileFolderShared from 'material-ui/svg-icons/file/folder-shared'
import FileFolder from 'material-ui/svg-icons/file/folder'
import SocialPeople from 'material-ui/svg-icons/social/people'
import SocialShare from 'material-ui/svg-icons/social/share'
import FileCloudUpload from 'material-ui/svg-icons/file/cloud-upload'
import FileCloudDownload from 'material-ui/svg-icons/file/cloud-download'
import ActionSwapHoriz from 'material-ui/svg-icons/action/swap-horiz'
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more'
import NavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less'

import { indigo500 } from 'material-ui/styles/colors'
import { sharpCurve, sharpCurveDuration, sharpCurveDelay } from '../common/motion'

import FileTitle from '../file/FileTitle'
import FileToolBar from '../file/FileToolBar'
import FileContent from '../file/FileContent'
import FileDetail from '../file/FileDetail'

const navMap = new Map([
  ['HOME_DRIVE', {
    text: '我的文件',
    icon: FileFolder,
    prominent: () => true,
    toolbar: FileToolBar,
    content: FileContent,
    detail: FileDetail
  }],
  ['PUBLIC_DRIVES', {
    text: '公共文件',
    icon: FileFolderShared,
    prominent: () => true,
    toolbar: FileToolBar,
    content: FileContent,
    detail: FileDetail,
  }],
  ['FSHARED_WITH_ME', {
    text: '分享给我',
    icon: SocialPeople
  }],
  ['FSHARED_WITH_OTHERS', {
    text: '我的分享',
    icon: SocialShare,
  }],
  ['EXT_DRIVES', {
    text: '全部磁盘',
    icon: DeviceStorage,
  }],
  ['UPLOADING', {
    text: '正在上传',
    icon: FileCloudUpload,
  }],
  ['DOWNLOADING', {
    text: '正在下载',
    icon: FileCloudDownload,
  }],
  ['COPY_MOVE', {
    text: '复制移动',
    icon: ActionSwapHoriz,
  }],
  ['MEDIA', {
    text: '照片',
    icon: FileFolder,
  }],
  ['MEDIA_ALBUM', {
    text: '相册',
    icon: FileFolderShared,
  }],
  ['MEDIA_SHARE', {
    text: '分享',
    icon: SocialShare,
  }],
  ['APP_MARKET', {
    text: '应用市场',
    icon: ActionDashboard
  }],
  ['INSTALLED_APPS', {
    text: '我的应用',
    icon: ActionExtension
  }],
  ['SETTINGS_APPS', {
    text: '设置',
    icon: ActionSettings
  }],
  ['LOGOUT', {
    text: '退出',
    icon: ActionExitToApp,
  }]
])

const fileNavGroup = ['HOME_DRIVE', 'PUBLIC_DRIVES', 'FSHARED_WITH_ME', 
  'FSHARED_WITH_OTHERS', 'EXT_DRIVES', 'UPLOADING', 'DOWNLOADING', 'COPY_MOVE' ]

const mediaNavGroup = ['MEDIA', 'MEDIA_ALBUM', 'MEDIA_SHARE']
const appifiNavGroup = ['APP_MARKET', 'INSTALLED_APPS']

class AppBar extends React.Component {

  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {

    let color = '#FFF' // TODO

    let { prominent, Title, Toolbar } = this.props

    console.log('AppBar render, Title, Toolbar', Title, Toolbar)

    let topbarStyle = {
      width: '100%', 
      height: 48, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between'
    }

    let toolbarStyle = {
      flexGrow: 1, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'flex-end'
    }

    let titleRegionStyle = {
      height: prominent ? 48 : 0,
      width: '100%',
      marginLeft: 72,
      transition: 'height 300ms'
    }

    return (
      <Paper style={this.props.style} rounded={false}>

        <div style={topbarStyle}>

          <div style={{flex: '0 0 12px'}} />

          {/** menu button **/}
          <IconButton onTouchTap={() => this.props.openDrawer(true)}>
            <NavigationMenu color='#FFF' />
          </IconButton>

          {/** spacer **/}
          <div style={{flex: '0 0 20px'}} />
         
          {/** non-prominent title **/} 
          { (!prominent && typeof Title === 'string') && 
            <div>{Title}</div> }

          {/** context-sensitive toolbar **/}
          <div style={toolbarStyle}>
            { Toolbar && <Toolbar /> }
          </div>

          {/** global notification button **/}
          <IconButton>
            <SocialNotifications color={color} />
          </IconButton>

          {/** optional toggle detail button **/}
          <IconButton onTouchTap={this.props.toggleDetail}>
            <ActionInfo color={color} />
          </IconButton>

          {/** right padding **/} 
          <div style={{flex: '0 0 12px'}} />

        </div>

        { (prominent && Title && typeof Title === 'string') &&
          <div style={{fontSize: 20, fontWeight: 500, color: '#FFF'}}>{Title}</div> }
        { (prominent && Title && typeof Title !== 'string') && <Title /> }

      </Paper>
    )
  } 
}

class SubHeader extends React.Component {

  render() {
    return (
      <div style={{height: 48, fontSize: 14, fontWeight: 'medium', display: 'flex', alignItems: 'center', color: 'rgba(0,0,0,0.54)'}}>
        <div style={{flex: '0 0 16px'}} />
        {this.props.text}
      </div>
    )
  }
}

class MenuSpacer extends React.PureComponent {

  render() {
    return  <div style={{height: this.props.dense ? 4 : 8}} />
  }
}

@Radium
class MenuItem extends React.PureComponent {

  constructor(props) {
    super(props)
  }

  render() {

    let { icon, text, dense, selected, disabled} = this.props
    let Icon = icon
    let iconColor = selected ? indigo500 : (disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.54)')
    let fontColor = selected ? indigo500 : (disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87)')

    return (
      <div 
        style={{
          width: '100%', height: dense ? 40 : 48, display: 'flex', alignItems: 'center', 
          ':hover': { backgroundColor: '#EEEEEE' }, 
          backgroundColor: selected ? '#F5F5F5' : '#FFF'
        }}
        onTouchTap={this.props.onTouchTap}
      >
        <div style={{flex: '0 0 16px'}} />
        <this.props.icon style={{width: dense ? 18 : 24, height: dense ? 18 : 24, color: iconColor}}/>
        <div style={{flex: '0 0 32px'}} />
        <div style={{flexGrow: 1, fontSize: dense ? 13 : 16, fontWeight: 'medium', color: fontColor}}>{text}</div>
        <div style={{flex: '0 0 16px'}} />
      </div>
    )
  }
}

@Radium
class QuickNav extends React.PureComponent {

  render() {

    let { icon, text, selected, disabled } = this.props
    let Icon = icon
    let color = selected ? indigo500 : (disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.54)')

    return (
      <div 
        style={{
          width: '100%', height: 72, display: 'flex', flexDirection: 'column', alignItems: 'center',
          ':hover': { backgroundColor: '#EEEEEE' },
          backgroundColor: selected ? '#F5F5F5' : '#FFF'
        }}
        onTouchTap={this.props.onTouchTap}
      >
        <div style={{height: 16}} />
        <div style={{height: 24}}><Icon style={{color}}/></div>
        <div style={{marginTop: 6, fontSize:10, lineHeight:'10px', color}}> {text} </div>
      </div>
    )
  }
}

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

    this.toggleDetailBound = this.toggleDetail.bind(this)
    this.openDrawerBound = this.openDrawer.bind(this)
  }

  navTo(nav) {
    this.setState({ nav, openDrawer: false })
  }

  navBound(navname) {
    return this.navBoundObj[navname] || (this.navBoundObj[navname] = this.navTo.bind(this, navname)) 
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
      <div style={{width: 72, height: '100%', transition: sharpCurve('width'), backgroundColor: '#FFF', overflow: 'hidden'}}>
        { group && group.map(navname => 
          <QuickNav
            icon={navMap.get(navname).icon} 
            text={navMap.get(navname).text}
            selected={this.state.nav === navname}
            onTouchTap={this.navBound(navname)}
          />) }
      </div>
    )
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
    let appbarHeight = 96

    let module = navMap.get(this.state.nav)
    let appbar

    if (module) {
      if (typeof module.appbar === 'object') {
        appbar = module.appbar
      }
      else if (typeof module.appbar === 'function') {
        appbar = module.appbar()
      }
    }
    
    if (!appbar)
      appbar = {
        prominent: false,
        title: '木有title', 
        color: indigo500
      }

    appbarHeight = appbar.prominent ? 96 : 48
    let backgroundColor = appbar.color || indigo500
    let Content = module.content

    return (
      <div style={style}>

        {/* left frame */} 
        <div style={{height: '100%', position: 'relative', flexGrow: 1}}>
          
          {/* appbar */}
          <AppBar 

            style={{position: 'absolute', width: '100%', height: appbarHeight, backgroundColor}} 

            toggleDetail={this.toggleDetailBound}
            toggleMenu={this.toggleMenuBound} 
            openDrawer={this.openDrawerBound}
            
            prominent={fileNavGroup.slice(0, 5).includes(this.state.nav) ? true : false}
            Toolbar={fileNavGroup.slice(0, 5).includes(this.state.nav) && FileToolBar}
            Title={fileNavGroup.slice(0,5).includes(this.state.nav) && FileTitle}
          />
        
          {/* appbar shadow region, for display shadow */}
          <div style={{width: '100%', height: appbarHeight, transition: 'height 300ms'}} />

          {/* content + shortcut container*/}
          <div style={{width: '100%', height: `calc(100% - ${appbarHeight}px)`,
            display: 'flex', justifyContent: 'space-between'}}>

            { this.renderQuickNavs() } 

            {/* content */}
            <div style={{flexGrow: 1, height: '100%', backgroundColor: '#FAFAFA'}}>
              <Content /> 
            </div>
            
          </div>
        </div>

        {/* right frame */}
        <div style={{height: '100%', width: this.state.showDetail ? this.state.detailWidth : 0, 
          backgroundColor: '#F5F5F5', transition: sharpCurve('width')}}>
          world
        </div>

        <Drawer docked={false} width={240} open={this.state.openDrawer}
          onRequestChange={this.openDrawerBound}>
          <div style={{width: '100%', height: 135, backgroundColor: '#DDDDDD', margin: 'auto'}}>
            something here
          </div>

          <div style={{height: 4}}/>
          { fileNavGroup.map(navname => 
            <MenuItem 
              icon={navMap.get(navname).icon} 
              text={navMap.get(navname).text}
              dense={true}
              selected={this.state.nav === navname}
              onTouchTap={this.navBound(navname)}
            />) }

          <div style={{height: 4}} />
          <Divider />
          <div style={{height: 4}} />

          { mediaNavGroup.map(navname => 
            <MenuItem 
              icon={navMap.get(navname).icon} 
              text={navMap.get(navname).text}
              dense={dense}
              selected={this.state.nav === navname}
              onTouchTap={this.navBound(navname)}
            />) }

          <div style={{height: 4}} />
          <Divider />
          <div style={{height: 4}} />

          { appifiNavGroup.map(navname => 
            <MenuItem 
              icon={navMap.get(navname).icon} 
              text={navMap.get(navname).text}
              dense={dense}
              selected={this.state.nav === navname}
              onTouchTap={this.navBound(navname)}
            />) }

          <div style={{height: 4}} />
          <Divider />
          <div style={{height: 4}} />

          <MenuItem icon={ActionSettings} text="设置" dense={dense} />

          <div style={{height: 4}} />
          <Divider />
          <div style={{height: 4}} />

          <MenuItem icon={ActionExitToApp} text="退出" dense={dense} />

        </Drawer>
      </div>
    )
  }
}

export default Navigation


