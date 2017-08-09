import fs from 'fs'
import path from 'path'
import UUID from 'uuid'
import request from 'request'
import { dialog, ipcMain, shell } from 'electron'
import { getMainWindow } from './window'
import store from '../serve/store/store'

// https://github.com/wisnuc/wisnuc-desktop-mac/releases/download/v1.1.4/wisnuc-1.1.4.dmg
const getTmpPath = () => store.getState().config.tmpPath

const download = (url, callback) => {
  const fileName = url.replace(/.*\//, '')
  const filePath = path.join(getTmpPath(), fileName)
  const tmpPath = path.join(getTmpPath(), UUID.v4())

  fs.access(filePath, (error) => {
    if (!error) {
      console.log('find file', fileName)
      return callback(null, filePath)
    }
    console.log('no file', fileName)
    const options = {
      method: 'GET',
      url
    }

    const stream = fs.createWriteStream(tmpPath)
    stream.on('finish', () => {
      fs.rename(tmpPath, filePath, (err) => {
        if (err) return callback(err)
        return callback(null, filePath)
      })
    })
    stream.on('drain', () => {
      console.log(`Received ${stream.bytesWritten} bytes of data.`)
    })

    const handle = request(options).on('error', err => callback(err))
    handle.pipe(stream)
  })
}

ipcMain.on('CHECK_UPDATE', (e, url) => {
  console.log('CHECK_UPDATE', url)
  download(url, (error, filePath) => getMainWindow().webContents.send('RELEASE_PATH', filePath))
})
