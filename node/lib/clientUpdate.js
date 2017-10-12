import fs from 'fs'
import os from 'os'
import path from 'path'
import UUID from 'uuid'
import request from 'superagent'
import store from './store'
import { ftpGet } from './ftp'
import { getMainWindow } from './window'
import { ipcMain, shell, app } from 'electron'

Promise.promisifyAll(fs) // babel would transform Promise to bluebird

const getTmpPath = () => store.getState().config.tmpPath

const checkAsync = async () => {
  console.log('CHECK_UPDATE...')
  const platform = os.platform()
  const type = platform === 'win32' ? 'windows' : 'mac' // mac or windows
  // const type = 'mac'
  const url = `https://api.github.com/repos/wisnuc/wisnuc-desktop-${type}/releases`
  const req = await request.get(url).set('User-Agent': 'request')
  const rels = JSON.parse(req.body)

  const ltsRel = rels.filter(rel => !rel.prerelease)[0]
  const asset = ltsRel.assets.find((item) => {
    const extension = item.name.replace(/.*\./, '')
    return (extension === 'exe' || extension === 'dmg')
  })

  const fileName = asset.browser_download_url.replace(/.*\//, '')
  const filePath = path.join(getTmpPath(), fileName)
  console.log('lts version:', ltsRel.name)
  return { fileName, filePath, rel: ltsRel, url: asset.browser_download_url }
}

const checkUpdateAsync = async () => {
  let data
  try {
    data = await checkAsync()
  } catch (error) {
    return getMainWindow().webContents.send('NEW_RELEASE', { error })
  }
  const { filePath, rel } = data
  try {
    await fs.accessAsync(filePath)
  } catch (error) {
    return getMainWindow().webContents.send('NEW_RELEASE', { rel })
  }
  return getMainWindow().webContents.send('NEW_RELEASE', { filePath, rel })
}

const checkUpdate = () => {
  if (os.platform() !== 'win32' && os.platform() !== 'darwin') return
  checkUpdateAsync().catch(e => console.log(e))
}

const install = (e, filePath) => {
  shell.openItem(filePath)
  setTimeout(() => app.quit(), 100)
}

const download = (url, filePath) => {
  const tmpPath = path.join(getTmpPath(), UUID.v4())
  const options = { method: 'GET', url }
  const stream = fs.createWriteStream(tmpPath)
  const promise = new Promise((resolve, reject) => {
    stream.on('finish', () => {
      fs.rename(tmpPath, filePath, (err) => {
        if (!err) return resolve(filePath)
        return reject()
      })
    })
    stream.on('error', reject)
  })
  stream.on('drain', () => {
    console.log(`Received ${stream.bytesWritten} bytes of data.`)
  })
  const handle = request.get(url).on('error', err => console.error(err))
  handle.pipe(stream)
  return promise
}
const compareVerison = (a, b) => {
  const aArray = a.split('.')
  const bArray = b.split('.')

  const len = Math.min(aArray.length, bArray.length)
  for (let i = 0; i < len; i++) {
    if (parseInt(aArray[i], 10) > parseInt(bArray[i], 10)) return 1
    if (parseInt(aArray[i], 10) < parseInt(bArray[i], 10)) return -1
  }
  if (aArray.length > bArray.length) return 1
  if (aArray.length < bArray.length) return -1
  return 0
}

const downloadAsync = async () => {
  if (os.platform() !== 'win32' && os.platform() !== 'darwin') return
  const { filePath, url, rel, fileName } = await checkAsync()
  console.log('downloadAsync: check release')
  const currVersion = app.getVersion()
  if (compareVerison(currVersion, rel.name) >= 0) return console.log('already latest')
  console.log('downloadAsync: start download...', currVersion, rel.name, compareVerison(currVersion, rel.name) < 0)
  try {
    await fs.accessAsync(filePath)
  } catch (error) {
    console.log('downloadAsync: downloading')
    // await download(url, filePath)
    const tmpPath = path.join(getTmpPath(), `${UUID.v4()}AND${fileName}`)
    const remotePath = `wisnuc_update/download/${fileName}`
    await ftpGet(remotePath, tmpPath, filePath)
  }
  return console.log('downloadAsync: download success')
}

downloadAsync().catch(e => console.error(e))

ipcMain.on('CHECK_UPDATE', checkUpdate)
ipcMain.on('INSTALL_NEW_VERSION', install)
