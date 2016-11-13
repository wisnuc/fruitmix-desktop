var combineReducers = require('redux').combineReducers
var login = require('./login')
var setting = require('./setting')
var file = require('./file')
var media = require('./media')
var share = require('./share')
var config = require('./config')
// var server = require('./server').default
import server from './server'


console.log('>>>>>>>>')
console.log(server)
console.log('<<<<<<<<')
// var transimission = require('./transimission')

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
