/*
 * usage: node hash.js fileToHash
 */
const fs = require('fs')
const path = require('path')
const { fileMagic } = require('../node/lib/magic')

const file = path.resolve(process.argv[2])

const start = (new Date()).getTime()

fileMagic(file, (err, type) => {
  console.log('finished', (new Date()).getTime() - start, 'ms')
  console.log('type', type)
})
