import { combineReducers } from 'redux'
import setting from './setting'
import media from './media'
import login from './login'
import login2 from './login2'
import config from './config'
import server from './server'

const reducer = combineReducers({
  config,
  server,
	login,
  login2,
	media,
	setting
})

export default reducer
