
var combineReducers = require('redux').combineReducers
var login = require('./login')

const reducer = combineReducers({
	login
})

module.exports = reducer