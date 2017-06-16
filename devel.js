global.BABEL_IS_RUNNING = true
global.rootPath = __dirname

console.log('Running in developer (babel-node) mode')

require('babel-register')
require('./node/app')
