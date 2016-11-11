//import core module
var createStore = require('redux').createStore
//import reducer
var reducer = require('../reducers/reducer')

const store = createStore(reducer)

console.log('store created')

module.exports = store

