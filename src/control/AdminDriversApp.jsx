import React from 'react'
import Radium from 'radium'
import Debug from 'debug'
import ContentAdd from 'material-ui/svg-icons/content/add'
import { Avatar, Divider, FloatingActionButton } from 'material-ui'

import NewDriveDialog from './NewDriveDialog'
import DialogOverlay from '../common/DialogOverlay'
import { ShareDisk } from '../common/Svg'

const debug = Debug('component:control:drive:')

class DriveHeader extends React.PureComponent {
  render() {
    return (
      <div style={{ height: 48, display: 'flex', alignItems: 'center', width: '100%' }}>
        <div style={{ flex: '0 0 104px' }} />
        <div style={{ flex: '0 0 300px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)', marginRight: 24 }}>
          名称
        </div>
        <div style={{ flex: '0 0 480px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)' }}>
          用户
        </div>
        <div style={{ flexGrow: 1 }} />
      </div>
    )
  }
}

@Radium
class DriveRow extends React.PureComponent {
  constructor(props) {
    super(props)

    this.rowTouchTap = (e) => {
      e.preventDefault() // important!
      e.stopPropagation()

      const type = e.type
      const button = e.nativeEvent.button
      if (type !== 'mouseup' || !(button === 0 || button === 2)) return

      this.props.updateDetail(this.props.drive, this.props.users)

      if (button === 2) {
        this.props.showContextMenu(e.nativeEvent.clientX, e.nativeEvent.clientY)
      }
    }
  }


  render() {
    const { drive, users, navToDrive } = this.props
    return (
      <div
        key={drive.label}
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          ':hover': { backgroundColor: '#F5F5F5' }
        }}
        onTouchTap={this.rowTouchTap}
        onDoubleClick={() => navToDrive(drive.uuid, drive.uuid)}
      >
        <div style={{ flex: '0 0 32px' }} />
        <div style={{ flex: '0 0 40px' }}>
          <Avatar><ShareDisk color="white" /></Avatar>
        </div>
        <div style={{ flex: '0 0 32px' }} />
        <div
          style={{
            width: 300,
            fontSize: 16,
            color: 'rgba(0,0,0,0.87)',
            marginRight: 24,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
          }}
        >
          {drive.label}
        </div>
        <div
          style={{
            width: 480,
            fontSize: 16,
            color: 'rgba(0,0,0,0.54)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
          }}
        >
          {
            drive.writelist
              .filter(uuid => users.find(u => u.uuid === uuid))
              .map(uuid => users.find(u => u.uuid === uuid).username).join(', ')
          }
        </div>
        <div style={{ flexGrow: 1 }} />
      </div>
    )
  }
}

class AdminDrives extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newDrive: false
    }

    this.onCloseDialog = () => {
      this.setState({ newDrive: false })
    }
  }

  renderNoDrive() {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: '#FAFAFA'
          }}
        >
          <div style={{ fontSize: 24, color: 'rgba(0,0,0,0.27)' }}> { '尚未建立共享盘' } </div>
          <div style={{ color: 'rgba(0,0,0,0.27)' }}> { '请点击左上按钮创建' } </div>
        </div>
      </div>
    )
  }

  render() {
    const { users, drives, apis, refreshDrives, updateDetail, navToDrive, showContextMenu, openSnackBar } = this.props
    debug('AdminDrivesAdminDrivesAdminDrives', this.props)
    if (!users || !drives) return (<div />)
    const publicDrives = drives.filter(drive => drive.type === 'public')

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <FloatingActionButton
          style={{ position: 'absolute', top: -36, left: 24, zIndex: 200 }}
          secondary
          disabled={!users || !drives}
          onTouchTap={() => this.setState({ newDrive: true })}
        >
          <ContentAdd />
        </FloatingActionButton>

        {
          publicDrives.length ?
            <div style={{ overflow: 'auto', height: '100%', maxWidth: '100%' }}>
              <DriveHeader />
              <div style={{ height: 8 }} />
              <Divider style={{ marginLeft: 104 }} />
              {
                publicDrives.map(drive =>
                  [<DriveRow
                    key={drive.uuid}
                    drive={drive}
                    users={users}
                    updateDetail={updateDetail}
                    navToDrive={navToDrive}
                    showContextMenu={showContextMenu}
                  />,
                    <Divider style={{ marginLeft: 104 }} key={`${drive.uuid}Divider`} />])
              }
            </div>
            : this.renderNoDrive()
        }
        <DialogOverlay open={!!this.state.newDrive} onRequestClose={this.onCloseDialog}>
          {
            this.state.newDrive && <NewDriveDialog
              primary
              apis={apis}
              users={users}
              drives={drives}
              refreshDrives={refreshDrives}
              openSnackBar={openSnackBar}
            />
          }
        </DialogOverlay>
      </div>
    )
  }
}

export default AdminDrives
