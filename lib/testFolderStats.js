var path = require('path')
var fs = require('fs')

const folderStats = (abspath, callback) => {
	fs.readdir(abspath, (err, entries) => {
		if (err) return callback(err)
		if (entries.length === 0) 
			return callback(null, [])
		let count = entries.length
		let xstats = []
		entries.forEach(entry => {
			fs.lstat(path.join(abspath, entry), (err, stats) => {
				if (!err) {
					if (stats.isFile() || stats.isDirectory())
						xstats.push(Object.assign(stats, { abspath: path.join(abspath, entry) }))
				}
				if (!--count) callback(null, xstats)
			})
		})
	})
}

folderStats(".", (err, xstats) => console.log(err || xstats))