import React from 'react'
import i18n from 'i18n'
import { ipcRenderer } from 'electron'

import BTDownload from '../control/BTDownload'
import { BTFinishedIcon } from '../common/Svg'
import Download from './Download'

class FinishedList extends Download {
  menuName () {
    return i18n.__('FinishedList Menu Name')
  }

  menuIcon () {
    return BTFinishedIcon
  }

  quickName () {
    return i18n.__('FinishedList Quick Name')
  }

  renderTitle ({ style }) {
    return (
      <div style={Object.assign({}, style, { marginLeft: 184 })}>
        { i18n.__('FinishedList Title %s', (this.state.BTList && this.state.BTList.finish.length) || 0)}
      </div>
    )
  }

  renderContent ({ navToDrive, openSnackBar }) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <BTDownload
          alt
          ipcRenderer={ipcRenderer}
          navToDrive={navToDrive}
          tasks={this.state.BTList ? this.state.BTList.finish : []}
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

export default FinishedList
