import fs from 'fs'
import os from 'os'
import path from 'path'
import UUID from 'uuid'
import request from 'request'
import { ipcMain, shell, app } from 'electron'
import { getMainWindow } from './window'
import store from '../serve/store/store'

Promise.promisifyAll(request) // babel would transform Promise to bluebird
Promise.promisifyAll(fs) // babel would transform Promise to bluebird

const getTmpPath = () => store.getState().config.tmpPath

const checkAsync = async () => {
  console.log('CHECK_UPDATE...')
  const platform = os.platform()
  const type = platform === 'win32' ? 'windows' : 'mac' // mac or windows
  const url = `https://api.github.com/repos/wisnuc/wisnuc-desktop-${type}/releases`
  const req = await request.getAsync({ url, headers: { 'User-Agent': 'request' } })
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
  const handle = request(options).on('error', err => console.error(err))
  handle.pipe(stream)
  return promise
}

const downloadAsync = async () => {
  if (os.platform() !== 'win32' && os.platform() !== 'darwin') return
  const { filePath, url, rel } = await checkAsync()
  console.log('downloadAsync: check release')
  const currVersion = app.getVersion()
  if (rel.name.localeCompare(currVersion) < 0) return
  try {
    await fs.accessAsync(filePath)
  } catch (error) {
    console.log('downloadAsync: downloading')
    await download(url, filePath)
  }
  console.log('downloadAsync: download success')
}

downloadAsync().catch(e => console.error(e))

ipcMain.on('CHECK_UPDATE', checkUpdate)
ipcMain.on('INSTALL_NEW_VERSION', install)
