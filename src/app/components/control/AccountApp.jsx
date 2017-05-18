import React from 'react'
import Debug from 'debug'
import { Paper, Divider, Dialog, Menu, MenuItem, IconButton, TextField, Avatar } from 'material-ui'
import ActionAccountCircle from 'material-ui/svg-icons/action/account-circle'
import FlatButton from '../common/FlatButton'
import Checkmark from '../common/Checkmark'
import DialogOverlay from '../common/DialogOverlay'
import ChangeAccountDialog from './ChangeAccountDialog'
import { header1Style, header2Style, header2StyleNotFirst, contentStyle } from '../control/styles'

const debug = Debug('component:control:device')

class AccountApp extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      openDialog: ''
    }

    this.onCloseDialog = () => {
      this.setState({ openDialog: '' })
    }
  }

  render() {
    // debug('this.props Account', this.props)
    const { account, primaryColor, apis, refresh } = this.props
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
        <div style={contentStyle} >
          {
            account.isAdmin && account.isFirstUser ?
              '您是系统的第一个用户，是最高权限的系统管理员。' :
              account.isAdmin ? '您是系统管理员。' : '您是系统普通用户。'
          }
        </div>
        <div style={{ height: 20 }} />

        {/* username */}
        <div style={header1Style} > 用户名 </div>
        <div style={contentStyle} >
          WISNUC OS内部使用不可修改的唯一用户ID标识用户身份。
        {/*
          用户名仅用于用户登录等信息显示，
          Windows共享文件访问和其他需要登录的网络文件服务在登录时使用。
          <br />
          用户名可以使用中文字符，包括可显示的标点符号。Windows共享文件访问也支持中文字符的用户名，
          但不是所有客户端软件都支持中文名，所以，如果您使用的网络文件系统服务客户端软件（例如Android或者iOS上的samba客户端）
          不支持中文用户名，您只能使用英文大小写字母的用户名。
        */}
        </div>
        <div style={{ height: 18 }} />
        <FlatButton
          label="修改用户名"
          style={{ marginLeft: -8 }}
          primary
          onTouchTap={() => this.setState({ openDialog: 'username' })}
        />
        <div style={{ height: 20 }} />

        {/* password */}
        <div style={header1Style} > 密码 </div>
        <div style={contentStyle} >
          WISNUC OS的所有客户端、Web浏览器和网络文件服务使用相同的用户名密码组合。
          {/*
          <br />
          WISNUC OS不会保存任何形式的用户明文密码。
          */}
        </div>
        <div style={{ height: 18 }} />
        <DialogOverlay open={!!this.state.openDialog} onRequestClose={this.onCloseDialog}>
          { this.state.openDialog && <ChangeAccountDialog refresh={refresh} apis={apis} op={this.state.openDialog} /> }
        </DialogOverlay>
        <FlatButton
          label="修改密码"
          style={{ marginLeft: -8 }}
          primary
          onTouchTap={() => this.setState({ openDialog: 'password' })}
        />
      </div>
    )
  }
}

export default AccountApp
