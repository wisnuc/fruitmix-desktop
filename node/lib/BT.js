import i18n from 'i18n'
import path from 'path'
import fs from 'original-fs'
import { dialog, ipcMain } from 'electron'

import hashFileAsync from './filehash'
import { getMainWindow } from './window'
import { uploadTorrentAsync } from './server'

Promise.promisifyAll(fs) // babel would transform Promise to bluebird

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
