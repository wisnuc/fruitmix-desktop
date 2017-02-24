import crypto from 'crypto'
import path from 'path'
import fs from 'fs'
import uuid from 'node-uuid'

var utils = {

	quickSort: function(arr) {
		if (arr.length <= 1) {return arr}
		let pivotIndex = Math.floor(arr.length/2)
		let pivot = arr.splice(pivotIndex,1)[0]
		let left = []
		let right = []
		for (let item of arr) {
			if (item.doc.ctime > pivot.doc.ctime) {left.push(item)}
			else {right.push(item)}
		}
		return this.quickSort(left).concat([pivot], this.quickSort(right));
	},

	getTreeCount: function(tree) {
		let count = 0
		loopTree(tree,downloadPath)
		function loopTree(tree) {
			count++
			tree.times = 0
			if (tree.children.length == 0) {
				return
			}else {
				tree.children.forEach(item=>{
					loopTree(item)
				})
			}
		}
		return count
	},

	hashFile: function(abspath) {
		let promise = new Promise((resolve,reject) => {
			let hash = crypto.createHash('sha256')
			hash.setEncoding('hex')
			let fileStream = fs.createReadStream(abspath)
			fileStream.on('end',(err) => {
				if (err) reject(err)
					hash.end()
				resolve(hash.read())
			})
			fileStream.pipe(hash)
		})
		return promise
	}
}

export default utils