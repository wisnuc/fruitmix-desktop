import { app } from 'electron'
import i18n from 'i18n'
import path from 'path'

import store from './lib/store'
import configObserver from './lib/configObserver'
import Configuration from './lib/configuration'
import mdns from './lib/mdns'
import login from './lib/login'
import media from './lib/media'
import newUpload from './lib/newUpload'
import newDownload from './lib/newDownload'
import clientUpdate from './lib/clientUpdate'
import { initMainWindow, getMainWindow } from './lib/window'

global.entryFileDir = __dirname

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

  i18n.configure({
    locales: ['en-US', 'zh-CN'],
    directory: path.resolve(__dirname, '../', 'locales'),
    defaultLocale: /zh/.test(app.getLocale()) ? 'zh-CN' : 'en-US'
  })
})

app.on('window-all-closed', () => app.quit())

/* handle uncaught Exception */
process.on('uncaughtException', (err) => {
  console.log(`!!!!!!\nuncaughtException:\n${err}\n------`)
})
