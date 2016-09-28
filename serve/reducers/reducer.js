
var combineReducers = require('redux').combineReducers
var login = require('./login')
var setting = require('./setting')
var file = require('./file')
var media = require('./media')
var share = require('./share')

const reducer = combineReducers({
	login,
	setting,
	file,
	media,
	share
})

module.exports = reducer