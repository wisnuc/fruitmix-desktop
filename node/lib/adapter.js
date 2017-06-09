import Debug from 'debug'
import store from '../serve/store/store'
import { getMainWindow } from './window'

const debug = Debug('lib:adapter')

// store adapter from backend to frontend
const adapter = () => {
  const state = {
    config: store.getState().config,
    server: store.getState().server,
    login: store.getState().login,
    setting: store.getState().setting,
    media: store.getState().media,
    share: store.getState().share
  }

  debug('adapter, store state', state)
  return state
}

let storeLock = false
let waitForRender = null

// updating front end
// on backend store update
// with throttling (200ms)
// without referential equality check
let prevLogin,
  prevSetting,
  prevMedia,
  prevShare

const initCount = 3

export default () => {
  // do referential equality check, memoization
  const state = store.getState()
  const mainWindow = getMainWindow()

  if (state.login === prevLogin
    && state.setting === prevSetting
    && state.media === prevMedia
    && state.share === prevShare) { return }

  prevLogin = state.login
  prevSetting = state.setting
  prevMedia = state.media
  prevShare = state.share

  if (storeLock) { // strategy ???
    clearTimeout(waitForRender)
    waitForRender = setTimeout(() => {
      storeLock = false
      debug(`subscribe doing .......${(new Date()).getTime()}`)
      mainWindow.webContents.send('adapter', adapter())
    }, 200)
  } else {
    debug(`subscribe doing .......${(new Date()).getTime()}`)
    mainWindow.webContents.send('adapter', adapter())
    storeLock = true
    waitForRender = setTimeout(() => {
      storeLock = false
    }, 200)
  }
}
