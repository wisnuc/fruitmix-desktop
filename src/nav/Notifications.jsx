import React from 'react'
import i18n from 'i18n'
import { Paper, IconButton, Avatar, Toggle } from 'material-ui'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import UpdateIcon from 'material-ui/svg-icons/action/system-update-alt'
import StarIcon from 'material-ui/svg-icons/toggle/star'
import ReceiveIcon from 'material-ui/svg-icons/communication/call-received'
import SettingsIcon from 'material-ui/svg-icons/action/settings'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import ClearAllIcon from 'material-ui/svg-icons/communication/clear-all'

class Notifications extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      settings: false
    }

    this.toggleDialog = op => this.setState({ [op]: !this.state[op] })

    this.handleAction = (nt) => {
      const { action } = nt
      this.props.removeNts([nt])
      this.props.onRequestClose()
      action()
    }

    this.toggleFirmNoti = () => {
      const hideFirmNoti = global.config && global.config.global && global.config.global.hideFirmNoti
      this.props.ipcRenderer.send('SETCONFIG', { hideFirmNoti: !hideFirmNoti })
    }
  }

  renderNoNts () {
    return (
      <div
        style={{
          fontSize: 14,
          width: '100%',
          height: '100%',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(0,0,0,0.38)'
        }}
      >
        { i18n.__('No Notifications') }
      </div>
    )
  }

  renderNts (nt) {
    const { id, type, title, body } = nt
    let Icon
    let color
    switch (type) {
      case 'firmware':
        Icon = UpdateIcon
        color = '#4caf50'
        break

      case 'box':
        Icon = StarIcon
        color = '#F0F4C3'
        break

      default:
        Icon = ReceiveIcon
        color = 'rgba(0,0,0,0.54)'
    }

    return (
      <Paper
        key={id}
        onTouchTap={() => this.handleAction(nt)}
        style={{ height: 60, width: 360, display: 'flex', alignItems: 'center', margin: 8, backgroundColor: '#FFF' }}
      >
        <div style={{ width: 40, margin: 10 }}>
          <Avatar icon={<Icon />} backgroundColor={color} color="#FFF" />
        </div>
        <div style={{ width: 254 }}>
          <div style={{ fontWeight: 500, fontSize: 14 }}>
            { title }
          </div>
          <div style={{ height: 2 }} />
          <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.54)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            { body }
          </div>
        </div>
        <div style={{ marginRight: -2 }} onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }}>
          <IconButton
            iconStyle={{ color: 'rgba(0,0,0,0.54)' }}
            onTouchTap={() => this.props.removeNts([nt])}
            tooltip={i18n.__('Delete')}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </Paper>
    )
  }

  render () {
    const hideFirmNoti = global.config && global.config.global && global.config.global.hideFirmNoti
    const sources = [{
      Icon: UpdateIcon,
      color: '#4caf50',
      title: i18n.__('Firmware Update'),
      value: !hideFirmNoti,
      action: this.toggleFirmNoti
    }]
    return (
      <div
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 200 }}
        onTouchTap={() => this.props.onRequestClose()}
      >
        <Paper
          style={{
            position: 'absolute',
            top: 72,
            right: this.props.showDetail ? 376 : 16,
            boxSizing: 'border-box',
            width: 376,
            height: 380,
            overflow: 'hidden',
            backgroundColor: '#EEEEEE'
          }}
          onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }}
        >
          {/* Notifications */}
          <div style={{ overflowY: 'hidden', position: 'absolute', left: this.state.settings ? -376 : 0, transition: 'all 225ms' }}>
            {/* render Headers */}
            <div style={{ height: 56, width: 376, display: 'flex', alignItems: 'center' }}>
              {/* settings */}
              <div style={{ width: 4 }} />
              <IconButton
                iconStyle={{ color: '#9E9E9E' }}
                onTouchTap={() => this.toggleDialog('settings')}
                tooltip={i18n.__('Settings')}
              >
                <SettingsIcon />
              </IconButton>
              <div style={{ flexGrow: 1 }} />

              {/* title */}
              <div style={{ fontSize: 21, fontWeight: 500, color: 'rgba(0,0,0,0.38)' }}>
                { i18n.__('Notifications') }
              </div>

              <div style={{ flexGrow: 1 }} />
              {/* clear notifications */}
              <div style={{ width: 48 }}>
                {
                  !!this.props.nts.length &&
                  <IconButton
                    iconStyle={{ color: '#9E9E9E' }}
                    onTouchTap={() => this.props.removeNts(this.props.nts)}
                    tooltip={i18n.__('Clear All Notifications')}
                  >
                    <ClearAllIcon />
                  </IconButton>
                }
              </div>
              <div style={{ width: 4 }} />
            </div>
            {/* render Content */}
            <div style={{ height: 298 }}>
              { this.props.nts.length ? this.props.nts.map(nt => this.renderNts(nt)) : this.renderNoNts() }
            </div>
          </div>

          {/* Settings */}
          <div style={{ overflowY: 'hidden', position: 'absolute', left: this.state.settings ? 0 : 376, transition: 'all 225ms' }}>
            {/* render Headers */}
            <div style={{ height: 56, width: 376, display: 'flex', alignItems: 'center' }}>
              {/* button */}
              <div style={{ width: 4 }} />
              <IconButton
                iconStyle={{ color: '#9E9E9E' }}
                onTouchTap={() => this.toggleDialog('settings')}
                tooltip={i18n.__('Back')}
              >
                <BackIcon />
              </IconButton>
              <div style={{ flexGrow: 1 }} />
              {/* title */}
              <div style={{ fontSize: 21, fontWeight: 500, color: 'rgba(0,0,0,0.38)' }}>
                { i18n.__('Notifications') }
              </div>
              <div style={{ flexGrow: 1 }} />
              <div style={{ width: 52 }} />
            </div>

            {/* render Content */}
            <div style={{ height: 298, overflowY: 'auto' }}>
              <div style={{ fontSize: 14, marginLeft: 16, height: 48, display: 'flex', alignItems: 'center' }}>
                { i18n.__('Show Notifications From:') }
              </div>

              {/* Notifications Source */}
              {
                sources.map((s) => {
                  const { Icon, color, title, value, action } = s
                  return (
                    <div style={{ height: 56, display: 'flex', alignItems: 'center' }} key={title}>
                      <div style={{ width: 8 }} />
                      <div style={{ margin: 10, display: 'flex', alignItems: 'center' }}>
                        <Icon color={color} />
                      </div>
                      <div> { title } </div>
                      <div style={{ flexGrow: 1 }} />
                      <div style={{ marginRight: 16 }}>
                        <Toggle toggled={value} onToggle={action} />
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </Paper>
      </div>
    )
  }
}

export default Notifications
