const os = require('os')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))

const xattr = Promise.promisifyAll(os.platform() === 'win32' ? require('fs-ads') : require('fs-xattr')) // eslint-disable-line

const FRUITMIX = 'user.fruitmix3'

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
  if (attr && attr.htime && attr.htime === htime && attr.size === stats.size) return attr
  return null
}

const readXattr = (target, callback) => {
  readXattrAsync(target).then(attr => callback(null, attr)).catch(error => callback(error))
}

const setXattrAsync = async (target, attr) => {
  const stats = await fs.lstatAsync(target)
  const htime = os.platform() === 'win32' ? stats.atime.getTime() : stats.mtime.getTime()
  const size = stats.size
  const newAttr = Object.assign({}, attr, { htime, size })
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

module.exports = { readXattrAsync, readXattr, setXattrAsync, setXattr }
