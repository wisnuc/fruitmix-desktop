import { combineReducers } from 'redux'
import login from './login'
import snack from './snack'
import transmission from './transmission'
import media from './media'
import setting from './setting'
import view from './view'
import file from './file'
import command from './command'
import node from './node'
import mdns from './mdns'
import maintenance from './maintenance'

const reducer = combineReducers({
	login,
	snack,
	transmission,
	media,
	setting,
	view,
	file,
  command,
  node,
  mdns,
  maintenance
})

export default reducer

