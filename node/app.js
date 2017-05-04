import path from 'path'
import fs from'fs'
import os from 'os'

import Debug from 'debug'
import { app } from 'electron'

import store from './serve/store/store'
import configObserver from './lib/config'
import adapter from './lib/adapter'

import { registerCommandHandler } from './lib/command'
import migration from './lib/migration'
import systemModule from './lib/system'

//init api
import loginApi from './lib/login'
import fileApi from './lib/file'
import mediaApi from './lib/media'
// import upload from './lib/upload'
import newUpload from './lib/newUpload'
import download from './lib/newDownload'
//init window
import { initMainWindow, getMainWindow } from './lib/window'
import { initTestWindow } from './lib/testHook'

import mdns from './lib/mdns'
import misc from './lib/misc'

const Configuration = require('./lib/configuration')

global.entryFileDir = __dirname
global.db = {}

const debug = Debug('main')

var mocha = false

// initialize mdns
/**
mdns().on('stationUpdate', device => {
  store.dispatch({
    type: 'SET_DEVICE',
    device
  })
})
**/

// read config file
try {
  let raw = fs.readFileSync(path.join(tmpPath, 'server'))
  let config = JSON.parse(raw) 
  store.dispatch({
    type: 'CONFIG_INIT',
    data: config
  }) 
}
catch (e) { // e.code === 'ENOENT' && e.syscall === 'read'
  console.log(e)
}

store.subscribe(configObserver)
store.subscribe(adapter)
store.subscribe(() => {

  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
  console.log('store', store.getState())
  console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
})

//app ready and open window ------------------------------------
app.on('ready', function() {

  let appDataPath = app.getPath('appData')
  console.log(`appDataPath is ${appDataPath}`)

  let configuration = new Configuration(appDataPath)
  configuration.initAsync().asCallback(err => {
    if (err) {
      console.log('failed to load configuration, die', err)
      process.exit(1)
    }
    else {
      initMainWindow()
      //to fixed
      if (os.platform() == 'darwin') {
        console.log('system is osx')
        let data = app.getPath('downloads')
        console.log('download path is : ' + data)
        store.dispatch({type:'CONFIG_SET_DOWNLOAD_PATH',data})
      }
    }
  })

  global.configuration = configuration

/**  
  setTimeout(() => {
    if (true) {
      store.dispatch({
        type: 'CONFIG_SET_IP',
        data: '192.168.5.182'
      })
    }
  },1000)
**/
})

app.on('window-all-closed', () => app.quit())

