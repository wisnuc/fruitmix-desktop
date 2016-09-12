
var combineReducers = require('redux').combineReducers
var login = require('./login')
var setting = require('./setting')
var file = require('./file')

const reducer = combineReducers({
	login,
	setting,
	file
})

module.exports = reducer