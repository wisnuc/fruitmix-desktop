import { combineReducers } from 'redux'
import setting from './setting'
import media from './media'
import login from './login'
import config from './config'
import server from './server'

const reducer = combineReducers({
  config,
  server,
  login,
  media,
  setting
})

export default reducer
