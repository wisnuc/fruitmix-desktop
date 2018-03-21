const path = require('path')
const Promise = require('bluebird')
const { dialog, ipcMain } = require('electron')
const fs = Promise.promisifyAll(require('original-fs')) // eslint-disable-line

const { getMainWindow } = require('./window')
const { boxUploadAsync } = require('./server')
const hashFileAsync = require('./filehash')
const { fileMagicAsync } = require('./magic')

/* only read files */
const readAsync = async (entries) => {
  const files = []
  const fakeList = []
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const filename = path.parse(entry).base
    const stat = await fs.lstatAsync(path.resolve(entry))
    if (!stat.isFile()) continue

    const size = stat.size
    const parts = await hashFileAsync(entry, size, 1024 * 1024 * 1024)
    const sha256 = parts.slice(-1)[0].fingerprint
    files.push({ entry, filename, size, sha256 })

    const magic = await fileMagicAsync(entry)
    const fakedata = { magic, size, entry }
    fakeList.push({ sha256, size, filename, fakedata })
  }

  return ({ fakeList, files })
}

/* handler */
const uploadHandle = (event, args) => {
  const { session, box } = args
  // only allow upload single File
  // const dialogType = type === 'directory' ? 'openDirectory' : 'openFile'
  // dialog.showOpenDialog(getMainWindow(), { properties: [dialogType, 'multiSelections'] }, (entries) => {
  dialog.showOpenDialog(getMainWindow(), { properties: ['openFile'] }, (entries) => {
    if (!entries || !entries.length) return
    readAsync(entries)
      .then(({ fakeList, files }) => {
        getMainWindow().webContents.send('BOX_UPLOAD_FAKE_DATA', {
          session, box, success: true, fakeList, raw: { type: 'local', args, entries }
        })
        boxUploadAsync(files, args)
          .then((data) => {
            getMainWindow().webContents.send('BOX_UPLOAD_RESULT', { session, box, success: true, data })
          }).catch((err) => {
            const body = err && err.response && err.response.body
            console.log('box upload error', body || err)
            getMainWindow().webContents.send('BOX_UPLOAD_RESULT', { session, box, success: false })
          })
      }).catch(() => {
        getMainWindow().webContents.send('BOX_UPLOAD_FAKE_DATA', { session, box, success: false })
      })
  })
}

const retryHandle = (event, props) => {
  const { args, entries } = props
  const { session, box } = args
  readAsync(entries, args)
    .then(({ files }) => {
      boxUploadAsync(files, args)
        .then((data) => {
          getMainWindow().webContents.send('BOX_UPLOAD_RESULT', { session, box, success: true, data })
        }).catch((err) => {
          const body = err && err.response && err.response.body
          console.log('box upload error', body || err)
          getMainWindow().webContents.send('BOX_UPLOAD_RESULT', { session, box, success: false })
        })
    }).catch(() => {
      getMainWindow().webContents.send('BOX_UPLOAD_FAKE_DATA', { session, box, success: false })
    })
}

/* ipc listener */
ipcMain.on('BOX_UPLOAD', uploadHandle)
ipcMain.on('BOX_RETRY_UPLOAD', retryHandle)
