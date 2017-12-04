import React from 'react'
import i18n from 'i18n'
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
    return i18n.__('Settings Menu Name')
  }

  menuIcon() {
    return ActionSettings
  }

  quickName() {
    return i18n.__('Settings Quick Name')
  }

  appBarStyle() {
    return 'colored'
  }

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
