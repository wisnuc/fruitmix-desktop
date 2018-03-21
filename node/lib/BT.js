const i18n = require('i18n')
const path = require('path')
const Promise = require('bluebird')
const { dialog, ipcMain } = require('electron')
const fs = Promise.promisifyAll(require('original-fs')) // eslint-disable-line

const hashFileAsync = require('./filehash')
const { getMainWindow } = require('./window')
const { uploadTorrentAsync } = require('./server')

const uploadAsync = async (dirUUID, entry) => {
  const stat = await fs.lstatAsync(path.resolve(entry))
  const parts = await hashFileAsync(entry, stat.size, 1073741824)
  const readStream = fs.createReadStream(entry)
  await uploadTorrentAsync(dirUUID, readStream, parts[0])
}

const addTorrentHandle = (event, args) => {
  const { dirUUID } = args
  const filters = [
    { name: 'Torrent', extensions: ['torrent'] },
    { name: 'All Files', extensions: ['*'] }
  ]
  dialog.showOpenDialog(getMainWindow(), { properties: ['openFile'], filters }, (entries) => {
    if (!entries || !entries.length) return
    uploadAsync(dirUUID, entries[0])
      .then(() => getMainWindow().webContents.send('snackbarMessage', { message: i18n.__('Add Torrent Success') }))
      .catch((err) => {
        let text = i18n.__('Add Torrent Failed')
        if (err.response && err.response.body && err.response.body.message === 'torrent exist') text = i18n.__('Task Exist')
        getMainWindow().webContents.send('snackbarMessage', { message: text })
      })
  })
}

/* ipc listener */
ipcMain.on('ADD_TORRENT', addTorrentHandle)
