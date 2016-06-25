//import core module
import { combineReducers } from 'redux'
//import all reducers
import login from './login';
import navigation from './navigation';
import data from './data';
import multiple from './multiple';
import snack from './snack';
import transmission from './transmission';
import isShow from './isShow';
import tree from './tree';
import media from './media'

const reducer = combineReducers({
	login,
	navigation,
	data,
	multiple,
	snack,
	transmission,
	isShow,
	tree,
	media
});

export default reducer; 
