import path from 'path'
import fs from'fs'

import Debug from 'debug'
import { app, ipcMain, Menu, Tray } from 'electron'
import rimraf from'rimraf'
import mkdirp from'mkdirp'

import store from './serve/store/store'
import configObserver from './lib/config'
import { registerCommandHandler } from './lib/command'

import adapter from './lib/adapter'
import migration from './lib/migration'
import userModule from './lib/user'
import systemModule from './lib/system'

const upload = require('./lib/upload')
const download = require('./lib/download')
import loginApi from './lib/login'
const mediaApi = require('./lib/media')
// const deviceApi = require('./lib/device')
const fileApi = require('./lib/file')
const utils = require('./lib/util')

import { initMainWindow, getMainWindow } from './lib/window'
import { initTestWindow } from './lib/testHook'

import mdns from './lib/mdns'
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

// synchronized init, preparing paths
rimraf.sync(path.join(cwd, 'tmp'))
mkdirp.sync(path.join(cwd, 'tmp'))
mkdirp.sync(path.join(cwd, 'media'))
mkdirp.sync(path.join(cwd, 'download'))

// read config file
try {
  let raw = fs.readFileSync(path.join(cwd, 'server'))
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

	//Tray var appIcon = null
	// appIcon = new Tray(path.join(__dirname,'180-180.png'))
	// var contextMenu = Menu.buildFromTemplate([
	//     { label: 'Item1', type: 'radio' },
	//     { label: 'Item2', type: 'radio' },
	//     { label: 'Item3', type: 'radio', checked: true },
	//     { label: 'Item4', type: 'radio' }
	// ])
	// appIcon.setToolTip('This is my application.')
  //  	appIcon.setContextMenu(contextMenu)
})

app.on('window-all-closed', () => app.quit())

// ipcMain.on('close-main-window', () => app.quit())
/**
ipcMain.on('getDeviceUsedRecently', err => {
	deviceApi.getRecord()
})
**/


