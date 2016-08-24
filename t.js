'use strict';
global.fs = require ('fs');
var path = require('path');

var folderPath = '/home/harry/Documents/winsun-electron/node_modules'
var uploadObj = {
	status: '准备',
	data: {
		times: 0,
		children: [],
		path: folderPath,
		status: '准备',
		// parent: currentDirectory.uuid,
		type: 'folder',
		name: path.basename(folderPath)
	},
	success: 0,
	count: 0,
	key: '',
	type: 'folder',
	name: ''
}

traverse(folderPath, uploadObj.data.children, err => {
	if (err) {
		console.log(err)
	}else {
		console.log('finish');
	}
})

function traverse(filePath, position, callback ) {
	fs.stat(filePath, (err, stat) => {
		if (err || (!stat.isDirectory() && !stat.isFile())) {
			return callback(err||'error')
		}
		uploadObj.count++
		if (stat.isFile()) {
			console.log('count : ' + uploadObj.count + ' ' + filePath + ' ----> file');
			return callback();
		}
		console.log('count : ' + uploadObj.count + ' ' + filePath + ' ----> directory');

		fs.readdir(filePath, (err, entries) => {
			if (entries.length == 0) {
				return callback(null)
			}

			let count = entries.length
			let index = 0
			// position.push({times: 0,children: [],path: path.join(filePath,entries[index]),status: '准备',parent: null,type: stat.isFile()?'file':'folder',name: entries[index]})
			let childrenCallback = err => {
				if (err) {
					return callback(err)
				}
				index++
				if (index == count) {
					callback(null)
				}else {
					traverse(path.join(filePath,entries[index]),position,childrenCallback)
				}
			}
			traverse(path.join(filePath,entries[index]),position,childrenCallback)
		})
		
	})
}
