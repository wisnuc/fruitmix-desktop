
var combineReducers = require('redux').combineReducers
var login = require('./login')
var setting = require('./setting')

const reducer = combineReducers({
	login,
	setting
})

module.exports = reducer