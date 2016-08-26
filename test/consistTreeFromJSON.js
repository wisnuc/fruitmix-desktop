var fs = require('fs')
var path = require('path')

var c = console.log

var getFiles = function() {
	var promise = new Promise((resolve, reject) => {

		fs.readFile(path.join(__dirname, 'testFileData'), {encoding:'utf-8'}, (err, data) => {
			if (err) {
				reject(err)
			}else {
				resolve(JSON.parse(data))	
			}
		})
	})	

	return promise
}


getFiles().then((files)=>{
	c(files)
})