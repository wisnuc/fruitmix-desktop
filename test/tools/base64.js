/*
 * usage: node buffer.js string
 */

const string = process.argv[2]

const decode = (s) => new Buffer(string, 'base64').toString()
const encode = (s) => new Buffer(s).toString('base64')
console.log('string:', string), '\n'
console.log('decode:', decode(string))
console.log('encode:', encode(string))
