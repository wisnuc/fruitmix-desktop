import React from 'react'
import Radium from 'radium'
import Debug from 'debug'
import { Avatar, Divider, FloatingActionButton, TextField, IconButton } from 'material-ui'
import FileFolder from 'material-ui/svg-icons/file/folder'
import ContentAdd from 'material-ui/svg-icons/content/add'
import IconBox from '../common/IconBox'
import FlatButton from '../common/FlatButton'
import DialogOverlay from '../common/DialogOverlay'
import NewDriveDialog from './NewDriveDialog'

const debug = Debug('component:control:drive:')

class DriveHeader extends React.PureComponent {
  // 104, leading
  // 240, label
  // grow, user
  // 320, uuid
  // 56, spacer
  // 64, view
  // 24, padding
  render() {
    return (
      <div style={{ height: 48, display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: '0 0 104px' }} />
        <div style={{ flex: '0 0 240px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)' }}>
          名称
        </div>
        <div style={{ flexGrow: 1, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)' }}>
          用户
        </div>
        <div style={{ flex: '0 0 320px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)' }} />
        <div style={{ flex: '0 0 144px' }} />
      </div>
    )
  }
}

@Radium
class DriveRow extends React.PureComponent {

  render() {
    const drive = this.props.drive
    const users = this.props.users
    debug('drive,users', drive, users)

    return (
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          ':hover': { backgroundColor: '#F5F5F5' }
        }}
      >
        <div style={{ flex: '0 0 32px' }} />
        <div style={{ flex: '0 0 40px' }}>
          <Avatar><FileFolder color="white" /></Avatar>
        </div>
        <div style={{ flex: '0 0 32px' }} />
        <div style={{ flex: '0 0 240px', fontSize: 16, color: 'rgba(0,0,0,0.87)' }}>{drive.label}</div>
        <div style={{ flex: '0 0 320px', fontSize: 16, color: 'rgba(0,0,0,0.54)' }} >
          { drive.writelist.map(uuid => users.find(u => u.uuid === uuid).username).join(', ') }
        </div>
        <div style={{ flexGrow: 1 }} />
        <div style={{ flex: '0 0 72px' }} />
        <div style={{ flex: '0 0 144px' }} />
      </div>
    )
  }
}

class AdminDrives extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newDrive: false,
      modifyDrive: false
    }

    this.ssb = this.setState.bind(this)

    this.onCloseDialog = () => {
      debug('this.onCloseDialog')
      this.setState({ newDrive: false })
    }

    this.refreshDrives = this.navEnter.bind(this)
  }

  navEnter() {
    this.ctx.props.apis.request('adminUsers')
    this.ctx.props.apis.request('adminDrives')
  }

  render() {
    const { users, drives, apis, refreshDrives } = this.props
    // debug('users,drives', drives, users)
    if (!users || !drives) return <div />

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <FloatingActionButton
          style={{ position: 'absolute', top: -36, left: 24 }}
          secondary
          disabled={!users || !drives}
          onTouchTap={() => this.setState({ newDrive: true })}
        >
          <ContentAdd />
        </FloatingActionButton>

        <div style={{ overflow: 'auto', height: '100%' }}>
          <DriveHeader />
          <div style={{ height: 8 }} />
          <Divider style={{ marginLeft: 104 }} />
          {
            drives && users && drives.map(drive =>
              [<DriveRow drive={drive} users={users} setState={this.ssb} />, <Divider style={{ marginLeft: 104 }} />]
            )
          }
        </div>
        {
          drives && users &&
            <DialogOverlay open={!!this.state.newDrive} onRequestClose={this.onCloseDialog}>
              {
                this.state.newDrive && <NewDriveDialog
                  primary
                  apis={apis}
                  users={users}
                  drives={drives}
                  refreshDrives={refreshDrives}
                />
              }
            </DialogOverlay>
        }
      </div>
    )
  }
}

export default AdminDrives
