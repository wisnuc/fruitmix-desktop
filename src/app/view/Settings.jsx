import React from 'react'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import ActionSettings from 'material-ui/svg-icons/action/settings'
import Base from './Base'
import SettingsApp from '../control/SettingsApp'

const debug = Debug('view:component:Settings')

class Settings extends Base {

  constructor(ctx) {
    super(ctx)
  }

  navGroup() {
    return 'settings'
  }

  menuName() {
    return '客户端设置'
  }

  menuIcon() {
    return ActionSettings
  }

  quickName() {
    return '设置'
  }

  appBarStyle() {
    return 'colored'
  }

  /** renderers **/
  renderContent({ openSnackBar }) {
    return (
      <SettingsApp
        primaryColor={this.groupPrimaryColor()}
        openSnackBar={openSnackBar}
        ipcRenderer={ipcRenderer}
      />
    )
  }
}

export default Settings
