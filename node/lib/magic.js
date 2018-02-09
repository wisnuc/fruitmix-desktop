const fs = require('fs')
const Promise = require('bluebird')
const fileType = require('file-type')
const readChunk = require('read-chunk')

/* @constant {number} MAGICVER - bump version for magic */
const MAGICVER = 2
const allMagics = ['JPEG', 'PNG', 'GIF', '3GP', 'MP4', 'MOV']

const getFileType = (fpath, callback) =>
  readChunk(fpath, 0, 4100)
    .then(buf => callback(null, fileType(buf)))
    .catch(e => callback(e))

const fileMagic = (target, callback) =>
  getFileType(target, (err, type) => {
    console.log('fileMagic', err, type)
    if (err) callback(null, 0)
    let ext = (type && type.ext && type.ext.toUpperCase()) || 0
    if (ext === 'JPG') ext = 'JPEG'
    if (!allMagics.includes(ext)) ext = 0
    callback(null, ext)
  })

const fileMagicAsync = Promise.promisify(fileMagic)

/**
Parse file magic from libmagic/file string
@func parse
@param {string} text
@returns {(string|number)}
*/
const parse = text => {
  if (text.startsWith('JPEG image data')) {
    return 'JPEG'
  } else if (text.startsWith('PNG image data')) {
    return 'PNG'
  } else if (text.startsWith('GIF image data')) {
    return 'GIF'
  } else if (text.startsWith('ISO Media, MPEG v4 system, 3GPP')) {
    return '3GP'
  } else if (text.startsWith('ISO Media, MP4 v2 [ISO 14496-14]')) {
    return 'MP4'
  } else if (text.startsWith('ISO Media, Apple QuickTime movie, Apple QuickTime (.MOV/QT)')) {
    return 'MOV'
  } else {
    return MAGICVER
  }
}

const isValidMagic = magic => 
  allMagics.includes(magic) ||
  (Number.isInteger(magic) && magic >= MAGICVER)

/** media **/
const isStaticImage = magic => magic === 'JPEG' || magic === 'PNG'
const isAnimation = magic => magic === 'GIF'
const isImage = magic => isStaticImage(magic) || isAnimation(magic)
const isVideo = magic => magic === '3GP' || magic === 'MP4' || magic === 'MOV'
const isMedia = magic => 
  magic === 'JPEG' ||
  magic === 'PNG' ||
  magic === 'GIF' ||
  magic === '3GP' ||
  magic === 'MP4' ||
  magic === 'MOV'

/** documents **/
// TODO
const isDoc = magic => false

module.exports = {
  fileMagic,
  fileMagicAsync,
  parse,
  ver: MAGICVER,
  isValidMagic,
  isStaticImage,
  isAnimation,
  isImage,
  isVideo,
  isMedia,
  isDoc
}
