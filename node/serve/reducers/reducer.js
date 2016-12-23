import { combineReducers } from 'redux'
import setting from './setting'
import file from './file'
import media from './media'
import login from './login'
import share from './share'
import config from './config'
import server from './server'

const reducer = combineReducers({
  config,
  server,
	login,
	file,
	share,
	media,
	setting
})

export default reducer
