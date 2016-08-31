
//import core module
var createStore = require('redux').createStore
//import reducer
var reducer = require('../reducers/reducer')

const store = createStore(reducer)

module.exports = store

