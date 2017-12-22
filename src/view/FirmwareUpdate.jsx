import React from 'react'
import i18n from 'i18n'
import { IconButton } from 'material-ui'
import ListIcon from 'material-ui/svg-icons/action/list'
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh'
import UpdateIcon from 'material-ui/svg-icons/action/system-update-alt'

import Base from './Base'
import FirmwareUpdateApp from '../device/FirmwareUpdateApp'

class FirmwareUpdate extends Base {
  constructor(ctx) {
    super(ctx)

    this.state = {
      firm: null,
      error: null
    }

    this.refresh = () => {
      this.ctx.props.selectedDevice.request('firm')
    }

    this.checkUpdates = () => {
      this.ctx.props.selectedDevice.pureRequest('checkUpdates')
    }
  }

  willReceiveProps(nextProps) {
    if (!nextProps.selectedDevice || !nextProps.selectedDevice.firm) return

    const firm = nextProps.selectedDevice.firm
    if (firm.isPending()) return

    if (firm.isRejected()) {
      const error = firm.reason()
      console.log('firm.isRejected', error)
      if (error && error !== this.state.error) this.setState({ error })
    } else {
      const value = firm.value()
      if (value && value !== this.state.firm) {
        this.setState({ firm: value, error: null })
      }
    }
  }

  navEnter() {
    this.ctx.props.selectedDevice.request('firm')
    this.ctx.props.selectedDevice.pureRequest('checkUpdates')
  }

  navGroup() {
    return 'settings'
  }

  menuName() {
    return i18n.__('FirmwareUpdate Menu Name')
  }

  quickName() {
    return i18n.__('FirmwareUpdate Quick Name')
  }

  menuIcon() {
    return UpdateIcon
  }

  appBarStyle() {
    return 'colored'
  }

  detailIcon() {
    return ListIcon
  }

  renderToolBar({ style }) {
    return (
      <div style={style}>
        <IconButton onTouchTap={() => this.checkUpdates()} tooltip={i18n.__('Refresh')} tooltipStyles={{ marginTop: -12 }}>
          <RefreshIcon color="#FFF" />
        </IconButton>
      </div>
    )
  }

  renderContent({ openSnackBar, toggleDetail }) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <FirmwareUpdateApp
          firm={this.state.firm}
          error={this.state.error}
          refresh={this.refresh}
          checkUpdates={this.checkUpdates}
          apis={this.ctx.props.apis}
          nav={this.ctx.props.nav}
          selectedDevice={this.ctx.props.selectedDevice}
          primaryColor={this.groupPrimaryColor()}
          openSnackBar={openSnackBar}
        />
      </div>
    )
  }
}

export default FirmwareUpdate
