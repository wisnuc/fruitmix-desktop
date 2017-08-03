const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const xattr = Promise.promisifyAll(require('fs-xattr'))

const FRUITMIX = 'user.fruitmix'

const readXattrAsync = async (target) => {
  let attr
  try {
    attr = JSON.parse(await xattr.getAsync(target, FRUITMIX))
  } catch (e) {
    /* may throw xattr ENOENT or JSON SyntaxError */
    if (e.code === 'ENODATA' || e instanceof SyntaxError) {
      console.log('readXattrAsync ENODATA or SyntaxError')
    } else throw e
  }
  return attr
}

const readXattr = (target, callback) => {
  readXattrAsync.then(attr => callback(null, attr)).catch(error => callback(error))
}

const setXattrAsync = async (target, attr) => {
  const stats = await fs.lstatAsync(target)
  const htime = stats.mtime.getTime()
  const newAttr = Object.assign({}, attr, { htime })
  xattr.setAsync(target, FRUITMIX, JSON.stringify(newAttr))
  return newAttr
}

const setXattr = (target, attr, callback) => {
  setXattrAsync.then(na => callback(null, na)).catch(error => callback(error))
}

export { readXattrAsync, readXattr, setXattrAsync, setXattr }
