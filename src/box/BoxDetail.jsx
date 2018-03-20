import React from 'react'
import i18n from 'i18n'
import { Divider, Avatar, Toggle, IconButton } from 'material-ui'
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit'
import AddIcon from 'material-ui/svg-icons/content/add'
import RemoveIcon from 'material-ui/svg-icons/content/remove'
import DialogOverlay from '../common/DialogOverlay'
import FlatButton from '../common/FlatButton'
import UserSelect from './UserSelect'
import NewNameDialog from './NewNameDialog'

class BoxDetail extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      delBox: false,
      loading: false,
      newName: false
    }

    this.deleteBoxAsync = async () => {
      const { apis, box, ada } = this.props
      if (!box.deleted) await apis.pureRequestAsync('delBox', { boxUUID: box.uuid, stationId: box.stationId })
      await ada.deleteBox(box.uuid)
    }

    this.deleteBox = () => {
      this.setState({ loading: true })
      const { openSnackBar, selectBox } = this.props
      const cb = (err) => {
        if (err) openSnackBar(i18n.__('Delete Box Failed'))
        else openSnackBar(i18n.__('Delete Box Success'))
        this.setState({ delBox: false, loading: false })
        selectBox(-1)
      }
      this.deleteBoxAsync().then(cb).catch(cb)
    }

    this.addUser = (users) => {
      this.setState({ loading: true })
      const { apis, box, openSnackBar, refresh } = this.props
      apis.pureRequest(
        'handleBoxUser',
        { boxUUID: box.uuid, op: 'add', guids: users.map(u => u.id), stationId: box.stationId },
        (err, res) => {
          if (err) openSnackBar(i18n.__('Add Users to Box Failed'))
          else openSnackBar(i18n.__('Add Users to Box Success'))
          this.setState({ addUser: false, loading: false })
          refresh({ boxUUID: box.uuid })
        }
      )
    }

    this.delUser = (users) => {
      this.setState({ loading: true })
      const { apis, box, openSnackBar, refresh } = this.props
      apis.pureRequest(
        'handleBoxUser',
        { boxUUID: box.uuid, op: 'delete', guids: users.map(u => u.id), stationId: box.stationId },
        (err, res) => {
          if (err) openSnackBar(i18n.__('Remove Users From Box Failed'))
          else openSnackBar(i18n.__('Remove Users From Box Success'))
          this.setState({ delUser: false, delBox: false, loading: false })
          refresh({ boxUUID: box.uuid })
        }
      )
    }

    this.toggle = type => this.setState({ [type]: !this.state[type] })
  }

  renderTitle (title) {
    return (
      <div style={{ height: 48, color: 'rgba(0,0,0,.54)', fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          { title }
        </div>
      </div>
    )
  }

  renderDevice () {
    const name = this.props.box && this.props.box.station.name
    const ip = this.props.box && this.props.box.station.LANIP
    return (
      <div style={{ height: 48, color: 'rgba(0,0,0,.54)', fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          { i18n.__('Device Info') }
        </div>
        <div style={{ width: 240, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', textAlign: 'right' }} >
          { `${name} (${ip})`}
        </div>
        <div style={{ width: 16 }} />
      </div>
    )
  }

  renderGroupName (name) {
    const isOwner = this.props.box && this.props.box.owner === this.props.guid
    return (
      <div style={{ height: 48, color: 'rgba(0,0,0,.54)', fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          { i18n.__('Group Name') }
        </div>
        <div style={{ flexGrow: 1 }} />
        <div style={{ width: 160, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', textAlign: 'right' }} >
          { name || i18n.__('Not Set') }
        </div>
        {
          isOwner &&
            <IconButton onTouchTap={() => this.setState({ newName: true })}>
              <ModeEdit color={this.props.primaryColor} />
            </IconButton>
        }
        <div style={{ width: isOwner ? 4 : 16 }} />
      </div>
    )
  }

  renderToggle (title, toggled, onToggle) {
    return (
      <div style={{ width: '100%', height: 48, display: 'flex', alignItems: 'center' }}>
        <div style={{ width: 144, color: 'rgba(0,0,0,.54)', fontWeight: 500, fontSize: 14 }}>
          { title }
        </div>
        <div style={{ width: 108 }} />
        <div>
          <Toggle
            toggled={toggled}
            onToggle={onToggle}
          />
        </div>
      </div>
    )
  }

  renderAvatar (user) {
    // console.log('renderAvatar', user)
    const onTouchTap = user.onTouchTap || (() => {})
    const { nickName, avatarUrl } = user
    return (
      <Avatar
        key={nickName}
        style={{
          margin: 4,
          float: 'left',
          color: '#FAFAFA',
          backgroundColor: '#BDBDBD'
        }}
        size={36}
        onTouchTap={onTouchTap}
      >
        <div style={{ lineHeight: '24px', fontSize: 14 }}>
          {
            avatarUrl
              ? (
                <div style={{ borderRadius: 16, width: 32, height: 32, overflow: 'hidden' }}>
                  <img width={32} height={32} alt="" src={avatarUrl} />
                </div>
              )
              : nickName.slice(0, 2).toUpperCase()
          }
        </div>
      </Avatar>
    )
  }

  renderAction (Icon, onTouchTap) {
    return (
      <div
        style={{
          margin: 4,
          width: 36,
          height: 36,
          float: 'left',
          borderRadius: 18,
          cursor: 'pointer',
          boxSizing: 'border-box',
          border: '1px solid #BDBDBD',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onTouchTap={onTouchTap}
      >
        <Icon color="#BDBDBD" />
      </div>
    )
  }

  render () {
    const { box, primaryColor, guid, refresh, openSnackBar, apis, getUsers } = this.props
    // console.log('BoxDetail', this.props)
    const isOwner = box && box.owner === guid
    if (!box) return (<div style={{ height: 64, backgroundColor: primaryColor, filter: 'brightness(0.9)' }} />)

    return (
      <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ height: 64, backgroundColor: primaryColor, filter: 'brightness(0.9)', display: 'flex', alignItems: 'center' }}>
          <div style={{ margin: '0 0 0 24px', fontSize: 20, color: '#FFF', fontWeight: 500 }}>
            { i18n.__('Group Settings') }
          </div>
        </div>
        {/* data */}
        <div style={{ width: 312, padding: 24, overflow: 'auto' }}>
          { this.renderTitle(i18n.__('Group Members')) }
          <div style={{ maxHeight: 400, height: 44 * Math.ceil((box.users.length + isOwner * 2) / 7), position: 'relative' }}>
            { box.users.map((u, i) => this.renderAvatar(u)) }
            { isOwner && this.renderAction(AddIcon, () => this.setState({ addUser: true })) }
            { isOwner && this.renderAction(RemoveIcon, () => this.setState({ delUser: true })) }
          </div>
          <div style={{ height: 12 }} />
          { this.renderGroupName(box && box.name) }
          { this.renderDevice() }
          {/* this.renderToggle(i18n.__('Mute Notifications'), true, () => {}) */}
          {/* isOwner && this.renderToggle(i18n.__('Need Confirm'), false, () => {}) */}

          <div style={{ height: 12 }} />
          <Divider />
          {/* action */}
          <div style={{ height: 64, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlatButton
              style={{ width: '100%' }}
              secondary
              label={isOwner ? i18n.__('Delete Box') : i18n.__('Leave Box')}
              onTouchTap={() => this.toggle('delBox')}
            />
          </div>
        </div>
        {/* dialog */}
        <DialogOverlay open={this.state.delBox} >
          {
            this.state.delBox &&
              <div style={{ width: 400, padding: '24px 24px 0px 24px' }}>
                <div style={{ color: 'rgba(0,0,0,0.54)', height: 24, display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                  { isOwner ? i18n.__('Delete Box Text') : i18n.__('Leave Box Text') }
                </div>
                <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                  <FlatButton
                    primary
                    label={i18n.__('Cancel')}
                    onTouchTap={() => this.toggle('delBox')}
                  />
                  <FlatButton
                    primary
                    label={isOwner ? i18n.__('Delete') : i18n.__('Leave')}
                    onTouchTap={isOwner ? this.deleteBox : () => this.delUser([box.users.find(u => u.id === guid)])}
                    disabled={this.state.loading}
                  />
                </div>
              </div>
          }
        </DialogOverlay>

        <DialogOverlay open={!!this.state.addUser} onRequestClose={() => this.setState({ addUser: false })}>
          {
            this.state.addUser &&
            <UserSelect
              fire={this.addUser}
              defaultUsers={box.users.map(u => u.id)}
              primaryColor={primaryColor}
              actionLabel={i18n.__('Invite')}
              title={i18n.__('Invite User to Box')}
              getUsers={getUsers}
            />
          }
        </DialogOverlay>

        <DialogOverlay open={!!this.state.delUser} onRequestClose={() => this.setState({ delUser: false })}>
          {
            this.state.delUser &&
            <UserSelect
              fire={this.delUser}
              defaultUsers={[]}
              primaryColor={primaryColor}
              actionLabel={i18n.__('Delete')}
              title={i18n.__('Remove User From Box')}
              users={box.users.filter(u => u.id !== guid)}
            />
          }
        </DialogOverlay>

        <DialogOverlay open={!!this.state.newName} onRequestClose={() => this.setState({ newName: false })}>
          {
            this.state.newName &&
            <NewNameDialog
              openSnackBar={openSnackBar}
              refresh={refresh}
              primaryColor={primaryColor}
              boxUUID={box.uuid}
              apis={apis}
              stationId={box.stationId}
            />
          }
        </DialogOverlay>
      </div>
    )
  }
}

export default BoxDetail
