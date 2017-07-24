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

// import upload from './lib/upload'
import newUpload from './lib/newUpload'
import download from './lib/newDownload'

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
  // console.log(`appDataPath is ${appDataPath}`)
  const configuration = new Configuration(appDataPath)

  configuration.initAsync().asCallback((err) => {
    if (err) {
      console.log('failed to load configuration, die', err)
      process.exit(1)
    } else {
      initMainWindow()
      if (global.BABEL_IS_RUNNING) return
      autoUpdater.checkForUpdates()
      console.log('autoUpdater checkForUpdates...')
    }
  })

  global.configuration = configuration
})

app.on('window-all-closed', () => app.quit())

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'
log.info('App starting...')

const sendStatusToWindow = (text) => {
  log.info(text)
  getMainWindow().webContents.send('message', text)
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...')
})

autoUpdater.on('update-available', (ev, info) => {
  sendStatusToWindow('Update available.')
})

autoUpdater.on('update-not-available', (ev, info) => {
  sendStatusToWindow('Update not available.')
})

autoUpdater.on('error', (ev, err) => {
  sendStatusToWindow(err)
  sendStatusToWindow('Error in auto-updater.')
})

autoUpdater.on('download-progress', (ev, progressObj) => {
  sendStatusToWindow('Download progress...')
})

autoUpdater.on('update-downloaded', (ev, info) => {
  sendStatusToWindow('Update downloaded; will install in 5 seconds')
})
