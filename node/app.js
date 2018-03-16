const path = require('path')
const i18n = require('i18n')
const { app, dialog } = require('electron')

const store = require('./lib/store')
const Configuration = require('./lib/configuration')
const { clearTasks } = require('./lib/transmissionUpdate')
const { initMainWindow, getMainWindow } = require('./lib/window')

require('./lib/BT')
require('./lib/box')
require('./lib/mdns')
require('./lib/mqtt')
require('./lib/login')
require('./lib/media')
require('./lib/newUpload')
require('./lib/newDownload')
require('./lib/clientUpdate')
require('./lib/transmissionUpdate')

/* app close check */
let close = false
const onClose = (e) => {
  if (close || (store.getState().config && store.getState().config.noCloseConfirm)) {
    clearTasks()
  } else {
    dialog.showMessageBox(getMainWindow(), {
      type: 'warning',
      title: i18n.__('Confirm Close Title'),
      buttons: [i18n.__('Cancel'), i18n.__('Close')],
      checkboxLabel: i18n.__('Do not Show again'),
      checkboxChecked: false,
      message: i18n.__('Confirm Close Text')
    }, (response, checkboxChecked) => {
      if (response === 1 && checkboxChecked) {
        close = true
        global.configuration.updateGlobalConfigAsync({ noCloseConfirm: true })
          .then(() => setTimeout(app.quit, 100)) // waiting saving configuration to disk
          .catch(err => console.log('updateGlobalConfigAsync error', err))
      } else if (response === 1) {
        close = true
        setImmediate(app.quit)
      }
    })
    e.preventDefault()
  }
}

/* app ready and open window */
app.on('ready', () => {
  const appDataPath = app.getPath('appData')
  const configuration = new Configuration(appDataPath)
  configuration.initAsync()
    .then(() => {
      initMainWindow()
      getMainWindow().on('close', onClose)
    })
    .catch((err) => {
      console.error('failed to load configuration, die', err)
      process.exit(1)
    })

  global.configuration = configuration

  i18n.configure({
    updateFiles: false,
    locales: ['en-US', 'zh-CN'],
    directory: path.resolve(__dirname, '../', 'locales'),
    defaultLocale: /zh/.test(app.getLocale()) ? 'zh-CN' : 'en-US'
  })
})

app.on('window-all-closed', () => app.quit())

/* configObserver */
let preGlobalConfig
let preUserConfig

const configObserver = () => {
  // console.log('\n\n===\nstore', store.getState())
  if (getMainWindow() && (store.getState().config !== preGlobalConfig || store.getState().userConfig !== preUserConfig)) {
    preGlobalConfig = store.getState().config
    preUserConfig = store.getState().userConfig
    const config = global.configuration.getConfiguration()
    if (config.global && config.global.locales) i18n.setLocale(config.global.locales)
    else i18n.setLocale(/zh/.test(app.getLocale()) ? 'zh-CN' : 'en-US')
    getMainWindow().webContents.send('CONFIG_UPDATE', config)
  }
}

store.subscribe(configObserver)

/* handle uncaught Exception */
process.on('uncaughtException', (err) => {
  console.log(`!!!!!!\nuncaughtException:\n${err}\n------`)
})
