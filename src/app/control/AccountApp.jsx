import React from 'react'
import Debug from 'debug'
import { Divider, IconButton } from 'material-ui'
import ActionAccountCircle from 'material-ui/svg-icons/action/account-circle'
import Username from 'material-ui/svg-icons/action/perm-identity'
import Password from 'material-ui/svg-icons/action/lock-outline'
import FlatButton from '../common/FlatButton'
import DialogOverlay from '../common/DialogOverlay'
import ChangeAccountDialog from './ChangeAccountDialog'

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
    const { account, primaryColor, apis, refresh, openSnackBar } = this.props
    if (!account) return <div />
    return (
      <div style={{ paddingLeft: 68, paddingTop: 16 }}>

        {/* avatar */}
        <div style={{ height: 96, marginLeft: -24 }} >
          {
            account.avatar ? <div /> :
            <IconButton
              iconStyle={{ width: 64, height: 64, color: primaryColor }}
              style={{ width: 96, height: 96, padding: 16 }}
            >
              <ActionAccountCircle />
            </IconButton>
          }
        </div>

        {/* username */}
        <div style={{ flex: '0 0 560px', fontSize: 24, color: 'rgba(0, 0, 0, 0.87)', height: 36 }}>
          {`${account.username}`}
        </div>

        {/* usertype */}
        <div style={{ flex: '0 0 560px' }}>
          <div style={{ fontSize: 14, lineHeight: '26px', color: 'rgba(0, 0, 0, 0.87)' }} >
            {
              account.isAdmin && account.isFirstUser ?
                '您是系统的第一个用户，是最高权限的系统管理员。' :
                account.isAdmin ? '您是系统管理员。' : '您是系统普通用户。'
            }
          </div>
        </div>

        <div style={{ height: 16 }} />
        <Divider style={{ color: 'rgba(0, 0, 0, 0.54)' }} />
        <div style={{ height: 32 }} />

        {/* change username */}
        <div style={{ display: 'flex', alignItems: 'center' }} >
          <div style={{ display: 'flex', alignItems: 'center' }} >
            <div style={{ flex: '0 0 56px', height: 36 }} >
              <div style={{ height: 8 }} />
              <Username color={this.props.primaryColor} />
            </div>
            <div style={{ flex: '0 0 560px', fontSize: 20, color: 'rgba(0, 0, 0, 0.87)' }}>
              用户名
            </div>
          </div>
        </div>

        <div style={{ height: 8 }} />
        <div style={{ display: 'flex', alignItems: 'center' }} >
          <div style={{ display: 'flex', alignItems: 'center' }} >
            <div style={{ flex: '0 0 56px' }} />
            <div style={{ flex: '0 0 560px' }}>
              <FlatButton
                label="修改用户名"
                style={{ marginLeft: -8 }}
                primary
                onTouchTap={() => this.setState({ openDialog: 'username' })}
              />
            </div>
          </div>
        </div>

        <div style={{ height: 16 }} />
        <Divider style={{ color: 'rgba(0, 0, 0, 0.54)' }} />
        <div style={{ height: 32 }} />

        {/* change password */}
        <div style={{ display: 'flex', alignItems: 'center' }} >
          <div style={{ display: 'flex', alignItems: 'center' }} >
            <div style={{ flex: '0 0 56px', height: 36 }} >
              <div style={{ height: 8 }} />
              <Password color={this.props.primaryColor} />
            </div>
            <div style={{ flex: '0 0 560px', fontSize: 20, color: 'rgba(0, 0, 0, 0.87)' }}>
              密码
            </div>
          </div>
        </div>

        <div style={{ height: 8 }} />
        <div style={{ display: 'flex', alignItems: 'center' }} >
          <div style={{ display: 'flex', alignItems: 'center' }} >
            <div style={{ flex: '0 0 56px' }} />
            <div style={{ flex: '0 0 560px' }}>
              <FlatButton
                label="修改密码"
                style={{ marginLeft: -8 }}
                primary
                onTouchTap={() => this.setState({ openDialog: 'password' })}
              />
            </div>
          </div>
        </div>

        {/* dialog */}
        <DialogOverlay open={!!this.state.openDialog} onRequestClose={this.onCloseDialog}>
          {
            this.state.openDialog &&
              <ChangeAccountDialog
                openSnackBar={openSnackBar}
                refresh={refresh}
                apis={apis}
                op={this.state.openDialog}
              />
          }
        </DialogOverlay>
      </div>
    )
  }
}

export default AccountApp
