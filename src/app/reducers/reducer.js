//import core module
import { combineReducers } from 'redux'
//import all reducers
import login from './login';
import navigation from './navigation';
import data from './data';
import multiple from './multiple';
import snack from './snack';

const reducer = combineReducers({
	login,
	navigation,
	data,
	multiple,
	snack
});

export default reducer; 
