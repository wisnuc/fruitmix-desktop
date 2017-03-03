var crypto = require('crypto')
var fs = require('fs')

let hash = crypto.createHash('sha256')
hash.setEncoding('hex')
let fileStream = fs.createReadStream(process.env.absPath)
fileStream.on('end', (err) => {
	if (err) throw new Error(err)
	hash.end()
	process.send(hash.read())
})
fileStream.pipe(hash)