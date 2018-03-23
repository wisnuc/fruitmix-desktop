const path = require('path')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const fs = require('original-fs') // eslint-disable-line
const Promise = require('bluebird')
const fsUtils = require('nodejs-fs-utils')
const { ipcMain, BrowserWindow, app, Menu } = require('electron')

const store = require('./store')

Promise.promisifyAll(fsUtils)
Promise.promisifyAll(mkdirp) // mkdirp.mkdirpAsync
const rimrafAsync = Promise.promisify(rimraf)

let _mainWindow = null

const getMainWindow = () => _mainWindow

const initMainWindow = () => {
  // create window
  _mainWindow = new BrowserWindow({
    frame: true,
    height: 768,
    width: 1366,
    resizable: true,
    minWidth: 1366,
    minHeight: 768,
    title: 'WISNUC',
    icon: path.join(global.rootPath, 'public/assets/images/icon.png'),
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
      { label: 'Quit', accelerator: 'Command+Q', click () { app.quit() } }
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

  if (process.platform === 'darwin') Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  // window title
  _mainWindow.on('page-title-updated', (event) => {
    event.preventDefault()
  })

  // debug mode
  if (process.env.NODE_ENV === 'dev') _mainWindow.webContents.openDevTools()

  _mainWindow.loadURL(`file://${path.join(global.rootPath, 'public', 'index.html')}`)

  // ipc message will be lost if sent early than 'did-finish-load'
  const contents = _mainWindow.webContents
  contents.on('did-finish-load', () =>
    contents.send('CONFIG_UPDATE', global.configuration.getConfiguration()))
}

/* clean dir: 'tmp tmpTrans thumb image' */
const calcCacheSize = async () => {
  const tmpSize = await fsUtils.fsizeAsync(store.getState().config.tmpPath, { countFolders: false, fs })
  const tmpTransSize = await fsUtils.fsizeAsync(store.getState().config.tmpTransPath, { countFolders: false, fs })
  const thumbSize = await fsUtils.fsizeAsync(store.getState().config.thumbPath, { countFolders: false, fs })
  const imageSize = await fsUtils.fsizeAsync(store.getState().config.imagePath, { countFolders: false, fs })
  // const boxSize = await fsUtils.fsizeAsync(store.getState().config.boxPath, { countFolders: false, fs })
  // return (tmpSize + tmpTransSize + thumbSize + imageSize + boxSize)
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
  // await rimrafAsync(store.getState().config.boxPath, fs)
  // await mkdirp.mkdirpAsync(store.getState().config.boxPath, fs)
  return true
}

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

module.exports = { initMainWindow, getMainWindow }
