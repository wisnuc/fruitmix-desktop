import i18n from 'i18n'
import { app } from 'electron'

import store from './store'
import { getMainWindow } from './window'

let preGlobalConfig
let preUserConfig

const configObserver = () => {
  if (getMainWindow() && (store.getState().config !== preGlobalConfig || store.getState().userConfig !== preUserConfig)) {
    preGlobalConfig = store.getState().config
    preUserConfig = store.getState().userConfig
    const config = global.configuration.getConfiguration()
    if (config.global && config.global.locales) i18n.setLocale(config.global.locales)
    else i18n.setLocale(/zh/.test(app.getLocale()) ? 'zh-CN' : 'en-US')
    getMainWindow().webContents.send('CONFIG_UPDATE', config)
  }
}

export default configObserver
