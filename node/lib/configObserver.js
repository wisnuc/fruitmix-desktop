import path from 'path'
import fs from 'fs'
import UUID from 'uuid'
import { app } from 'electron'
import store from '../serve/store/store'

let prevConfig

const configObserver = () => {
  if (store.getState().config === prevConfig) { return }

  prevConfig = store.getState().config
  console.log('update config !')

  // temp file
  // write to temp file
  // rename
  const appDataPath = app.getPath('appData')
  const configRootPath = path.join(appDataPath, 'wisnuc')
  const tmpfile = path.join(configRootPath, UUID.v4())

  const os = fs.createWriteStream(tmpfile)
  os.on('close', () => fs.rename(tmpfile, path.join(configRootPath, 'config.json'), (e) => { if (e) { console.error(e) } }))
  os.on('err', (err) => {
    console.log('[config] failed to save config to disk')
    console.log(err)
  })
  os.write(JSON.stringify(store.getState().config))
  os.end()
}

export default configObserver
