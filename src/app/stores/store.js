// reducers
//import core module
import injectTapEventPlugin from 'react-tap-event-plugin'
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

const s = createStore(reducer);
injectTapEventPlugin()
export default function configureStore(initialState) {
	if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers/reducer', () => {
      const nextRootReducer = require('../reducers/reducer');
      store.replaceReducer(nextRootReducer);
    });
  }
	return createStoreWithMiddleware(reducer, initialState);
}

// export default function configureStore() {
// 	return s
// }

