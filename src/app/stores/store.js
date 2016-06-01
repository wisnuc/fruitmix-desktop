// reducers
//import core module
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
//import reducer
import reducer from '../reducers/reducer';
import createLogger from 'redux-logger';

const loggerMiddleware = createLogger();

const createStoreWithMiddleware = applyMiddleware(
	thunkMiddleware,
	loggerMiddleware
)(createStore);

export default function configureStore(initialState) {
	return createStoreWithMiddleware(reducer, initialState);
}

