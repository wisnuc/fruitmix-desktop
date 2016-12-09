global.BABEL_IS_RUNNING = true

console.log('Running in developer (babel-node) mode')

require('babel-register')
require('./node/app')


