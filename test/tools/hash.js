/*
 * usage: node hash.js fileToHash
 */
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const file = path.resolve(process.argv[2])
const rs = fs.createReadStream(file, { highWaterMark: 4194304 })

const start = (new Date()).getTime()
const hash = crypto.createHash('sha256').setEncoding('hex')
const size = fs.lstatSync(file).size

rs.on('end', () => {
  hash.end()
  console.log('file: ', file, '\nsize: ', size, 'B\ntime: ', (new Date()).getTime() - start, 'ms\nhash: ', hash.read())
})

rs.pipe(hash)
