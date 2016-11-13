import { createStore } from 'redux'
import Debug from 'debug'

import reducer from '../reducers/reducer'

const debug = Debug('store')
const store = createStore(reducer)

debug('store state', store.getState())
console.log('store created')

export default store

