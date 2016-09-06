var fs = require('fs')
var path = require('path')

global.rootNode= null
global.allFiles = []
global.tree = {};
global.map = new Map()

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
	let a = 1
	c(files.length)
	removeFolder(files)
	c(files.length)
	c(rootNode)
})

function removeFolder(data) {
	try{
		let uuid = null;
		let fruitmixIndex = data.findIndex((item,index)=>{
			return item.parent == ''
		});
		if (fruitmixIndex == -1) {
			throw 'can not find fruitmix';
			return 
		}else {
			rootNode = data[fruitmixIndex]; 
		}

		let fruitmixuuid = data[fruitmixIndex].uuid;
		data.splice(fruitmixIndex,1);
		//data/fruitmix is removed
		let driveIndex = data.findIndex((item)=>{
			return item.parent == fruitmixuuid
		})
		if (driveIndex == -1) {
			throw 'can not find drive';
			return
		}else {
			rootNode = data[driveIndex]; 	
		}

		let driveuuid= data[driveIndex].uuid
		data.splice(driveIndex,1);
		let uuidindex = data.findIndex((item)=>{
			return item.parent == driveuuid
		})
		if (uuidindex == -1) {
			throw 'can not find uuid folder';
			return
		}else {
			data[uuidindex].parent = '';
			data[uuidindex].attribute.name = 'my cloud';
			rootNode = data[uuidindex]; 	
		}
		c('remove folder and length is : ' + data.length );
	}catch(e){
		c(e);
	}
}