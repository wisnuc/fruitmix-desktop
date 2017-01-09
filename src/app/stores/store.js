import { createStore, applyMiddleware } from 'redux'
import reducer from '../reducers/reducer'

import { ipcRenderer } from 'electron'

// sample dispatcher
const logger = store => next => action => {
  console.log('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  return result
}

const hijack = (state, action) => 
  action.type === 'HIJACK' ? action.state : reducer(state, action)

// const store = createStore(hijack, applyMiddleware(logger))
const store = createStore(hijack)

ipcRenderer.on('hijack', state => 
  store.dispatch({ type: 'HIJACK', state }))

window.store = store

console.log('store module initialized')

export default store

