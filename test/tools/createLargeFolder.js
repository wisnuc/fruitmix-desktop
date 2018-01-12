/*
 * usage: node createLargeFolder.js folderName fileNumber
 */

const path = require('path')
const fs = require('fs')

if (!process.argv[2]) {
  console.log('Please give a folder name !')
  process.exit()
}

const start = (new Date()).getTime()
const filePath = path.resolve(process.argv[2])

const fileNumber = parseInt(process.argv[3], 10) || Math.round(Math.random() * 1024)

fs.mkdirSync(filePath)

for (let i = 0; i < fileNumber; i++) {
  fs.writeFileSync(path.join(filePath, `file-${i}.txt`), Buffer.alloc(Math.round(Math.random() * 64)))
}

console.log('Folder created successfully')
console.log('Folder path:', filePath)
console.log('File numner:', fileNumber)
console.log('Time:', (new Date()).getTime() - start, 'ms')
process.exit()
