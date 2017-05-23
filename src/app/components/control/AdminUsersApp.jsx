import React from 'react'
import { Avatar, Divider, FloatingActionButton, TextField } from 'material-ui'
import ActionSupervisorAccount from 'material-ui/svg-icons/action/supervisor-account'
import ContentAdd from 'material-ui/svg-icons/content/add'
import SocialPersonAdd from 'material-ui/svg-icons/social/person-add'
import ContextMenu from '../common/ContextMenu'
import DialogOverlay from '../common/DialogOverlay'
import ChangeAccountDialog from './ChangeAccountDialog'

class AdminUsersApp extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      createNewUser: false
    }

    this.onCloseDialog = () => {
      this.setState({ createNewUser: false })
    }
  }

  renderUserRow(user) {
    return (
      <div style={{ height: 64, display: 'flex', alignItems: 'center' }} key={user.uuid}>
        <div style={{ flex: '0 0 32px' }} />
        <div style={{ flex: '0 0 40px' }}>
          <Avatar>{user.username.slice(0, 1).toUpperCase()}</Avatar>
        </div>
        <div style={{ flex: '0 0 32px' }} />
        <div style={{ flex: '0 0 240px', fontSize: 16, color: 'rgba(0,0,0,0.87)' }}>{user.username}</div>
        <div style={{ flex: '0 0 400px', fontSize: 16, color: 'rgba(0,0,0,0.54)' }}>{user.uuid}</div>
      </div>
    )
  }

  render() {
    const { users, apis, refreshUsers, openSnackBar } = this.props
    if (!users) return <div />
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <FloatingActionButton
          style={{ position: 'absolute', top: -36, left: 24 }}
          secondary
          onTouchTap={() => this.setState({ createNewUser: true })}
        >
          <SocialPersonAdd />
        </FloatingActionButton>
        <div style={{ overflow: 'auto', height: '100%' }}>
          <div style={{ height: 48, display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: '0 0 104px' }} />
            <div style={{ flex: '0 0 240px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)' }}>
              用户名
            </div>
            <div style={{ flex: '0 0 400px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)' }}>
              UUID
            </div>
          </div>
          <div style={{ height: 8 }} />
          <Divider style={{ marginLeft: 104 }} />
          { users.reduce((acc, user) =>
              [...acc, this.renderUserRow(user), <Divider style={{ marginLeft: 104 }} key={user.username} />],
              []) }
        </div>
        <DialogOverlay open={!!this.state.createNewUser} onRequestClose={this.onCloseDialog}>
          {
            this.state.createNewUser &&
            <ChangeAccountDialog
              refreshUsers={refreshUsers}
              apis={apis}
              op="createUser"
              openSnackBar={openSnackBar}
            />
          }
        </DialogOverlay>
      </div>
    )
  }
}

export default AdminUsersApp
