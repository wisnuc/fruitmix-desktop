'use strict';
global.fs = require ('fs');
var path = require('path');
var folderPath
folderPath = '/home/harry/Documents/winsun-electron/node_modules'
folderPath = 'E:\\下载\\TestData'
folderPath = '/home/harry/Documents/TestData'
folderPath = '/home/harry/Documents/winsun-electron/src'

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
console.log((new Date));
traverse(folderPath, uploadObj.data.children, err => {
	if (err) {
		console.log(err)
	}else {
		console.log((new Date));
		console.log(uploadObj);
	}
})

	function traverse(filePath, position, callback ) {

		fs.readdir(filePath, (err, entries) => {
			if (err) {
				callback(err)
			}
			if (entries.length == 0) {
				return callback(null)
			}

			let count = entries.length
			let index = 0

			let childrenCallback = err => {
				if (err) {
					return callback(err)
				}
				index++
				if (index == count) {
					callback(null)
				}else {
					readEntry()
				}
			}

			let readEntry = ()=>{
				fs.stat(path.join(filePath,entries[index]),(err,stat)=>{

					if (err || (!stat.isDirectory() && !stat.isFile())) {
						return callback(err||'error')
					}

					uploadObj.count++
					position.push({times: 0,children: [],path: path.join(filePath,entries[index]),status: '准备',parent: null,type: stat.isFile()?'file':'folder',name: entries[index]})
					if (stat.isFile()) {
						c('count : ' + uploadObj.count + '>>>' + path.join(filePath,entries[index]) + ' is a file')
						childrenCallback(null)
					}else {
						c('count : ' + uploadObj.count + '>>>' + path.join(filePath,entries[index]) + ' is a folder')
						traverse(path.join(filePath,entries[index]),position[index].children,childrenCallback)
					}
				})
			}
			readEntry()
		})
	}
