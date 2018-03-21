const fs = require('fs')
const i18n = require('i18n')
const path = require('path')
const UUID = require('uuid')
const store = require('./store')
const { getMainWindow } = require('./window')
const { ipcMain, shell } = require('electron')
const { downloadFile } = require('./server')
const { createTask } = require('./downloadTransform')

const getDownloadPath = () => store.getState().config.downloadPath

const downloadHandle = (event, args) => {
  const { entries, dirUUID, driveUUID } = args
  const taskUUID = UUID.v4()
  const taskType = entries[0].type
  const createTime = (new Date()).getTime()
  const newWork = true

  const downloadPath = getDownloadPath()
  fs.readdir(downloadPath, (err, files) => {
    if (err) {
      console.log('downloadHandle fs.readdir error: ', err)
      getMainWindow().webContents.send('snackbarMessage', { message: i18n.__('Read Download Failed') })
    } else {
      entries.forEach((entry) => {
        const name = entry.name
        let newName = name
        if (files.includes(name)) {
          const nameSpace = entries.map(e => e.name)
          nameSpace.push(...files)
          const extension = path.parse(name).ext
          for (let i = 1; nameSpace.includes(newName) || nameSpace.includes(`${newName}.download`); i++) {
            if (!extension || extension === name) {
              newName = `${name}(${i})`
            } else {
              newName = `${path.parse(name).name}(${i})${extension}`
            }
          }
        }
        entry.newName = newName
      })
      createTask(taskUUID, entries, entries[0].newName, dirUUID, driveUUID, taskType, createTime, newWork, downloadPath)
      getMainWindow().webContents.send('snackbarMessage', { message: i18n.__('%s Add to Transfer List', entries.length) })
    }
  })
}

/* args: { driveUUID, dirUUID, entryUUID, fileName, station } */
const openHandle = (event, args) => {
  downloadFile(args, null, (error, filePath) => {
    if (error) console.log('open file error', error)
    else shell.openItem(filePath)
  })
}

/* args: { driveUUID, dirUUID, entryUUID, fileName, session, station } */
const tempDownloadHandle = (e, args) => {
  const { session } = args
  downloadFile(args, null, (error, filePath) => {
    if (error) console.log('temp Download error', error)
    else getMainWindow().webContents.send('TEMP_DOWNLOAD_SUCCESS', session, filePath)
  })
}

const getTextDataHandle = (e, args) => {
  const { session } = args
  downloadFile(args, null, (error, filePath) => {
    if (error) console.log('getTextDataHandle error', error)
    else {
      fs.readFile(filePath, (err, data) => {
        if (err) console.log('getTextData readFile error', err)
        else getMainWindow().webContents.send('GET_TEXT_DATA_SUCCESS', session, { filePath, data: data.toString() })
      })
    }
  })
}

const startTransmissionHandle = () => {
  global.DB.loadAll((error, tasks) => {
    if (error) console.error('load db store error', error)
    else {
      /* add t to load pre status */
      tasks.forEach(t => t.state !== 'finished' && t.trsType === 'download' &&
        createTask(t.uuid, t.entries, t.name, t.dirUUID, t.driveUUID, t.taskType, t.createTime, false, t.downloadPath, t))
    }
  })
}

ipcMain.on('DOWNLOAD', downloadHandle)
ipcMain.on('TEMP_DOWNLOADING', tempDownloadHandle)
ipcMain.on('OPEN_FILE', openHandle) // open file use system applications
ipcMain.on('GET_TEXT_DATA', getTextDataHandle)
ipcMain.on('START_TRANSMISSION', startTransmissionHandle)
