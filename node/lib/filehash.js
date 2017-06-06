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


function hashFile(index, callback) {
  if (!parts[index]) return callback(null)
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
