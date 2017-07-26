const crypto = require('crypto')
const fs = require('fs')
const stream = require('stream')

const env = process.env
let parts = []
const absPath = env.absPath
const allHash = crypto.createHash('sha256')
allHash.setEncoding('hex')

const size = Number(env.size)
const partSize = Number(env.partSize)
parts = splice(size, partSize)

hashFile(0, (err) => {
  if (err) return console.log(err)
  process.send({
    parts,
    hash: allHash.digest('hex')
  })
})


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

function hashFile(index, callback) {
  /* empty file */
  if (!parts.length) {
    parts.push({
      start: 0,
      end: 0,
      sha: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    })
    return callback(null)
  }

  /* all parts finished */
  if (!parts[index]) {
    const fp = calcFingerprint(parts.map(part => part.sha))
    parts.forEach((part, index) => (part.fingerprint = fp[index]))
    return callback(null)
  }
  const part = parts[index]
  const hash = crypto.createHash('sha256')
  hash.setEncoding('hex')
  const fileStream = fs.createReadStream(absPath, { start: part.start, end: part.end })
  fileStream.on('end', (err) => {
    if (err) throw new Error(err)
    hash.end()
    parts[index].sha = hash.read()
    hashFile(++index, callback)
  })

  const t = new stream.Transform({
    transform(chunk, encoding, next) {
      allHash.update(chunk)
      this.push(chunk)
      next()
    }
  })

  fileStream.pipe(t).pipe(hash)
}


function splice(size, partSize) {
  const part = []
  let position = 0
  while (position < size) {
    if (position + partSize >= size) {
      part.push({ start: position, end: size - 1 })
      break
    } else {
      part.push({ start: position, end: position + partSize - 1 })
      position += partSize
    }
  }
  return part
}
