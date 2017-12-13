import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import LanguageIcon from 'material-ui/svg-icons/action/language'
import Base from './Base'
import LanguageApp from '../control/LanguageApp'

const debug = Debug('view:component:Language')

class Language extends Base {
  constructor(ctx) {
    super(ctx)
  }

  navGroup() {
    return 'settings'
  }

  menuName() {
    return i18n.__('Language Menu Name')
  }

  menuIcon() {
    return LanguageIcon
  }

  quickName() {
    return i18n.__('Language Quick Name')
  }

  appBarStyle() {
    return 'colored'
  }

  renderContent({ openSnackBar }) {
    return (
      <LanguageApp
        primaryColor={this.groupPrimaryColor()}
        openSnackBar={openSnackBar}
        ipcRenderer={ipcRenderer}
      />
    )
  }
}

export default Language
