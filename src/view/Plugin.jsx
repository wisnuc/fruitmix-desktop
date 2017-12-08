import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import ActionSettings from 'material-ui/svg-icons/action/settings'
import Base from './Base'
import PluginApp from '../device/PluginApp'

const debug = Debug('view:component:Settings')

class Plugin extends Base {
  constructor(ctx) {
    super(ctx)
  }

  navGroup() {
    return 'device'
  }

  menuName() {
    return i18n.__('Plugin Menu Name')
  }

  quickName() {
    return i18n.__('Plugin Quick Name')
  }

  menuIcon() {
    return ActionSettings
  }

  appBarStyle() {
    return 'colored'
  }

  renderContent({ openSnackBar }) {
    return (
      <PluginApp
        primaryColor={this.groupPrimaryColor()}
        openSnackBar={openSnackBar}
        ipcRenderer={ipcRenderer}
      />
    )
  }
}

export default Plugin
