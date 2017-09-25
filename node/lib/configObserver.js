import store from './store'
import { getMainWindow } from './window'

let preGlobalConfig
let preUserConfig

const configObserver = () => {
  if (getMainWindow() && (store.getState().config !== preGlobalConfig || store.getState().userConfig !== preUserConfig)) {
    preGlobalConfig = store.getState().config
    preUserConfig = store.getState().userConfig
    getMainWindow().webContents.send('CONFIG_UPDATE', global.configuration.getConfiguration())
  }
}

export default configObserver
