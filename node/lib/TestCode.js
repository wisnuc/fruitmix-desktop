import fs from 'fs'
import crypto from 'crypto'
import request from 'request'

import store from '../serve/store/store'

const partSize = 1073741824

/* init request */
let server
let tokenObj
let Authorization
const initArgs = () => {
  server = `http://${store.getState().login.device.mdev.address}:3000`
  tokenObj = store.getState().login.device.token.data
  Authorization = `${tokenObj.type} ${tokenObj.token}`
}

/**
Upload a single file using request formData

@param {string} driveUUID
@param {string} dirUUID
@param {string} path
@param {object} part
@param {string} part.start
@param {string} part.end
@param {string} part.sha
@param {string} part.fingerpringt
@param {function} callback
*/
const uploadFile = (driveUUID, dirUUID, path, part, callback) => {
  initArgs()
  const name = path.replace(/.*\//, '')
  let formDataOptions = {
    size: part.end - part.start + 1,
    sha256: part.sha
  }
  if (part.start) formDataOptions = Object.assign(formDataOptions, { append: part.fingerprint })

  const op = {
    url: `${server}/drives/${driveUUID}/dirs/${dirUUID}/entries`,
    headers: { Authorization },
    formData: {
      [name]: {
        value: fs.createReadStream(path, { start: part.start, end: part.end }),
        options: JSON.stringify(formDataOptions)
      }
    }
  }
  console.log(`>>>>>>>>>>>uploadFile part from ${part.start} to ${part.end} op`)
  console.log(op)
  console.log('=========== part')
  console.log(part)
  console.log('<<<<<<<<<<< start')
  request.post(op, (error, data) => {
    if (error) {
      console.log('error', error)
    } else {
      console.log(`uploadFile part from ${part.start} to ${part.end} success`)
      if (callback) callback()
    }
  })
}

const spliceFile = (size, perSize) => {
  const parts = []
  let position = 0
  while (position < size) {
    if (position + perSize >= size) {
      parts.push({ start: position, end: size - 1 })
      break
    } else {
      parts.push({ start: position, end: position + perSize - 1 })
      position += perSize
    }
  }
  return parts
}


const calcFingerprint = (hashs) => {
  const hashBuffer = hashs.map(hash => typeof hash === 'string' ? Buffer.from(hash, 'hex') : hash)

  return hashBuffer.reduce((accumulator, currentValue, currentIndex, array) => {
    if (!currentIndex) {
      accumulator.push(currentValue.toString('hex'))
    } else {
      const hash = crypto.createHash('sha256')
      hash.update(Buffer.from(accumulator[currentIndex - 1], 'hex'))
      hash.update(currentValue)
      const digest = hash.digest('hex')
      accumulator.push(digest)
    }
    // console.log(accumulator)
    return accumulator
  }, [])
}

const uploadAsync = async (driveUUID, dirUUID, path, parts) => {
  try {
    for (const part of parts) {
      await Promise.promisify(uploadFile)(driveUUID, dirUUID, path, part).asCallback(() => {})
    }
  } catch (error) {
    console.log('uploadAsync', error)
  }
}

const uploadBigFile = (driveUUID, dirUUID, path, size, parts) => {
  // console.log('uploadBigFile', parts)
  const fp = calcFingerprint(parts.map(part => part.sha))
  // console.log('uploadBigFile fp', fp)
  parts.forEach((part, index) => (part.fingerprint = fp[index]))

  uploadAsync(driveUUID, dirUUID, path, parts).asCallback(() => {
    console.log('!!!!!!!!!!!!!!uploadBigFile all success!!!!!!!!!!!')
  })
}

/* hash File*/
let hashCount = 0
let parts = []
const hashPart = (driveUUID, dirUUID, path, size, part) => {
  const hash = crypto.createHash('sha256')
  hash.setEncoding('hex')
  const fileStream = fs.createReadStream(path, { start: part.start, end: part.end })
  fileStream.on('end', (err) => {
    if (err) throw new Error(err)
    hash.end()
    part.sha = hash.read()
    console.log(`createReadStream ${path} part: ${Math.ceil(part.end / 1024 / 1024 / 1024)} end, hash: ${part.sha}`)
    hashCount -= 1
    if (hashCount < 1) {
      console.log(`finish hash ${path}`)
      uploadBigFile(driveUUID, dirUUID, path, size, parts)
    }
  })
  fileStream.pipe(hash)
}

const hashFile = (driveUUID, dirUUID, path, size) => {
  console.log('start hash file', path)
  const startTime = new Date()
  const hash = crypto.createHash('sha256')
  hash.setEncoding('hex')
  let fileStream
  if (size < partSize) {
    fileStream = fs.createReadStream(path)
    fileStream.on('end', (err) => {
      if (err) throw new Error(err)
      console.log('createReadStream end')
      hash.end()
      console.log(`hash ${path} cost time: ${new Date() - startTime} ms`)
      const sha = hash.read()
      const part = {
        start: 0,
        end: size - 1,
        sha,
        fingerprint: sha
      }
      uploadFile(driveUUID, dirUUID, path, part)
    })
    fileStream.pipe(hash)
  } else {
    parts = spliceFile(size, partSize)
    hashCount = parts.length
    parts.forEach((part, index) => {
      hashPart(driveUUID, dirUUID, path, size, part)
    })
    // console.log(`hash ${path} cost time: ${new Date() - startTime} ms`)
    return console.log('parts', parts)
  }
}

/* get file size by fs.stat */
const getFileInfo = (driveUUID, dirUUID, path) => {
  fs.stat(path, (error, stat) => {
    if (error) {
      console.log(error)
    } else {
      console.log('getFileInfo success size', stat.size)
      hashFile(driveUUID, dirUUID, path, stat.size)
    }
  })
}


/**
Upload a single file using request formData

@param {string} driveUUID
@param {string} dirUUID
@param {string} name
@param {object} part
@param {string} part.start
@param {string} part.end
@param {string} part.sha
@param {string} part.fingerpringt
@param {object} readStream
@param {function} callback
*/
const uploadFileWithStream = (driveUUID, dirUUID, name, part, readStream, callback) => {
  initArgs()
  let formDataOptions = {
    size: part.end ? part.end - part.start + 1 : 0,
    sha256: part.sha
  }
  if (part.start) formDataOptions = Object.assign(formDataOptions, { append: part.fingerprint })

  const op = {
    url: `${server}/drives/${driveUUID}/dirs/${dirUUID}/entries`,
    headers: { Authorization },
    formData: {
      [name]: {
        value: readStream,
        options: JSON.stringify(formDataOptions)
      }
    }
  }
  /*
  console.log(`>>>>>>>>>>>uploadFile part from ${part.start} to ${part.end} op`)
  console.log(op)
  console.log('=========== part')
  console.log(part)
  console.log('<<<<<<<<<<< start')
  */
  request.post(op, (error, data) => {
    if (error) {
      console.log('error', error)
    } else {
      console.log(`uploadFile part from ${part.start} to ${part.end} success`)
      if (callback) callback()
    }
  })
}


/**
createFold

@param {string} driveUUID
@param {string} dirUUID
@param {string} dirname
@param {function} callback
*/
const createFold = (driveUUID, dirUUID, dirname, callback) => {
  initArgs()

  const op = {
    url: `${server}/drives/${driveUUID}/dirs/${dirUUID}/entries`,
    headers: { Authorization },
    formData: {
      [dirname]: JSON.stringify({ op: 'mkdir' })
    }
  }

  const op2 = {
    url: `${server}/drives/${driveUUID}/dirs/${dirUUID}`,
    headers: { Authorization }
  }
  console.log('>>>>>>>>>>>create Fold')
  console.log(op)
  console.log('<<<<<<<<<<< start')
  request.post(op, (error) => {
    if (error) {
      console.log('error', error)
      if (callback) callback(error)
    } else {
      request.get(op2, (err, data) => {
        if (err) {
          if (callback) callback(err)
          console.log('error', data)
        } else {
          console.log(`create Fold ${dirname} success`)
          if (callback) callback(err, JSON.parse(data.body).entries)
        }
      })
    }
  })
}

// fork / join, race / settle

// input dir path
// output stat []

const readdir = (dirPath, callback) => {
  fs.readdir(dirPath, (err, entries) => {
    if (err) return callback(err)
    if (entries.length === 0) return callback(null, [])

    let count = entries.length
    const arr = []
    entries.forEach((entry) => { // functor
      fs.lstat(path.join(dirPath, entry), (err, stat) => {
        if (!err) arr.push(stat)
        if (!--count) return callback(null, arr)
      })
    })
  })
}

// error race | success settle []

const readdirStatsAsync = async (dirPath) => {
  const entries = fs.readdirAsync(dirPath)
  if (entries.length === 0) return []

  const promises = entries.map(async (entry) => {
    try {
      const entryPath = path.join(dirPath, entry)
      const stat = await fs.lstatAsync(path.join(dirPath, entry))

      if (stat.isDirectory()) {
        return Object.assign(stat, { children: await readdirStatsAsync(entryPath) })
      }
      return stat
    } catch (e) {
      return null
    }
  })

  return (await Promise.all(promises)).filter(x => !!x)
}

const visitor = async (root, afunc) => {
  await func(root)

  if (root.children) {
    Promise.map(root.children, async (child) => {})

    root.children.map(async x => visitor(x, func))
  }

  if (root.children) {
    for (let i = 0; i < root.children.length; i++) {
      await visitor(root.children[i], afunc)
    }
  }
}

export { uploadFile, hashFile, getFileInfo, uploadFileWithStream, createFold }
