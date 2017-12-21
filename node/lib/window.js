import path from 'path'
import i18n from 'i18n'
import Debug from 'debug'
import fs from 'original-fs'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import fsUtils from 'nodejs-fs-utils'
import Promise from 'bluebird'
import { ipcMain, BrowserWindow, app, dialog, Menu } from 'electron'
import { clearTasks } from './transmissionUpdate'
import store from './store'

Promise.promisifyAll(fsUtils)
Promise.promisifyAll(mkdirp) // mkdirp.mkdirpAsync
const rimrafAsync = Promise.promisify(rimraf)

const debug = Debug('lib:window')

let _mainWindow = null

const getMainWindow = () => _mainWindow

const initMainWindow = () => {
  // create window
  _mainWindow = new BrowserWindow({
    frame: true,
    height: 768,
    resizable: true,
    width: 1366,
    minWidth: 1366,
    minHeight: 768,
    title: 'WISNUC',
    icon: path.join(global.rootPath, 'public/assets/images/icon.png'), // it doesn't work in devel mode
    webPreferences: {
      webSecurity: true, // set false to disable the same-origin policy
      experimentalFeatures: true
    }
  })

  // Create the Application's main menu
  const template = [{
    label: 'Application',
    submenu: [
      { label: 'About Application', selector: 'orderFrontStandardAboutPanel:' },
      { type: 'separator' },
      { label: 'Quit', accelerator: 'Command+Q', click() { app.quit() } }
    ]
  }, {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
      { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click: (item, focusedWindow) => focusedWindow && focusedWindow.toggleDevTools()
      }
    ]
  }]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  // window title
  _mainWindow.on('page-title-updated', (event) => {
    event.preventDefault()
  })

  let close = false
  _mainWindow.on('close', (e) => {
    // console.log('global.configuration', global.configuration.globalConfig.getConfig().noCloseConfirm)
    if (close || (store.getState().config && store.getState().config.noCloseConfirm)) {
      clearTasks()
    } else {
      dialog.showMessageBox(_mainWindow, {
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
  })

  // debug mode
  // _mainWindow.webContents.openDevTools()
  // _mainWindow.maximize()

  if (global.BABEL_IS_RUNNING) { _mainWindow.loadURL(`file://${process.cwd()}/public/index.html`) } else { _mainWindow.loadURL(`file://${path.join(global.entryFileDir, '../public', 'index.html')}`) }

  // ipc message will be lost if sent early than 'did-finish-load'
  const contents = _mainWindow.webContents
  contents.on('did-finish-load', () =>
    contents.send('CONFIG_UPDATE', global.configuration.getConfiguration()))

  // console.log('[window] mainWindow initialized')
}

const openNewWindow = (title, url) => {
  debug('openNewWindow', url)

  const newWindow = new BrowserWindow({
    frame: true,
    height: 768,
    width: 1366,
    resizable: true,
    title
  })

  newWindow.on('page-title-updated', event => event.preventDefault())
  newWindow.maximize()

  newWindow.loadURL(url)
}

/* clean dir: 'tmp tmpTrans thumb image' */
const calcCacheSize = async () => {
  const tmpSize = await fsUtils.fsizeAsync(store.getState().config.tmpPath, { countFolders: false, fs })
  const tmpTransSize = await fsUtils.fsizeAsync(store.getState().config.tmpTransPath, { countFolders: false, fs })
  const thumbSize = await fsUtils.fsizeAsync(store.getState().config.thumbPath, { countFolders: false, fs })
  const imageSize = await fsUtils.fsizeAsync(store.getState().config.imagePath, { countFolders: false, fs })
  return (tmpSize + tmpTransSize + thumbSize + imageSize)
}

const cleanCache = async () => {
  await rimrafAsync(store.getState().config.tmpPath, fs)
  await mkdirp.mkdirpAsync(store.getState().config.tmpPath)
  await rimrafAsync(store.getState().config.tmpTransPath, fs)
  await mkdirp.mkdirpAsync(store.getState().config.tmpTransPath)
  await rimrafAsync(store.getState().config.thumbPath, fs)
  await mkdirp.mkdirpAsync(store.getState().config.thumbPath)
  await rimrafAsync(store.getState().config.imagePath, fs)
  await mkdirp.mkdirpAsync(store.getState().config.imagePath)
  return true
}

ipcMain.on('newWebWindow', (event, title, url) => openNewWindow(title, url))

ipcMain.on('POWEROFF', () => app.quit())

ipcMain.on('SETCONFIG', (event, args) => {
  // console.log('SETCONFIG:', args)
  global.configuration.updateGlobalConfigAsync(args)
    .catch(e => console.log('SETCONFIG error', e))
})

ipcMain.on('GetCacheSize', () => {
  const wc = (getMainWindow()).webContents
  calcCacheSize().then(size => wc.send('CacheSize', { error: null, size })).catch((e) => {
    console.log('GetCacheSize error', e)
    wc.send('CacheSize', { error: e, size: null })
  })
})

ipcMain.on('CleanCache', () => {
  const wc = (getMainWindow()).webContents
  cleanCache().then(() => wc.send('CleanCacheResult', null)).catch((e) => {
    console.log('CleanCache error', e)
    wc.send('CleanCacheResult', e)
  })
})

export { initMainWindow, getMainWindow }
