/*
 * usage: node hash.js fileToHash
 */
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const file = path.resolve(process.argv[2])
const data = fs.readFileSync(file)
const size = fs.lstatSync(file).size
const hash = crypto.createHash('sha256').setEncoding('hex')
const start = (new Date()).getTime()
hash.update(data)

hash.end()
console.log('file: ', file, '\nsize: ', size, 'B\ntime: ', (new Date()).getTime() - start, 'ms\nhash: ', hash.read())
