
var combineReducers = require('redux').combineReducers
var login = require('./login')
var setting = require('./setting')
var data = require('./data')

const reducer = combineReducers({
	login,
	setting,
	data
})

module.exports = reducer