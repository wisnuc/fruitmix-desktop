import React from 'react'
import i18n from 'i18n'
import { IconButton } from 'material-ui'
import NavigationChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import NavigationChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import { teal500, pinkA200 } from 'material-ui/styles/colors'
import DoneIcon from 'material-ui/svg-icons/action/done'
import ClearIcon from 'material-ui/svg-icons/content/clear'
import RaidIcon from 'material-ui/svg-icons/device/storage'
import FlatButton from '../common/FlatButton'
import InitWizard from './InitWizard'

const primaryColor = teal500
const accentColor = pinkA200

class MaintGuide extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      index: 0,
      action: false,
      detail: false,
      expand: false,
      loading: false
    }

    this.getStatus = (volume, boot) => {
      const mounted = volume.isMounted
      const noMissing = !volume.missing
      const lastSystem = boot.last === volume.uuid
      const fruitmixOK = Array.isArray(volume.users) || volume.users === 'EDATA'
      const usersOK = typeof volume.users !== 'string'

      const check = [mounted, noMissing, lastSystem, fruitmixOK, usersOK]
      return check
    }

    this.backToVolumeCard = () => {
      this.setState({ expand: false }, () => {
        this.props.toggleExpanded(true)
        setTimeout(() => this.props.refresh(), 600)
      })
    }

    this.toggleAction = () => {
      this.setState({ action: !this.state.action })
    }

    this.changeIndex = (change) => {
      const length = this.props.device.storage.data.volumes.length
      const index = this.state.index + change
      if (index < 0 || index > length - 1) return
      this.setState({ index })
    }

    /* Disk Funcs */
    this.recoverRaid1 = () => {}

    this.addDisk = () => {}

    this.deleteDisk = () => {}

    this.replaceDisk = () => {}

    /* Wisnuc Funcs */
    this.backup = () => {}

    this.reinstall = () => {
      this.setState({ action: false, detail: true }, () => {
        this.props.toggleExpanded()
        setTimeout(() => this.setState({ expand: true }), 600)
      })
    }

    this.exportData = () => {}

    this.recoverData = () => {}

    this.forceBoot = () => {
      this.setState({ loading: true })
      const current = this.props.device.storage.data.volumes[this.state.index].uuid
      this.props.device.request('forceBoot', { current }, (error) => {
        if (error) {
          console.error('forceBoot error', error)
          this.setState({ loading: false })
        } else {
          this.props.refresh()
          this.setState({ loading: false })
        }
      })
    }
  }

  renderTest (volume) {
    const test = [
      i18n.__('Test Mount'),
      i18n.__('Test Missing'),
      i18n.__('Test Last System'),
      i18n.__('Test Fruitmix OK'),
      i18n.__('Test Users OK')
    ]

    let allCheck = true
    const check = this.getStatus(volume, this.props.device.boot.data)
    check.forEach((item) => { if (!item) allCheck = false })

    return (
      <div style={{ marginLeft: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 500, height: 56, display: 'flex', alignItems: 'center' }}>
          { i18n.__('Auto Test Title') }
          <div style={{ flexGrow: 1 }} />
          {
            allCheck &&
              <FlatButton
                primary
                label={i18n.__('Start')}
                onTouchTap={this.forceBoot}
                style={{ marginRight: 24 }}
                disabled={this.state.loading}
              />
          }
        </div>
        {
          test.map((text, index) => (
            <div style={{ height: 56, display: 'flex', alignItems: 'center', fontSize: 14, marginLeft: 12 }} key={text}>
              { check[index] ? <DoneIcon color={primaryColor} /> : <ClearIcon color={accentColor} /> }
              <div style={{ width: 28 }} />
              <div style={{ width: 220 }}> { text } </div>
            </div>
          ))
        }
      </div>
    )
  }

  renderButton () {
    return (
      <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <FlatButton
          label={i18n.__('Return')}
          onTouchTap={this.state.action ? this.toggleAction : this.props.toggleMaint}
          primary
        />
        {
          !this.state.action &&
          <FlatButton
            label={i18n.__('Enter Maint')}
            onTouchTap={this.toggleAction}
            primary
          />
        }
      </div>
    )
  }

  renderActions () {
    const diskLabels = [i18n.__('Recovery Raid1'), i18n.__('Add Disk'), i18n.__('Delete Disk'), i18n.__('Replace Disk')]
    const diskFuncs = [this.recoverRaid1, this.addDisk, this.deleteDisk, this.replaceDisk]
    const diskDisable = [true, true, true, true]

    const wisnucLabels = [
      i18n.__('Backup and Restore User Data'),
      i18n.__('Reinstall Wisnuc'),
      i18n.__('Export Data'),
      i18n.__('Restore Data'),
      i18n.__('Force Start')
    ]
    const wisnucFuncs = [this.backup, this.reinstall, this.exportData, this.recoverData, this.forceBoot]
    const wisnucDisable = [true, false, true, true, false]

    const action = (label, func, disabled) => (
      <div style={{ height: 56, display: 'flex', alignItems: 'center' }} key={label}>
        <FlatButton
          label={label}
          labelStyle={{ textTransform: '' }}
          onTouchTap={func}
          style={{ marginLeft: -8 }}
          disabled={disabled || this.state.loading}
          primary
        />
      </div>
    )

    return (
      <div style={{ display: 'flex' }}>
        <div style={{ width: 142, margin: '0 24px' }}>
          <div style={{ height: 56, display: 'flex', alignItems: 'center' }}>
            { i18n.__('Disk and Volume Manage Title') }
          </div>
          { diskLabels.map((label, index) => action(label, diskFuncs[index], diskDisable[index])) }
        </div>
        <div style={{ width: 154, margin: '0 24px 0 12px' }}>
          <div style={{ height: 56, display: 'flex', alignItems: 'center' }}>
            { i18n.__('Wisnuc Manage Title') }
          </div>
          { wisnucLabels.map((label, index) => action(label, wisnucFuncs[index], wisnucDisable[index])) }
        </div>
      </div>
    )
  }

  renderDetail () {
    if (!this.state.expand) return (<div />)
    const device = this.props.device
    return (
      <InitWizard
        device={device}
        bindWechat={this.props.bindWechat}
        weChatStatus={this.props.weChatStatus}
        showContent
        onCancel={this.backToVolumeCard}
        onFail={this.backToVolumeCard}
        onOK={this.props.OKAndLogin}
        title={i18n.__('Reinstall Wisnuc Wizard')}
      />
    )
  }

  render () {
    const { device } = this.props
    if (!device) return (<div />)

    const volumes = device.storage.data.volumes
    const length = volumes.length
    const volume = volumes[this.state.index]

    return (
      <div
        style={{
          width: this.state.detail ? '100%' : 380,
          height: this.state.detail ? '100%' : 468,
          backgroundColor: '#FAFAFA'
        }}
      >
        {/* head */}
        {
          !this.state.detail &&
            <div style={{ height: 72, display: 'flex', alignItems: 'center', fontWeight: 500, marginLeft: 24 }}>
              <RaidIcon style={{ height: 48, width: 48 }} color={primaryColor} />
              <div style={{ marginLeft: 16, marginTop: -2 }}>
                <div>
                  {`${i18n.__('Disk Array')} ${this.state.index + 1}`}
                </div>
                <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.54)', textTransform: 'capitalize' }}>
                  { volume && volume.usage && volume.usage.data && `${volume.fileSystemType} | ${volume.usage.data.mode}` }
                </div>
              </div>
            </div>
        }

        {/* content */}
        {
          this.state.detail
            ? this.renderDetail()
            : (
              <div>
                <div style={{ height: 344 }}>
                  {
                    this.state.action
                      ? this.renderActions()
                      : this.renderTest(volume, this.state.index)
                  }
                </div>

                {/* action button */}
                { this.renderButton() }

                {/* change card button */}
                {
                  this.state.index > 0 &&
                    <div style={{ position: 'absolute', right: 72, top: 88 }}>
                      <IconButton
                        iconStyle={{ width: 24, height: 24 }}
                        style={{ width: 40, height: 40, padding: 8 }}
                        onTouchTap={() => this.changeIndex(-1)}
                      >
                        <NavigationChevronLeft />
                      </IconButton>
                    </div>
                }
                {
                  this.state.index < length - 1 &&
                    <div style={{ position: 'absolute', right: 24, top: 88 }}>
                      <IconButton
                        iconStyle={{ width: 24, height: 24 }}
                        style={{ width: 40, height: 40, padding: 8 }}
                        onTouchTap={() => this.changeIndex(1)}
                      >
                        <NavigationChevronRight />
                      </IconButton>
                    </div>
                }
              </div>
            )
        }
      </div>
    )
  }
}

export default MaintGuide
