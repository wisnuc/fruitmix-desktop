import React from 'react'
import Debug from 'debug'
import { Paper, Divider, Dialog, Menu, MenuItem, IconButton, TextField, Avatar } from 'material-ui'
import { deepOrange500 } from 'material-ui/styles/colors'
import ActionAccountCircle from 'material-ui/svg-icons/action/account-circle'
import request from 'superagent'
import ChangePasswordButton from './user/ChangePasswordButton'
import FlatButton from '../common/FlatButton'
import Checkmark from '../common/Checkmark'

const debug = Debug('component:control:device')

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
      const ret = this.state.usernameDialog &&
        this.state.usernameDialog.username &&
        this.state.usernameDialog.username.length &&
        !this.state.data.find(user => user.username === this.state.usernameDialog.username)

      // debug('validate new username', ret)
      return ret
    }

    this.usernameDialogCancel = () =>
      this.setState(Object.assign({}, this.state, { usernameDialog: null, success: 0, errorText: null }))

    this.usernameDialogOK = () => {
      this.setState(Object.assign({}, this.state, {
        usernameDialog: Object.assign({}, this.state.usernameDialog, { busy: true })
      }))
      request
        .patch(`http://${this.props.address}:${this.props.fruitmixPort}/users/${this.props.user.uuid}`)
        .set('Accept', 'application/json')
        .set('Authorization', `JWT ${this.props.user.token}`)
        .send({ username: this.state.usernameDialog.username })
        .end((err, res) => {
          debug('request patch username, err, res.body', err, res.body && res.body)
          let ErrorText = '修改失败，请重试！'
          if (err || !res.ok) {
            if (res.body.message === 'invalid username') {
              ErrorText = '不能使用该用户名，可能是重复的用户名，请重试！'
            }
            this.setState(Object.assign({}, this.state, { errorText: ErrorText, usernameDialog: {}, success: 0 }))
            return
          }
          // debug('request patch username', res.body)
          this.refreshUsers()
          this.setState({ success: 1 })
          setTimeout(() => this.setState(Object.assign({}, this.state, { usernameDialog: null, success: 0 })), 1000)
        })
    }

    this.validateUsername = () => {
      const ret = this.state.newUserDialog &&
        this.state.newUserDialog.username &&
        this.state.newUserDialog.username.length &&
        !this.state.data.find(user => user.username === this.state.newUserDialog.username)

      // throw new Error('unexpected execution')

      debug('validate username', ret, this.state.newUserDialog)
      return ret
    }

    this.validatePassword = () => {
      const ret = this.state.newUserDialog && this.state.newUserDialog.password && this.state.newUserDialog.password.length

      // debug('validate password', ret, this.state.newUserDialog)
      return ret
    }

    this.validatePasswordAgain = () => {
      debug('validate password again, entering')

      const ret = this.state.newUserDialog &&
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

      const { address, user } = this.props

      request
        .post(`http://${this.props.address}:${this.props.fruitmixPort}/users`)
        .set('Accept', 'application/json')
        .set('Authorization', `JWT ${this.props.user.token}`)
        .send({ username: this.state.newUserDialog.username, password: this.state.newUserDialog.password })
        .end((err, res) => {
          if (err || !res.ok) {
            // debug(err || !res.ok)
            let ErrorText = '修改失败，请重试！'
            if (res.body.message === 'invalid username') {
              ErrorText = '不能使用该用户名，可能是重复的用户名，请重试！'
            }
            this.setState(Object.assign({}, this.state, { errorText: ErrorText, usernameDialog: {}, success: 0 }))
            return
          }
          // debug('request create new user', res.body)
          this.refreshUsers()
          this.setState({ success: 1 })
          setTimeout(() => this.setState(Object.assign({}, this.state, { newUserDialog: null, success: 0 })), 1000)
        })
    }

    this.refreshUsers = () => {
    }
  }

  render() {
    debug('this.props Account', this.props)
    const { account, primaryColor, apis } = this.props
    if (!account) return <div />
    return (
      <div style={{ paddingLeft: 72 }}>
        {/* avatar */}
        <div style={{ display: 'flex', alignItems: 'center' }} >
          {
            account.avatar ? <div /> :
              <IconButton
                iconStyle={{ width: 48, height: 48, color: primaryColor }}
                style={{ width: 80, height: 80, padding: 16 }}
              >
                <ActionAccountCircle />
              </IconButton>
          }
          <div style={{ fontSize: 24, color: primaryColor }} > {`${account.username}`} </div>
        </div>


        {/* user type */}
        <div>
          {
            account.isAdmin && account.isFirstUser ?
              '您是系统的第一个用户，是最高权限的系统管理员。' :
              account.isAdmin ? '您是系统管理员。' : '您是系统普通用户。'
          }
        </div>

        {/* username */}
        <div style={{ fontSize: 24, fontWeight: 500, marginTop: 24, marginBottom: 24 }} > 用户名 </div>
        <div
          style={{
            fontSize: 14,
            lineHeight: '24px',
            marginBottom: 20,
            maxWidth: 1000,
            color: '#000',
            opacity: 0.87
          }}
        >
          WISNUC OS内部使用不可修改的唯一用户ID标识用户身份。用户名仅用于用户登录等信息显示，
          Windows共享文件访问和其他需要登录的网络文件服务在登录时使用。
          <br />
          <br />
          用户名可以使用中文字符，包括可显示的标点符号。Windows共享文件访问也支持中文字符的用户名，
          但不是所有客户端软件都支持中文名，所以，如果您使用的网络文件系统服务客户端软件（例如Android或者iOS上的samba客户端）
          不支持中文用户名，您只能使用英文大小写字母的用户名。
        </div>
        <FlatButton
          label="修改用户名"
          style={{ marginLeft: -8 }}
          primary
          onTouchTap={() => this.setState(Object.assign({}, this.state, { usernameDialog: {} }))}
        />
        <Dialog
          key="changeUsername"
          titleStyle={{ fontSize: 20, color: 'rgba(0,0,0,0.87)' }}
          contentStyle={{ width: 336 }}
          title={this.state.success ? '修改成功' : '修改用户名'}
          modal={false}
          open={!!this.state.usernameDialog}
          onRequestClose={this.usernameDialogCancel}
        >
          {/* add checkmark*/}
          { this.state.success === 0
              ? <div>
                <TextField
                  hintText="" floatingLabelText="新用户名" fullWidth key="changeusername" maxLength={20}
                  disabled={this.state.usernameDialog && this.state.usernameDialog.busy}
                  errorText={this.state.errorText}
                  onChange={(e) => {
                    this.setState(Object.assign({}, this.state, {
                      usernameDialog: Object.assign({}, this.state.usernameDialog, {
                        username: e.target.value
                      }),
                      errorText: null
                    }))
                  }}
                />
                <div style={{ width: '100%', marginTop: 56, display: 'flex', justifyContent: 'flex-end' }}>
                  <FlatButton
                    label="取消" primary
                    disabled={this.state.usernameDialog && this.state.usernameDialog.busy}
                    onTouchTap={this.usernameDialogCancel}
                  />
                  <FlatButton
                    label="确定" primary
                    disabled={this.state.usernameDialog && this.state.usernameDialog.busy ||
                        !this.validateNewUsername()}
                        onTouchTap={this.usernameDialogOK}
                      />
                    </div>
                  </div>
              : <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Checkmark primary delay={300} />
              </div>
          }
        </Dialog>

        {/* password */}
        <div style={{ fontSize: 24, fontWeight: 500, marginTop: 24, marginBottom: 24 }} > 密码 </div>
        <div
          style={{
            fontSize: 14,
            lineHeight: '24px',
            marginBottom: 20,
            maxWidth: 1000,
            color: '#000',
            opacity: 0.87
          }}
        >
          WISNUC OS的所有客户端、Web浏览器和网络文件服务使用相同的用户名密码组合。
          <br />
          <br />
          WISNUC OS不会保存任何形式的用户明文密码。
        </div>
        <ChangePasswordButton
          style={{ marginBottom: 30 }}
          themeColor={primaryColor}
          accentColor={deepOrange500}
          address={this.props.address}
          fruitmixPort={this.props.fruitmixPort}
          user={this.props.user}
          onOK={() => console.log('change password OK')}
          onCancel={() => console.log('change password Cancel')}
        />
      </div>
    )
  }
}

export default User
