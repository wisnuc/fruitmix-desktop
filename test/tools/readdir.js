const path = require('path')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const prettySize = require('prettysize')

let dirCount = 0
let fileCount = 0
let totalSize = 0
const startTime = new Date().getTime()

const readdirAsync = async (entries) => {
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    let stat
    try {
      stat = await fs.lstatAsync(path.resolve(entry))
    } catch (e) {
      continue
    }
    if (!stat) continue
    if (stat.isDirectory()) {
      dirCount += 1
      const dirs = await fs.readdirAsync(entry)
      await readdirAsync(dirs.map(e => path.join(entry, e)))
    } else if (stat.isFile()) {
      fileCount += 1
      totalSize += stat.size
    }
  }
}

const dir = path.resolve(process.argv[2])

readdirAsync([dir])
  .then(() => console.log(
    `finished in ${new Date().getTime() - startTime} ms\n`,
    'dirCount\tfileCount\tsize\n',
    `${dirCount}\t\t${fileCount}\t\t${prettySize(totalSize)}`
  ))
  .catch(e => console.error('error: ', e))
