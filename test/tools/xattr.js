/*
 * Get xattr
 * usage: ../../node_modules/.bin/electron xattr.js filePath
 */

const path = require('path')
const fs = require('fs')
const { readXattrAsync, readXattr, setXattrAsync, setXattr } = require('../../build/lib/xattr.js')

const file = path.resolve(process.argv[2])
console.log('file path: ', file)
console.log('stats: ', fs.lstatSync(file))

readXattrAsync(file).then(data => console.log('Get xattr:\n', data)).catch(e => console.log('Error:\n', e))
setTimeout(() => process.exit(), 1000)
