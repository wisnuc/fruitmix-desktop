import path from 'path'
import fs from'fs'

import Debug from 'debug'
import { app, ipcMain, Menu, Tray } from 'electron'
// import rimraf from'rimraf'
// import mkdirp from'mkdirp'

// synchronized init, preparing paths
// rimraf.sync(path.join(__dirname, 'tmp'))
// mkdirp.sync(path.join(__dirname, 'tmp'))
// mkdirp.sync(path.join(__dirname, 'media'))
// mkdirp.sync(path.join(__dirname, 'download'))

// global.tmpPath = path.join(__dirname, 'tmp')
// global.mediaPath = path.join(__dirname, 'media')
// global.downloadPath = path.join(path.join(__dirname, 'download'))

import store from './serve/store/store'
import configObserver from './lib/config'
import { registerCommandHandler } from './lib/command'

import adapter from './lib/adapter'
import migration from './lib/migration'
import userModule from './lib/user'
import systemModule from './lib/system'

//init api
import loginApi from './lib/login'
import fileApi from './lib/file'
import mediaApi from './lib/media'
import upload from './lib/upload'
import download from './lib/download'
//init window
import { initMainWindow, getMainWindow } from './lib/window'
import { initTestWindow } from './lib/testHook'

import mdns from './lib/mdns'
import misc from './lib/misc'

global.entryFileDir = __dirname

const debug = Debug('main')

var mocha = false

const cwd = process.cwd()

// initialize mdns
mdns().on('stationUpdate', device => {
  store.dispatch({
    type: 'SET_DEVICE',
    device
  })
})

// read config file
try {
  let raw = fs.readFileSync(path.join(__dirname, 'server'))
  let config = JSON.parse(raw) 
  store.dispatch({
    type: 'CONFIG_INIT',
    data: config
  }) 
}
catch (e) { // e.code === 'ENOENT' && e.syscall === 'read'
}

store.subscribe(configObserver)
store.subscribe(adapter)

//app ready and open window ------------------------------------
app.on('ready', function() {

  initMainWindow()
  if (mocha) initTestWindow()
})

app.on('window-all-closed', () => app.quit())


