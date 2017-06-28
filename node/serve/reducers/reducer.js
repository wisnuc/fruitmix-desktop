import { combineReducers } from 'redux'
import login from './login'
import config from './config'

const reducer = combineReducers({
  config,
  login
})

export default reducer
