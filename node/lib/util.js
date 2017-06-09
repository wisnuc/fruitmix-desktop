import crypto from 'crypto'
import path from 'path'
import fs from 'fs'
import uuid from 'node-uuid'

const utils = {

  quickSort(arr) {
    if (arr.length <= 1) { return arr }
    const pivotIndex = Math.floor(arr.length / 2)
    const pivot = arr.splice(pivotIndex, 1)[0]
    const left = []
    const right = []
    for (const item of arr) {
      if (item.doc.ctime > pivot.doc.ctime) { left.push(item) }			else { right.push(item) }
    }
    return this.quickSort(left).concat([pivot], this.quickSort(right))
  },

  getTreeCount(tree) {
    let count = 0
    loopTree(tree, downloadPath)
    function loopTree(tree) {
      count++
      tree.times = 0
      if (tree.children.length == 0) {
        return
      }
      tree.children.forEach((item) => {
        loopTree(item)
      })
    }
    return count
  },

  hashFile(abspath) {
    const promise = new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256')
      hash.setEncoding('hex')
      const fileStream = fs.createReadStream(abspath)
      fileStream.on('end', (err) => {
        if (err) reject(err)
        hash.end()
        resolve(hash.read())
      })
      fileStream.pipe(hash)
    })
    return promise
  },

  formatSize(size) {
    if (!size) return `${0}KB`
    size = parseFloat(size)
    if (size < 1024) return `${size.toFixed(2)}B`
    else if (size < (1024 * 1024)) return `${(size / 1024).toFixed(2)}KB`
    else if (size < (1024 * 1024 * 1024)) return `${(size / 1024 / 1024).toFixed(2)}M`
    return `${(size / 1024 / 1024 / 1024).toFixed(2)}G`
  },

  formatSeconds(seconds) {
    if (!seconds || seconds === Infinity) return '--'
    let s = parseInt(seconds) // s
    let m = 0
    let h = 0
    if (s > 60) {
      m = parseInt(s / 60)
      s = parseInt(s % 60)
      if (m > 60) {
        h = parseInt(m / 60)
        m = parseInt(m % 60)
      }
    }
    if (s.toString().length === 1) s = `0${s}`
    if (h.toString().length === 1) h = `0${h}`
    if (m.toString().length === 1) m = `0${m}`
    return `${h}:${m}:${s}`
  },

  formatDate(mtime) {
    const time = new Date()
    if (mtime) time.setTime(mtime)
    return [
      time.getFullYear(),
      time.getMonth() + 1,
      time.getDate(),
      time.getHours(),
      time.getMinutes().toString().length == 1 ? Number((`0${time.getMinutes()}`)) : time.getMinutes()
    ]
  },

  splicePart(size, partSize) {
    const part = []
    let position = 0
    while (position < size) {
      if (position + partSize >= size - 1) {
        part.push({ start: position, end: size - 1 })
        break
      } else {
        part.push({ start: position, end: position + partSize })
        position = position + partSize + 1
      }
    }
    return part
  }

}

export default utils
