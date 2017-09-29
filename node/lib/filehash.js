const crypto = require('crypto')
const fs = require('fs')

/* splice file by given size */
const spliceFile = (size, perSize) => {
  const parts = []
  /* empty file */
  if (size === 0) {
    parts.push({ start: 0, end: 0 })
    return parts
  }
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
  const hashBuffer = hashs.map(hash => (typeof hash === 'string' ? Buffer.from(hash, 'hex') : hash))
  return hashBuffer.reduce((accumulator, currentValue, currentIndex) => {
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

const hashFileAsync = async (absPath, size, partSize) => {
  const parts = spliceFile(size, partSize)
  const promises = parts.map(part => hashFile(absPath, part))
  const hashs = await Promise.all(promises)
  const fp = calcFingerprint(hashs)
  const newParts = parts.map((part, index) => Object.assign({}, part, {
    sha: hashs[index], fingerprint: fp[index] },
    index ? { target: fp[index - 1] } : {}
  ))
  // console.log('hashFileAsync', newParts)
  return newParts
}

const env = process.env

hashFileAsync(env.absPath, Number(env.size), Number(env.partSize))
  .then(parts => process.send({ parts }))
  .catch(error => console.log('hash error', error))
