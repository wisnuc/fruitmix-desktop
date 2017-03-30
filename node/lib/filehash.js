var crypto = require('crypto')
var fs = require('fs')
var stream = require('stream')

let env = process.env
let parts = []
let absPath = env.absPath
let allHash = crypto.createHash('sha256')
allHash.setEncoding('hex')

let size = Number(env.size)
let partSize = Number(env.partSize)
parts = splice(size, partSize)

hashFile(0, (err) => {
	if(err) return console.log(err)
	process.send({
		parts,
		hash: allHash.digest('hex')
	})

})



function hashFile(index, callback) {
	if(!parts[index]) return callback(null)
	let part = parts[index]
	let hash = crypto.createHash('sha256')
	hash.setEncoding('hex')
	let fileStream = fs.createReadStream(absPath, {start: part.start, end: part.end})
	fileStream.on('end', (err) => {
		if (err) throw new Error(err)
		hash.end()
		parts[index].sha = hash.read()
		hashFile(++index, callback)
	})

	let t = new stream.Transform({
		transform: function(chunk, encoding, next) {
			allHash.update(chunk)
			this.push(chunk)
			next()
		}
	})

	fileStream.pipe(t).pipe(hash)
}


function splice(size, partSize) {
	let part = []
	let position = 0
	while(position < size) {
		if (position + partSize >= size) {
			part.push({start: position, end: size-1})
			break
		}else {
			part.push({start: position, end: position + partSize -1})
			position = position + partSize
		}
	}
	return part
}