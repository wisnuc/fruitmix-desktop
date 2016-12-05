global.BABEL_IS_RUNNING = true

console.log('You are running in develop/babel mode !')

require('babel-register')
require('./node/app')


