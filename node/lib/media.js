/* import core module */
import path from 'path'
import fs from 'fs'
import Debug from 'debug'
import { ipcMain } from 'electron'
/* import file module */
import { serverGetAsync, serverPostAsync, serverPatchAsync, serverDeleteAsync, serverDownloadAsync } from './server'
import action from '../serve/action/action'
import store from '../serve/store/store'
import { getMainWindow } from './window'

/* init */
const debug = Debug('lib:media')
let media=[]

/* functions */
const parseDate = (date) => {
  if (!date) return 0
  const b = date.split(/\D/)
  const c = (`${b[0]}${b[1]}${b[2]}${b[3]}${b[4]}${b[5]}`)
  return parseInt(c, 10)
}

const getThumb = (digest, cacheName, mediaPath, session) => {
  const qs = {
    width: 210,
    height: 210,
    autoOrient: true,
    modifier: 'caret'
  }
  serverDownloadAsync(`media/${digest}/thumbnail`, qs, mediaPath, digest + cacheName).then((data) => {
    getMainWindow().webContents.send('getThumbSuccess', session, path.join(mediaPath, `${digest}thumb210`))
  }).catch((err) => {
    // console.log(err)
    console.log(`fail download of digest:${digest} of session: ${session} err: ${err}`)
    // setTimeout(() => getThumb(digest, cacheName, mediaPath, session), 2000)
  })
}

/* getMediaData */
ipcMain.on('getMediaData', (event) => {
  serverGetAsync('media').then((data) => {
    media = data
    media.sort((prev, next) => (parseDate(next.exifDateTime) - parseDate(prev.exifDateTime)) || (
      parseInt(`0x${next.digest}`, 16) - parseInt(`0x${prev.digest}`, 16)))
    dispatch(action.setMedia(media))
  }).catch((err) => {
    console.log(err)
  })
})

/* getMediaImage */
ipcMain.on('getMediaImage', (event, session, hash) => {
  fs.stat(path.join(mediaPath, hash), (err, data) => {
    if (err) {
      serverDownloadAsync(`media/${hash}/download`, null, mediaPath, hash).then((data) => {
        getMainWindow().webContents.send('donwloadMediaSuccess', session, path.join(mediaPath, hash))
      })
    } else {
      getMainWindow().webContents.send('donwloadMediaSuccess', session, path.join(mediaPath, hash))
    }
  })
})

/* getThumbnail */
ipcMain.on('getThumb', (event, session, digest) => {
  const cacheName = 'thumb210'
  fs.stat(path.join(mediaPath, digest + cacheName), (err, data) => {
    if (err) {
      getThumb(digest, cacheName, mediaPath, session)
    } else {
      getMainWindow().webContents.send('getThumbSuccess', session, path.join(mediaPath, `${digest}thumb210`))
    }
  })
})
