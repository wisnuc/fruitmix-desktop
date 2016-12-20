import path from 'path'
import fs from 'fs'
import UUID from 'node-uuid'
import store from '../serve/store/store'

let prevConfig

const configObserver = () => {

  if (store.getState().config === prevConfig)
    return
 
  prevConfig = store.getState().config 

  // temp file    
  // write to temp file
  // rename
  let tmpfile = path.join(tmpPath, UUID.v4())
  let os = fs.createWriteStream(tmpfile)
  os.on('close', () => fs.rename(tmpfile, path.join(tmpPath, 'server')))
  os.on('err', err => {
    console.log('[config] failed to save config to disk')
    console.log(err)
  })
  os.write(JSON.stringify(store.getState().config))
  os.end()
}

export default configObserver
