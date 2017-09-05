const Promise = require('bluebird')
const os = require('os')
const fs = Promise.promisifyAll(require('fs'))

const xattr = Promise.promisifyAll(os.platform() === 'win32' ? require('fs-ads') : require('fs-xattr'))

const FRUITMIX = 'user.fruitmix'

const readXattrAsync = async (target) => {
  let attr
  try {
    attr = JSON.parse(await xattr.getAsync(target, FRUITMIX))
  } catch (e) {
    /* may throw xattr ENOENT or JSON SyntaxError */
    // console.log('readXattrAsync error: ', e.code || e)
  }
  const stats = await fs.lstatAsync(target)
  const htime = os.platform() === 'win32' ? stats.atime.getTime() : stats.mtime.getTime()
  if (attr && attr.htime && attr.htime === htime) return attr
  return null
}

const readXattr = (target, callback) => {
  readXattrAsync(target).then(attr => callback(null, attr)).catch(error => callback(error))
}

const setXattrAsync = async (target, attr) => {
  const stats = await fs.lstatAsync(target)
  const htime = os.platform() === 'win32' ? stats.atime.getTime() : stats.mtime.getTime()
  const newAttr = Object.assign({}, attr, { htime })
  try {
    await xattr.setAsync(target, FRUITMIX, JSON.stringify(newAttr))
  } catch (e) {
    // console.log('setXattrAsync error: ', e.code || e)
  }
  return newAttr
}

const setXattr = (target, attr, callback) => {
  setXattrAsync(target, attr).then(na => callback(null, na)).catch(error => callback(error))
}

export { readXattrAsync, readXattr, setXattrAsync, setXattr }
