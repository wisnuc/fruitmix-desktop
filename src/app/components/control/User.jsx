import React from 'react'
import Debug from 'debug'
const debug = Debug('view:control:device')

import { Paper, Divider, Dialog, Menu, MenuItem, IconButton, TextField } from 'material-ui'
import FlatButton from '../common/FlatButton'
import { blueGrey500, deepOrange500} from 'material-ui/styles/colors'
import EditorModeEdit from 'material-ui/svg-icons/editor/mode-edit'
import Checkmark from '../common/Checkmark'
import request from 'superagent'
import ChangePasswordButton from './user/ChangePasswordButton'
import { header1Style, header2Style, header2StyleNotFirst, contentStyle} from './styles'





class User extends React.Component {

  constructor(props) {

    super(props)
    this.state = {
      err: null,
      data: null,
      usernameDialog: null,
      passwordDialog: null,
      newUserDialog: null,
      success: 0,
      errorText: null
    }

    this.validateNewUsername = () => {

      let ret = this.state.usernameDialog &&
        this.state.usernameDialog.username &&
        this.state.usernameDialog.username.length &&
        !this.state.data.find(user => user.username === this.state.usernameDialog.username)

      //debug('validate new username', ret)
      return ret
    }

    this.usernameDialogCancel = () =>
      this.setState(Object.assign({}, this.state, { usernameDialog: null, success: 0, errorText: null}))

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
          debug('request patch username, err, res.body', err, res.body && res.body)
          let ErrorText="修改失败，请重试！"
          if (err || !res.ok){
            if(res.body.message === "invalid username") {
              ErrorText="不能使用该用户名，可能是重复的用户名，请重试！"
            }
            this.setState(Object.assign({}, this.state, { errorText: ErrorText, usernameDialog: {}, success: 0}))
            return
          }
          //debug('request patch username', res.body)
          this.refreshUsers()
          this.setState({ success: 1 })
          setTimeout(() => this.setState(Object.assign({}, this.state, { usernameDialog: null, success: 0 })), 1000)
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
      
      //debug('validate password', ret, this.state.newUserDialog)
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
            //debug(err || !res.ok)
            let ErrorText="修改失败，请重试！"
            if(res.body.message === "invalid username") {
              ErrorText="不能使用该用户名，可能是重复的用户名，请重试！"
            }
            this.setState(Object.assign({}, this.state, { errorText: ErrorText, usernameDialog: {}, success: 0}))
            return
          }
          //debug('request create new user', res.body)
          this.refreshUsers()
          this.setState({ success: 1 })
          setTimeout(() => this.setState(Object.assign({}, this.state, { newUserDialog: null, success: 0 })), 1000)
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
        <div style={{flex: '0 0 140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{ user ? user.username: '用户名' }</div>
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
    //if (!this.state.data) return null
    //debug('this.state.data.username', this.state.data[0].username)
    return (
      <div style={Object.assign({}, header1Style, { color: blueGrey500 })}>
        { this.state.data ? this.state.data[0].username
            : ' '
        }
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
            title={this.state.success ? '修改成功':'修改用户名'}
            modal={false}
            open={!!this.state.usernameDialog}
            onRequestClose={this.usernameDialogCancel}
          >
          {/*add checkmark*/}
          { this.state.success === 0
            ? <div>
                <TextField hintText='' floatingLabelText='新用户名' fullWidth={true} key='changeusername' maxLength={20}
                  disabled={this.state.usernameDialog && this.state.usernameDialog.busy}
                  errorText={this.state.errorText}
                  onChange={e => {
                    this.setState(Object.assign({}, this.state, {
                      usernameDialog: Object.assign({}, this.state.usernameDialog, {
                        username: e.target.value
                      }),errorText: null
                    }))
                  }}
                />
                <div style={{width: '100%', marginTop: 56, display: 'flex', justifyContent: 'flex-end'}}>
                  <FlatButton label='取消' primary={true} 
                    disabled={this.state.usernameDialog && this.state.usernameDialog.busy}
                    onTouchTap={this.usernameDialogCancel} />
                  <FlatButton label='确定' primary={true} 
                    disabled={this.state.usernameDialog && this.state.usernameDialog.busy || 
                      !this.validateNewUsername()}
                    onTouchTap={this.usernameDialogOK} />
                </div>
              </div>
            : <div style={{width: '100%', display:'flex', alignItems:'center', justifyContent: 'center'}}>
                <Checkmark primary={true} delay={300} />
              </div>
           }
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
                title={this.state.success ? '新建用户成功':'新建用户'}
                modal={false} 
                open={!!this.state.newUserDialog} 
                onRequestClose={this.newUserDialogCancel} 
              >
                {/*add checkmark*/}
                {this.state.success === 0
                  ? <div>
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
                        <FlatButton label='取消' primary={true} 
                          disabled={this.state.newUserDialog && this.state.newUserDialog.busy}
                          onTouchTap={() => this.newUserDialogCancel()} />
                        <FlatButton label='确定' primary={true} 
                          disabled={this.state.newUserDialog && this.state.newUserDialog.busy || !(this.validateUsername() && this.validatePassword() && this.validatePasswordAgain())}
                          onTouchTap={() => this.newUserDialogOK()} />
                      </div>
                    </div>
                  : <div style={{width: '100%', display:'flex', alignItems:'center', justifyContent: 'center'}}>
                      <Checkmark primary={true} delay={300} />
                    </div>
                }
              </Dialog>
            </div>
          </div>
          }

        </div>
      </div>
    )
  }
}

export default User
