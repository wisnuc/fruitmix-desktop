/*
 * usage: node sanitize.js filename
 */
const sanitize = require('sanitize-filename')

const filename = process.argv[2]
const sanitized = sanitize(filename)

console.log('filename:', filename, '\n')
console.log('sanitized:', sanitized, '\n')
console.log('is valid ?', filename === sanitized ? 'Yes' : 'No')
