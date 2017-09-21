const fs = require('fs')
const crypto = require('crypto')
const Worker = require('./worker')
const { uploadFileWithStreamAsync, createFoldAsync } = require('./server')

class HashFileTask extends Worker {
  constructor(filePath, stat) {
    super(filePath, stat)
    this.filePath = filePath
    this.stat = stat

    /* splice file by given size */
    this.spliceFile = (size, perSize) => {
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
    this.hashFile = (currPath, part) => {
      const hash = crypto.createHash('sha256')
      hash.setEncoding('hex')
      const fileStream = fs.createReadStream(currPath, { start: part.start, end: part.end })
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
    this.calcFingerprint = (hashs) => {
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
  }

  run() {
    this.hash().then(parts => this.finish(parts)).catch(e => this.error(e))
  }

  async hash() {
    const parts = this.spliceFile(this.stat.size, 1024 * 1024 * 1024)
    const promises = parts.map(part => this.hashFile(this.filePath, part))
    const hashs = await Promise.all(promises)
    const fp = this.calcFingerprint(hashs)
    const newParts = parts.map((part, index) => Object.assign({}, part, { sha: hashs[index], fingerprint: fp[index] }))
    return newParts
  }

  cleanUp() {
    // TODO
  }
}

class UploadFileTask extends Worker {
  constructor(dirUUID, driveUUID, name, parts, readStreams) {
    super(dirUUID, driveUUID, name, parts, readStreams)
    this.dirUUID = dirUUID
    this.driveUUID = driveUUID
    this.name = name
    this.parts = parts
    this.readStreams = readStreams
  }

  run() {
    this.upload().then(() => this.finish()).catch(e => this.error(e))
  }

  async upload() {
    for (let i = 0; i < this.parts.length; i++) {
      await uploadFileWithStreamAsync(this.driveUUID, this.dirUUID, this.name, this.parts[i], this.readStreams[i])
    }
  }

  cleanUp() {
    // TODO
  }
}

class CreateFoldTask extends Worker {
  constructor(driveUUID, dirUUID, dirname) {
    super(driveUUID, dirUUID, dirname)
    this.driveUUID = driveUUID
    this.dirUUID = dirUUID
    this.dirname = dirname
  }

  run() {
    this.createFold().then(uuid => this.finish(uuid)).catch(e => this.error(e))
  }

  async createFold() {
    const entries = await createFoldAsync(this.driveUUID, this.dirUUID, this.dirname)
    if (!entries) return null
    const uuid = entries.find(entry => entry.name === this.dirname).uuid
    return uuid
  }
}

export { UploadFileTask, CreateFoldTask, HashFileTask }
