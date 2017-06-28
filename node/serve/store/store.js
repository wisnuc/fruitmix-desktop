import { createStore } from 'redux'
import reducer from '../reducers/reducer'

const store = createStore(reducer)
global.dispatch = action => store.dispatch(action)

export default store
