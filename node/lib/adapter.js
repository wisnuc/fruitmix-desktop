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
		setting: store.getState().setting,
		file: store.getState().file,
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
let prevLogin, prevSetting, prevFile, prevMedia, prevShare

let initCount = 3

export default () => { 

  // do referential equality check, memoization
  let state = store.getState()
  let mainWindow = getMainWindow()

  if (state.login === prevLogin &&
      state.setting === prevSetting &&
      state.file === prevFile &&
      state.media === prevMedia &&
      state.share === prevShare)
    return

  prevLogin = state.login
  prevSetting = state.setting
  prevFile = state.file
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

