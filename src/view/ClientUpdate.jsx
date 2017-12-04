import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import UpdateIcon from 'material-ui/svg-icons/action/system-update-alt'
import Base from './Base'
import UpdateApp from '../control/ClientUpdateApp'

const debug = Debug('view:component:ClientUpdate')

class Update extends Base {
  constructor(ctx) {
    super(ctx)
  }

  navGroup() {
    return 'settings'
  }

  menuName() {
    return i18n.__('ClientUpdate Menu Name')
  }

  menuIcon() {
    return UpdateIcon
  }

  quickName() {
    return i18n.__('ClientUpdate Quick Name')
  }

  appBarStyle() {
    return 'colored'
  }

  renderContent({ openSnackBar }) {
    return (
      <UpdateApp
        ipcRenderer={ipcRenderer}
      />
    )
  }
}

export default Update
