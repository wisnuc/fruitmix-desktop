var rimraf = require('rimraf')
var mkdirp = require('mkdirp')
var path = require('path')

// synchronized init, preparing paths
rimraf.sync(path.join(__dirname, 'tmp'))
// rimraf.sync(path.join(__dirname, 'tmpTrans'))
mkdirp.sync(path.join(__dirname, 'tmpTrans'))
mkdirp.sync(path.join(__dirname, 'tmp'))
mkdirp.sync(path.join(__dirname, 'media'))
mkdirp.sync(path.join(__dirname, 'download'))
// mkdirp.sync(path.join(__dirname, 'cache'))

global.tmpTransPath = path.join(__dirname, 'tmpTrans')
global.tmpPath = path.join(__dirname, 'tmp')
global.mediaPath = path.join(__dirname, 'media')
global.downloadPath = path.join(__dirname, 'download')
global.rootPath = __dirname
// global.cachePath = path.join(__dirname, 'cache')

require('./build/app')
