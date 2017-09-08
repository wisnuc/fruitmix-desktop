import path from 'path'
import fs from 'fs'
import os from 'os'

import Debug from 'debug'
import { app } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

import store from './serve/store/store'
import configObserver from './lib/configObserver'

import migration from './lib/migration'
import systemModule from './lib/system'
import Configuration from './lib/configuration'

// init api
import loginApi from './lib/login'
import mediaApi from './lib/media'

import newUpload from './lib/newUpload'
import download from './lib/newDownload'

import clientUpdate from './lib/clientUpdate'

// init window
import { initMainWindow, getMainWindow } from './lib/window'
import { initTestWindow } from './lib/testHook'

import mdns from './lib/mdns'

global.entryFileDir = __dirname
global.db = {}

const debug = Debug('main')
const mocha = false

store.subscribe(configObserver)

/*
store.subscribe(() => {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
  console.log('store', store.getState())
  console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
})
*/

/* app ready and open window */
app.on('ready', () => {
  const appDataPath = app.getPath('appData')
  const configuration = new Configuration(appDataPath)
  configuration.initAsync().asCallback((err) => {
    if (err) {
      console.log('failed to load configuration, die', err)
      process.exit(1)
    } else {
      initMainWindow()
    }
  })
  global.configuration = configuration
})

process.on('uncaughtException', (err) => {
  console.log(`!!!!!!\nuncaughtException:\n${err.stack}\n------`)
})

app.on('window-all-closed', () => app.quit())
