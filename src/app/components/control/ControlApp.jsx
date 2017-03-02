import Debug from 'debug'

const debug = Debug('view:control:device')

import React from 'react'

import { Paper, Divider, Dialog, Menu, MenuItem, IconButton, TextField } from 'material-ui'
import FlatButton from '../common/FlatButton'
import { blue500, blueGrey500, deepOrange500 } from 'material-ui/styles/colors'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import SocialShare from 'material-ui/svg-icons/social/share'
import SocialPeople from 'material-ui/svg-icons/social/people'
import FileFileUpload from 'material-ui/svg-icons/file/file-upload'
import FileFileDownload from 'material-ui/svg-icons/file/file-download'
import ActionSettingsEthernet from 'material-ui/svg-icons/action/settings-ethernet'
import ActionPowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new'
import ActionDNS from 'material-ui/svg-icons/action/dns'
import DeviceAccessTime from 'material-ui/svg-icons/device/access-time'
import DeviceStorage from 'material-ui/svg-icons/device/storage'
import HardwareToys from 'material-ui/svg-icons/hardware/toys'
import EditorModeEdit from 'material-ui/svg-icons/editor/mode-edit'

const LEFTNAV_WIDTH=210

import request from 'superagent'

import TimeDate from './TimeDate'
import Ethernet from './Ethernet'
import Device from './Device'
import Fan from './Fan'
import PowerOff from './PowerOff'
import ChangePasswordButton from './user/ChangePasswordButton'


import { header1Style, header2Style, header2StyleNotFirst, contentStyle } from './styles'

const C = x => f => f ? C(f(x)) : x

const PlaceHolder = () => <div />

class User extends React.Component {

  constructor(props) {

    super(props)
    this.state = {
      err: null,
      data: null,
      usernameDialog: null,
      passwordDialog: null,
      newUserDialog: null,
    }

    this.validateNewUsername = () => {

      let ret = this.state.usernameDialog &&
        this.state.usernameDialog.username &&
        this.state.usernameDialog.username.length

      debug('validate new username', ret)
      return ret
    }

    this.usernameDialogCancel = () =>
      this.setState(Object.assign({}, this.state, { usernameDialog: null }))

    this.usernameDialogOK = () => {
      this.setState(Object.assign({}, this.state, {
        usernameDialog: Object.assign({}, this.state.usernameDialog, { busy: true })
      }))

      request
        .patch(`http://${this.props.address}:${this.props.fruitmixPort}/users/${this.props.user.uuid}`)
        .set('Accept', 'application/json')
        .set('Authorization', 'JWT ' + this.props.user.token)
        .send({ username: this.state.usernameDialog.username })
        .end((err, res) => {

          debug('request patch username', res.body && res.body)

          if (err || !res.ok) return debug('request patch username', err || !res.ok)
          debug('request patch username', res.body)
          this.refreshUsers()
          setTimeout(() => this.setState(Object.assign({}, this.state, { usernameDialog: null })), 1000) 
        })
    }

    this.validateUsername = () => {

      let ret = this.state.newUserDialog && 
        this.state.newUserDialog.username && 
        this.state.newUserDialog.username.length &&
        !this.state.data.find(user => user.username === this.state.newUserDialog.username)
  
      // throw new Error('unexpected execution')

      debug('validate username', ret, this.state.newUserDialog)
      return ret
    }

    this.validatePassword = () => {
      let ret = this.state.newUserDialog && this.state.newUserDialog.password && this.state.newUserDialog.password.length
      
      debug('validate password', ret, this.state.newUserDialog)
      return ret
    }

    this.validatePasswordAgain = () => {

      debug('validate password again, entering')

      let ret = this.state.newUserDialog && 
        this.state.newUserDialog.password &&
        this.state.newUserDialog.password.length &&
        this.state.newUserDialog.password === this.state.newUserDialog.passwordAgain

      debug('validate password again', ret, this.state.newUserDialog)
      return ret
    }

    this.newUserDialogCancel = () => 
      this.setState(Object.assign({}, this.state, { newUserDialog: null }))

    this.newUserDialogOK = () => {
      this.setState(Object.assign({}, this.state, { 
        newUserDialog: Object.assign({}, this.state.newUserDialog, { busy: true })
      }))

      let { address, user } = this.props
     
      request
        .post(`http://${this.props.address}:${this.props.fruitmixPort}/users`)
        .set('Accept', 'application/json')
        .set('Authorization', 'JWT ' + this.props.user.token)
        .send({username: this.state.newUserDialog.username, password: this.state.newUserDialog.password}) 
        .end((err, res) => {
          if (err || !res.ok) {
            debug(err || !res.ok)
            if (res && res.body) debug(res.body.message)
            return
          }

          debug('request create new user', res.body)

          this.refreshUsers()
          setTimeout(() => this.setState(Object.assign({}, this.state, { newUserDialog: null })), 1000) 
        })
    }

    this.refreshUsers = () => {

      request
        .get(`http://${this.props.address}:3721/users`)
        .set('Accept', 'application/json')
        .set('Authorization', 'JWT ' + this.props.user.token)
        .end((err, res) => {

          debug('component did mount, request users endpoint', err || !res.ok || res.body)
          if (err) {
            this.setState(Object.assign({}, this.state, { err, data: null }))
          }
          else if (!res.ok) {
            this.setState(Object.assign({}, this.state, { err: new Error('response not ok'), data: null }))
          }
          else { 
            this.setState(Object.assign({}, this.state, { err: null, data: res.body }))
          }
        })
    }
  }

  componentDidMount() {
    this.refreshUsers()
  }

  renderLine(key, value, icon) {
    return (
      <div style={{height: 48, fontSize: 14, color: 'rgba(0, 0, 0, 0.87)', display: 'flex', alignItems: 'center'}}>
        <div style={{flex: '0 0 120px'}}>{key}</div>
        <div style={{flex: '0 0 160px'}}>{value}</div>
        { icon && <IconButton>{icon}</IconButton> }
      </div>
    )
  }

  renderUserRow(user) {
    return (
      <div style={{height: 48, fontSize: 13, color: 'rgba(0, 0, 0, 0.87)', display: 'flex', alignItems: 'center'}}>
        <div style={{flex: '0 0 320px', fontFamily:'monospace'}}>{ user ? user.uuid.toUpperCase() : '用户ID' }</div>
        <div style={{flex: '0 0 140px'}}>{ user ? user.username: '用户名' }</div>
        <div style={{flex: '0 0 100px'}}>{ user ? (user.type === 'local' ? '本地用户' : '远程用户') : '用户类型' }</div>
        <div style={{flex: '0 0 100px'}}>{ user ? (user.isAdmin ? '是' : '否') : '是管理员' }</div>
        <div style={{flex: '0 0 100px'}}>{ user ? (user.isFirstUser ? '是' : '否') : '是第一个用户' }</div>
      </div>
    )
  }

  renderUserList() {

    if (!this.state.data) return null

    return (
      <div>
        { this.renderUserRow() }
        { this.state.data.map(user => this.renderUserRow(user)) }
      </div> 
    )
  }
  renderUserName() {
    if (!this.state.data) return null
    debug('this.state.data.username', this.state.data[0].username)
    return (
      <div style={Object.assign({}, header1Style, { color: blueGrey500 })}>
        { this.state.data[0].username }
      </div>
    )
  }
  render() {

    let { themeColor, address, fruitmixPort, user } = this.props

    return (
      <div style={this.props.style}>
        <div style={{paddingLeft: 72}}>
          { this.renderUserName() }
          <div style={contentStyle}>
            { user.isAdmin && user.isFirstUser ? 
              '您是系统的第一个用户，是最高权限的系统管理员。' :
              user.isAdmin ? '您是系统管理员。' : '您是系统普通用户。' }
          </div>
          <div style={Object.assign({}, header1Style, { color: blueGrey500 })}>修改信息</div>
          <div style={header2Style}>用户名</div>
          <div style={contentStyle}>
            WISNUC OS内部使用不可修改的唯一用户ID标识用户身份。用户名仅用于用户登录等信息显示，Windows共享文件访问和其他需要登录的网络文件服务在登录时使用。
          </div>
          <div style={contentStyle}>
            用户名可以使用中文字符，包括可显示的标点符号。Windows共享文件访问也支持中文字符的用户名，但不是所有客户端软件都支持中文名，所以，如果您使用的网络文件系统服务客户端软件（例如Android或者iOS上的samba客户端）不支持中文用户名，您只能使用英文大小写字母的用户名。
          </div>
          <FlatButton label='修改用户名' style={{marginLeft: -8}} primary={true} onTouchTap={() => 
            this.setState(Object.assign({}, this.state, { usernameDialog: {} }))} />
          <Dialog key='changeUsername'
            titleStyle={{fontSize: 20, color: 'rgba(0,0,0,0.87)'}}
            contentStyle={{width: 336}}
            title='修改用户名'
            modal={false}
            open={!!this.state.usernameDialog}
            onRequestClose={this.usernameDialogCancel}
          >
            <TextField hintText='' floatingLabelText='新用户名' fullWidth={true} key='changeusername' maxLength={20}
              disabled={this.state.usernameDialog && this.state.usernameDialog.busy}
              onChange={e => {
                this.setState(Object.assign({}, this.state, {
                  usernameDialog: Object.assign({}, this.state.usernameDialog, {
                    username: e.target.value
                  })
                }))
              }}
            />
            <div style={{width: '100%', marginTop: 56, display: 'flex', justifyContent: 'flex-end'}}>
              <FlatButton label='取消' labelStyle={{fontSize: 16, fontSize: 'bold'}} primary={true} 
                disabled={this.state.usernameDialog && this.state.usernameDialog.busy}
                onTouchTap={this.usernameDialogCancel} />
              <FlatButton label='确定' labelStyle={{fontSize: 16, fontSize: 'bold'}} primary={true} 
                disabled={this.state.usernameDialog && this.state.usernameDialog.busy || 
                  !this.validateNewUsername()}
                onTouchTap={this.usernameDialogOK} />
            </div>
          </Dialog>

          <div style={header2StyleNotFirst}>密码</div>
          <div style={contentStyle}>WISNUC OS的所有客户端、Web浏览器和网络文件服务使用相同的用户名密码组合。</div>
          <div style={contentStyle}>WISNUC OS不会保存任何形式的用户明文密码。</div>

          <ChangePasswordButton
            style={{marginBottom:30}}
            themeColor={this.props.themeColor}
            accentColor={deepOrange500}
            address={this.props.address}
            fruitmixPort={this.props.fruitmixPort}
            user={this.props.user}
            onOK={() => console.log('change password OK')}
            onCancel={() => console.log('change password Cancel')}
          />

          { this.props.user.isAdmin &&
          <div>
            <Divider style={{width: 760}}/>
            <div style={Object.assign({}, header1Style, { color: blueGrey500 })}>用户管理</div>
            { this.renderUserList() }
            <div style={{height: 48}} />
            <FlatButton style={{marginBottom: 30, marginLeft: -8}} label='新建用户' primary={true} onTouchTap={() => {
              this.setState(Object.assign({}, this.state, { newUserDialog: {} })) 
            }}/>
            <div>
              <Dialog 
                titleStyle={{fontSize: 20, color: 'rgba(0,0,0,0.87)'}}
                contentStyle={{width: 400}} 
                title='新建用户'
                modal={false} 
                open={!!this.state.newUserDialog} 
                onRequestClose={this.newUserDialogCancel} 
              >
                <TextField hintText='' floatingLabelText='用户名' fullWidth={true}  key='createusername' maxLength={20}
                  disabled={this.state.newUserDialog && this.state.newUserDialog.busy}
                  onChange={e => this.setState(Object.assign({}, this.state, {
                    newUserDialog: Object.assign({}, this.state.newUserDialog, { username: e.target.value })
                  }))}
                />
                <TextField hintText='' floatingLabelText='输入密码' fullWidth={true} key='createpassword'
                  maxLength={40} type='password'
                  disabled={this.state.newUserDialog && this.state.newUserDialog.busy}
                  onChange={e => this.setState(Object.assign({}, this.state, {
                    newUserDialog: Object.assign({}, this.state.newUserDialog, { password: e.target.value })
                  }))}
                />
                <TextField hintText='' floatingLabelText='再次输入密码' fullWidth={true} key='createpasswordagain'
                  maxLength={40} type='password'
                  disabled={this.state.newUserDialog && this.state.newUserDialog.busy}
                  onChange={e => this.setState(Object.assign({}, this.state, {
                    newUserDialog: Object.assign({}, this.state.newUserDialog, { passwordAgain: e.target.value })
                  }))}
                />
                <div style={{height:30}} />
                <div style={{width: '100%', marginTop: 56, display: 'flex', justifyContent: 'flex-end'}}>
                  <FlatButton label='取消' labelStyle={{fontSize: 16, fontSize: 'bold'}} primary={true} 
                    disabled={this.state.newUserDialog && this.state.newUserDialog.busy}
                    onTouchTap={() => this.newUserDialogCancel()} />
                  <FlatButton label='确定' labelStyle={{fontSize: 16, fontSize: 'bold'}} primary={true} 
                    disabled={this.state.newUserDialog && this.state.newUserDialog.busy || !(this.validateUsername() && this.validatePassword() && this.validatePasswordAgain())}
                    onTouchTap={() => this.newUserDialogOK()} />
                </div>
              </Dialog>
            </div>
          </div>
          }

        </div>
      </div>
    )
  }
}

class Storage extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      err: null,
      data: null
    }
  }

  componentDidMount() {

    request
      .get(`http://${this.props.address}:3000/system/storage`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err) {
          this.setState(Object.assign({}, this.state, { err, data: null }))
        }
        else if (!res.ok) {
          this.setState(Object.assign({}, this.state, { err: new Error('response not ok'), data: null }))
        }
        else 
          this.setState(Object.assign({}, this.state, { err: null, data: res.body }))
      })
  }

/**
  render() {
    return (
      <div style={this.props.style}>
        { this.state.data && JSON.stringify(this.state.data, null, '  ') }
      </div>
    ) 
  }
**/

  render() {
    return <div />
  }
}

// this is a container component
class ControlApp extends React.Component {

  constructor(props) {
    
    super(props)

    this.state = {
      leftNav: true,
      detailOn: false,
      select: 'USER'
    }

    this.settings = [
      ['用户', <SocialPeople />, 'USER', User],
      ['设备', <ActionDNS />, 'DEVICE', Device],
      ['存储', <DeviceStorage />, 'STORAGE', Storage],
      ['网络', <ActionSettingsEthernet />, 'ETHERNET', Ethernet],
      ['时间', <DeviceAccessTime />, 'TIMEDATE', TimeDate],
      ['风扇', <HardwareToys />, 'FAN', Fan],
      ['关机', <ActionPowerSettingsNew />, 'POWEROFF', PowerOff]
    ]

    let { device, selectIndex } = window.store.getState().login
    if (device && device[selectIndex]) {
      this.address = device[selectIndex].address
      console.log(this.address)
    }
  }

  renderMenuItem(text, icon, select) {

    return (
      <MenuItem 
        key={`control-panel-${select}`}
        style={{fontSize:14}} 
        primaryText={text} 
        leftIcon={icon}
        disabled={text === '存储' ? true : false}
        onTouchTap={() => this.setState(Object.assign({}, this.state, { select }))} 
      />
    )
  } 

  renderMenu() {

    return (
      <Menu autoWidth={false} listStyle={{width: LEFTNAV_WIDTH}}>
        { this.settings.map(item => this.renderMenuItem(item[0], item[1], item[2])) }        
      </Menu>
    )
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('should update diff')
    if (this.state.leftNav != nextState.leftNav) return true
    if (this.state.detailOn != nextState.detailOn) return true
    if (this.state.select != nextState.select) return true
    return false
  }

  render() {

    const title = () => {
      let found = this.settings.find(item => item[2] === this.state.select)
      return found ? found[0] : '未知控制'
    }

    return (
      <div id='control-app-outer' style={ this.props.style }>

        <div id='control-layout-leftnav-column' 
          style={{
            position: 'absolute',
            width: LEFTNAV_WIDTH, 
            height: '100%', 
            backgroundColor: '#FFF',
            boxSizing: 'border-box',
            borderStyle: 'solid',
            borderWidth: '0 1px 0 0',
            borderColor: '#BDBDBD'
        }}>
          <div style={{width: '100%', height: 56, display: 'flex', alignItems: 'center' }}>
            <div style={{ marginLeft: 72, fontSize: 16, color: 'rgba(0, 0, 0, 0.54)'}}>设置</div>
          </div>
          <Divider />
          { this.renderMenu() }
        </div>          

        <div id='control-layout-middle-container'
          style={{
            position: 'absolute',
            left: LEFTNAV_WIDTH,
            backgroundColor: 'yellow',
            width: `calc(100% - ${LEFTNAV_WIDTH}px)`,
            height:'100%'
          }}
        >
          <Paper style={{position:'absolute', width:'100%', height:56, display:'flex', alignItems:'center', backgroundColor: blueGrey500 }} rounded={false}>
            <div style={{fontSize: 21, color: '#FFF', marginLeft: 72}}>{ title() }</div>
          </Paper>

          <div id='layout-middle-container-spacer' style={{height: 56}} />
          <div id='layout-middle-container-lower' style={{width:'100%', height:'calc(100% - 56px)', backgroundColor: '#FAFAFA', overflowY: 'auto'}}>
            { C(this.settings)
              (settings => settings.find(item => item[2] === this.state.select))
              (found => found && found[3] ? 
                React.createElement(found[3], { 
                  themeColor: blueGrey500, 
                  address: this.address,
                  systemPort: 3000,
                  fruitmixPort: 3721,
                  user: window.store.getState().login.obj 
                }) : <PlaceHolder />)
              () }
          </div> 
        </div>
      </div>
    )
  }
}

export default ControlApp
