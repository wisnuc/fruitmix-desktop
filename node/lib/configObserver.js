import i18n from 'i18n'
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
    getMainWindow().webContents.send('CONFIG_UPDATE', config)
  }
}

export default configObserver
