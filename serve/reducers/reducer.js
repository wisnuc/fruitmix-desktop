
var combineReducers = require('redux').combineReducers
var login = require('./login')
var setting = require('./setting')
var file = require('./file')
var media = require('./media')

const reducer = combineReducers({
	login,
	setting,
	file,
	media
})

module.exports = reducer