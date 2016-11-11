
var combineReducers = require('redux').combineReducers
var login = require('./login')
var setting = require('./setting')
var file = require('./file')
var media = require('./media')
var share = require('./share')
var config = require('./config')
// var transimission = require('./transimission')

const reducer = combineReducers({
  config,
	login,
	setting,
	file,
	media,
	share,
	// transimission
})

module.exports = reducer
