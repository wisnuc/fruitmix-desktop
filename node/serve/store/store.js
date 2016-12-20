import { createStore } from 'redux'
import Debug from 'debug'
import reducer from '../reducers/reducer'

const debug = Debug('store')
const store = createStore(reducer)

debug('store state', store.getState())
console.log('store created')

// FIXME
global.dispatch = action => store.dispatch(action)

export default store

