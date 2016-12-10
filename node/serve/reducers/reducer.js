var combineReducers = require('redux').combineReducers
import login from './login'
var setting = require('./setting')
var file = require('./file')
var media = require('./media')
var share = require('./share')
var config = require('./config')
import server from './server'

const reducer = combineReducers({
  config,
  server,
	login,
	setting,
	file,
	media,
	share,
	// transimission
})

module.exports = reducer
