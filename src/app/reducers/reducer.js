//import core module
import { combineReducers } from 'redux'
//import all reducers
import login from './login'
import navigation from './navigation'
import data from './data'
import multiple from './multiple'
import snack from './snack'
import transmission from './transmission'
import isShow from './isShow'
import tree from './tree'
import media from './media'
import setting from './setting'
import view from './view'
import file from './file'
import share from './share'

const reducer = combineReducers({
	login,
	navigation,
	data,
	multiple,
	snack,
	transmission,
	isShow,
	tree,
	media,
	setting,
	view,
	file,
	share
});

export default reducer; 
