const Promise = require('bluebird')
const os = require('os')
const fs = Promise.promisifyAll(require('fs'))

const FRUITMIX = 'user.fruitmix'

let xattr
try {
  if (os.platform() === 'linux' || os.platform() === 'darwin') {
    // console.log('os.platform', os.platform())
    xattr = Promise.promisifyAll(require('fs-xattr'))
  } else if (os.platform() === 'win32') {
    xattr = {
      getAsync: async (target, string) => {
        const data = await fs.readFileAsync(`${target}:${string}`, { encoding: 'utf-8' })
        console.log('read xattr', data)
        return data
      },
      setAsync: async (target, string, attr) => {
        await fs.writeFileAsync(`${target}:${string}`, attr)
      }
    }
  }
} catch (e) {
  console.log('load fs.xattr error', e)
}

const readXattrAsync = async (target) => {
  let attr
  try {
    attr = JSON.parse(await xattr.getAsync(target, FRUITMIX))
  } catch (e) {
    /* may throw xattr ENOENT or JSON SyntaxError */
    console.log('readXattrAsync error: ', e.code || e)
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
    console.log('setXattrAsync error: ', e.code || e)
  }
  return newAttr
}

const setXattr = (target, attr, callback) => {
  setXattrAsync(target, attr).then(na => callback(null, na)).catch(error => callback(error))
}

export { readXattrAsync, readXattr, setXattrAsync, setXattr }
