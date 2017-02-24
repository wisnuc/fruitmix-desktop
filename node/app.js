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
import upload from './lib/upload'
// import newUpload from './lib/newUpload'
import download from './lib/download'
//init window
import { initMainWindow, getMainWindow } from './lib/window'
import { initTestWindow } from './lib/testHook'

import mdns from './lib/mdns'
import misc from './lib/misc'

global.entryFileDir = __dirname

const debug = Debug('main')

var mocha = false

// initialize mdns
mdns().on('stationUpdate', device => {
  store.dispatch({
    type: 'SET_DEVICE',
    device
  })
})

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

//app ready and open window ------------------------------------
app.on('ready', function() {
  initMainWindow()
  if (os.platform() == 'darwin') {
    console.log('system is osx')
    let data = app.getPath('downloads')
    console.log('download path is : ' + data)
    store.dispatch({type:'CONFIG_SET_DOWNLOAD_PATH',data})
  }
  
  if (mocha) initTestWindow()

  // setTimeout(() => {
  //   if (true) {
  //     store.dispatch({
  //       type: 'CONFIG_SET_IP',
  //       data: '192.168.5.182'
  //     })
  //     dispatch({
  //       type: 'LOGGEDIN',
  //       obj: {
  //         "type": "JWT",
  //         "uuid": "1100da1a-4b5d-4723-87c8-31ea912eef98",
  //         "username": "liu",
  //         "avatar": null,
  //         "email": null,
  //         "isAdmin": false,
  //         "isFirstUser": false,
  //         "home": "0afdc3a4-2738-4df8-b794-0421d6d7705d",
  //         "library": "b19561a5-8a14-43bc-85b4-4774a0277850",
  //         "unixUID": 2004,
  //         token:'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1dWlkIjoiMTEwMGRhMWEtNGI1ZC00NzIzLTg3YzgtMzFlYTkxMmVlZjk4In0.0Fs5Lvy3_p5-KkzeKAYB3xyl76qRAP12p5JMRW7k-ro'
  //       }
  //     })
  //   }
  // },1000)
})

app.on('window-all-closed', () => app.quit())