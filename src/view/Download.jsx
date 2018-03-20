import React from 'react'
import i18n from 'i18n'
import { ipcRenderer } from 'electron'

import BTDownload from '../control/BTDownload'
import { BTDownloadIcon } from '../common/Svg'
import Base from './Base'

class Download extends Base {
  willReceiveProps (nextProps) {
    this.handleProps(nextProps.apis, ['bt'])
    if (this.state.bt && !this.state.bt.switch) {
      this.disabled = true
      this.loading = false
      if (this.state.BTList !== null) this.setState({ BTList: null })
    } else if (this.state.bt && this.state.bt.switch && !this.state.error) {
      this.disabled = false
      this.loading = false
      this.handleProps(nextProps.apis, ['BTList'])
    }
  }

  navEnter () {
    this.loading = true
    this.ctx.props.apis.request('BTList')
    this.ctx.props.apis.request('bt')
  }

  navGroup () {
    return 'download'
  }

  menuName () {
    return i18n.__('Download Menu Name')
  }

  menuIcon () {
    return BTDownloadIcon
  }

  quickName () {
    return i18n.__('Download Quick Name')
  }

  appBarStyle () {
    return 'colored'
  }

  prominent () {
    return true
  }

  hasDetail () {
    return false
  }

  detailEnabled () {
    return false
  }

  renderTitle ({ style }) {
    return (
      <div style={Object.assign({}, style, { marginLeft: 184 })}>
        { i18n.__('Download Title %s', (this.state.BTList && this.state.BTList.running.length) || 0) }
      </div>
    )
  }

  renderContent ({ navToDrive, openSnackBar }) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <BTDownload
          ipcRenderer={ipcRenderer}
          navToDrive={navToDrive}
          tasks={this.state.BTList ? this.state.BTList.running : []}
          apis={this.ctx.props.apis}
          openSnackBar={openSnackBar}
          primaryColor={this.groupPrimaryColor()}
          selectedDevice={this.ctx.props.selectedDevice}
          error={this.state.error}
          loading={this.loading}
          disabled={this.disabled}
        />
      </div>
    )
  }
}

export default Download
