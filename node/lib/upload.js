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
@param {number} size
@param {string} hash
*/
const uploadFile = (driveUUID, dirUUID, path, size, hash, callback) => {
  initArgs()
  const name = path.replace(/.*\//, '')
  const op = {
    url: `${server}/drives/${driveUUID}/dirs/${dirUUID}/entries`,
    headers: { Authorization },
    formData: {
      [name]: {
        value: fs.createReadStream(path),
        options: JSON.stringify({
          size,
          sha256: hash
        })
      }
    }
  }
  console.log(op)
  request.post(op, (error, data) => {
    if (error) {
      console.log('error', error)
    } else {
      console.log('upload success: ', name)
      callback()
    }
  })
}

const appendFile = (driveUUID, dirUUID, path, size, hash, fingerprint) => {
  initArgs()
  const name = path.replace(/.*\//, '')
  const op = {
    url: `${server}/drives/${driveUUID}/dirs/${dirUUID}/entries`,
    headers: { Authorization },
    formData: {
      [name]: {
        value: fs.createReadStream(path),
        options: JSON.stringify({
          size,
          sha256: hash,
          append: fingerprint
        })
      }
    }
  }
  console.log(op)
  request.post(op, (error, data) => {
    if (error) {
      console.log('error', error)
    } else {
      console.log('upload success: ', name)
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


const combineHash = (a, b) => {
  let a1 = typeof a === 'string'
    ? Buffer.from(a, 'hex')
    : a

  let b1 = typeof b === 'string'
    ? Buffer.from(b, 'hex')
    : b

  let hash = crypto.createHash('sha256')
  hash.update(a1)
  hash.update(b1)

  let digest = hash.digest('hex')
  console.log('combined digest', digest)
  return digest
}

const uploadBigFile = (driveUUID, dirUUID, path, size, parts) => {
  parts.map((part, index, array) => {
    if (!index) return (part.fingerprint = part.sha)
    const lastfp = array[index - 1].fingerprint
    part.fingerprint = combineHash(lastfp, part.sha)
  })

  uploadFile(driveUUID, dirUUID, path, partSize, parts[0].fingerprint, () => {
    appendFile(driveUUID, dirUUID, path, size - partSize, parts[1].fingerprint)
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
      uploadFile(driveUUID, dirUUID, path, size, hash.read())
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

export { uploadFile, hashFile, getFileInfo }
