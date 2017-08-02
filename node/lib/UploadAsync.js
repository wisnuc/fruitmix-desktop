const fs = require('fs')
const path = require('path')
const { createFoldAsync, uploadFileWithStreamAsync } = require('./server')
const crypto = require('crypto')

Promise.promisifyAll(fs) // babel would transform Promise to bluebird

/* return a new file name */
const getName = async (currPath, dirUUID, driveUUID) => {
  return currPath.replace(/^.*\//, '') // TODO
}

/* splice file by given size */
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

/* calculate file's hash by part */
const hashFile = (filePath, part) => {
  const hash = crypto.createHash('sha256')
  hash.setEncoding('hex')
  const fileStream = fs.createReadStream(filePath, { start: part.start, end: part.end })
  const promise = new Promise((resolve, reject) => {
    fileStream.on('end', () => {
      hash.end()
      resolve(hash.read())
    })
    fileStream.on('error', reject)
  })
  fileStream.pipe(hash)
  return promise
}

/* calculate file's fingerprint */
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
    return accumulator
  }, [])
}

/* spliceFile -> hashFile -> calcFingerprint -> upload */
const uploadFileAsync = async (filePath, dirUUID, driveUUID, stat) => {
  // console.log('uploadFileAsync', filePath, dirUUID, driveUUID, stat.size)
  const parts = spliceFile(stat.size, 1024 * 1024 * 1024)

  const promises = parts.map(part => hashFile(filePath, part))
  const hashs = await Promise.all(promises)
  const fp = calcFingerprint(hashs)
  const newParts = parts.map((part, index) => Object.assign({}, part, { sha: hashs[index], fingerprint: fp[index] }))

  const name = await getName(filePath, dirUUID, driveUUID)
  const readStreams = newParts.map(part => fs.createReadStream(filePath, { start: part.start, end: part.end, autoClose: true }))
  console.log('start upload file: ', name, 'size', stat.size)
  for (let i = 0; i < newParts.length; i++) {
    await uploadFileWithStreamAsync(driveUUID, dirUUID, name, newParts[i], readStreams[i])
  }
}

/* create fold and return the uuid */
const creatFoldAsync = async (foldPath, dirUUID, driveUUID) => {
  const dirname = await getName(foldPath, dirUUID, driveUUID)
  const entries = await createFoldAsync(driveUUID, dirUUID, dirname)
  if (!entries) return null
  const uuid = entries.find(entry => entry.name === dirname).uuid
  console.log('creatFoldAsync success uuid: ', uuid)
  return uuid
}

/* readUploadInfo would visit list of directories or files recursively */
const readUploadInfo = async (entries, dirUUID, driveUUID) => {
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const stat = await fs.lstatAsync(path.resolve(entry))
    if (stat.isDirectory()) {
      const children = await fs.readdirAsync(path.resolve(entry))
      const uuid = await creatFoldAsync(entry, dirUUID, driveUUID)
      const newEntries = []
      children.forEach(c => newEntries.push(path.join(entry, c)))
      await readUploadInfo(newEntries, uuid, driveUUID)
    } else {
      await uploadFileAsync(entry, dirUUID, driveUUID, stat)
    }
  }
}

export { readUploadInfo }
