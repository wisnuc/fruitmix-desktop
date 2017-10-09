import React from 'react'
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
    return '客户端升级'
  }

  menuIcon() {
    return UpdateIcon
  }

  quickName() {
    return '升级'
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
