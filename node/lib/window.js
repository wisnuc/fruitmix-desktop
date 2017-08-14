import Debug from 'debug'
import path from 'path'
import { ipcMain, BrowserWindow, app } from 'electron'

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
    icon: path.join(global.rootPath, 'icon.png'), // it doesn't work in devel mode
    webPreferences: {
      webSecurity: true, // set false to disable the same-origin policy
      experimentalFeatures: true
    }
  })

  // window title
  _mainWindow.on('page-title-updated', (event) => {
    event.preventDefault()
  })

  // debug mode
  // _mainWindow.webContents.openDevTools()
  // _mainWindow.maximize()

  if (global.BABEL_IS_RUNNING) { _mainWindow.loadURL(`file://${process.cwd()}/public/index.html`) } else { _mainWindow.loadURL(`file://${path.join(global.entryFileDir, '../public', 'index.html')}`) }

  // ipc message will be lost if sent early than 'did-finish-load'
  const contents = _mainWindow.webContents
  contents.on('did-finish-load', () =>
    contents.send('CONFIG_LOADED', global.configuration.getConfiguration()))

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

ipcMain.on('newWebWindow', (event, title, url) => openNewWindow(title, url))

ipcMain.on('POWEROFF', () => app.quit())

export { initMainWindow, getMainWindow }
