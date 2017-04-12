import Debug from 'debug'
import store from '../serve/store/store'
import { getMainWindow } from './window' 

const debug = Debug('lib:adapter')

// store adapter from backend to frontend
const adapter = () => {

	let state = {
    config: store.getState().config,
    server: store.getState().server,
		login: store.getState().login,
    login2: store.getState().login2,
		setting: store.getState().setting,
		media: store.getState().media,
		share: store.getState().share,
	}

  debug('adapter, store state', state)
  return state
}

var storeLock = false
var waitForRender = null

// updating front end
// on backend store update
// with throttling (200ms)
// without referential equality check
let prevLogin, prevLogin2, prevSetting, prevMedia, prevShare

let initCount = 3

export default () => { 

  // do referential equality check, memoization
  let state = store.getState()
  let mainWindow = getMainWindow()

  if (state.login === prevLogin 
    && state.login2 === prevLogin2
    && state.setting === prevSetting
    && state.media === prevMedia
    && state.share === prevShare)
    return

  prevLogin = state.login
  prevLogin2 = state.login2
  prevSetting = state.setting
  prevMedia = state.media
  prevShare = state.share

	if (storeLock) { // strategy ???
		clearTimeout(waitForRender)
		waitForRender = setTimeout(()=>{
			storeLock = false;
			debug('subscribe doing .......' + (new Date).getTime())
			mainWindow.webContents.send('adapter',adapter())
		},200)
	} 
  else {

		debug('subscribe doing .......' + (new Date).getTime())
		mainWindow.webContents.send('adapter',adapter())
		storeLock = true
		waitForRender = setTimeout(()=>{
			storeLock = false
		},200)
	}
}

