/*
 * usage: node createFile.js fileName size
 */

const path = require('path')
const fs = require('fs')

if (!process.argv[2]) {
  console.log('Please give a file name !')
  process.exit()
}

const start = (new Date()).getTime()
const filePath = path.resolve(process.argv[2])
const size = parseInt(process.argv[3], 10) || Math.round(Math.random() * 1024 * 1024)

const highWaterMark = 1024 * 1024 * 16
const num = Math.floor(size / highWaterMark)

const segment = Buffer.alloc(highWaterMark)
const left = Buffer.alloc(size % highWaterMark)

fs.writeFileSync(filePath, segment, { flag: 'w' })

for(let i = 0; i < num - 1; i++) {
  fs.writeFileSync(filePath, segment, { flag: 'a' })
}

fs.writeFileSync(filePath, left, { flag: 'a' })

console.log('File created successfully')
console.log('File path:', filePath)
console.log('File size:', size)
console.log('Time:', (new Date()).getTime() - start, 'ms')
process.exit()
