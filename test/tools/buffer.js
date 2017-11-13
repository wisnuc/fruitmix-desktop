/*
 * usage: node buffer.js file
 */
const fs = require('fs')
const path = require('path')

const file = path.resolve(process.argv[2])
const rs = fs.createReadStream(file)

const dataArr = []
let len = 0

const start = (new Date()).getTime()

rs.on('data', (chunk) => {
  dataArr.push(chunk)
  len += chunk.length
})

rs.on('end', () => {
  const buffer = Buffer.concat(dataArr, len)
  console.log('file: ', file, '\ntime: ', (new Date()).getTime() - start, 'ms')
  console.log('string: ', buffer.toString(), '\nbuffer: ', buffer, '\nbase64: ', buffer.toString('base64'))
})
