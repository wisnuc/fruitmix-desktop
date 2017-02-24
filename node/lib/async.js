import fs from 'fs'
import rimraf from 'rimraf'
import mkdirp from 'mkdirp'
import request from 'request'
import validator from 'validator'

import store from '../serve/store/store'

export const rimrafAsync = Promise.promisify(rimraf)
export const mkdirpAsync = Promise.promisify(mkdirp)
export { request }
export const requestAsync = Promise.promisify(request)

Promise.promisifyAll(fs)

export const serverAddr = () => {

  let config = store.getState().config
  if (config && config.ip && typeof config.ip === 'string' && validator.isIP(config.ip, 4)) {
    return config.ip
  }
  return null
}
export { fs }
