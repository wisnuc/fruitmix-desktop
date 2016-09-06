var fs = require('fs')
var path = require('path')

global.rootNode= null
global.tree = {};
global.map = new Map()

//share
global.shareFiles = []
global.shareTree = []
global.shareMap = new Map()
global.shareChildren = []
global.sharePath = []
global.filesSharedByMe = []

global.user = {uuid:"9fe98cf4-3bde-441e-81a3-ada9d2eeadef"}

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
	removeFolder(files)
	classifyShareFiles(files)

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

function dealWithData(data) {
	//set allfiles
	allFiles = data.map((item)=>{item.share = false;item.checked = false;return item});
	//separate shared files from allfiles
	classifyShareFiles();
	//set tree
	tree = getTree(allFiles,'file');
	shareTree = getTree(shareFiles,'share');
	//set share children
	shareTree.forEach((item)=>{if (item.hasParent == false) {shareChildren.push(item)}});
	//set filesSharedByMe
	getFilesSharedByMe();
	//show root file
	enterChildren(rootNode);
}

function classifyShareFiles(allFiles) {
	try{
		let userUUID = user.uuid;
		allFiles.forEach((item,index)=>{
			// owner is user ?
			if (item.permission.owner[0] != userUUID ) {
				// is not user
				let result = item.permission.readlist.find((readUser)=>{
					return readUser == userUUID
				});
				if (result != undefined) {
					//file is shared to user
					shareFiles.push(item);
					allFiles[index].share = true;
				}else {
					//is file included in shareFolder?
					var findParent = function(i) {
						if (i.parent == '') {
							//file belong to user but is not upload by client
							return
						}
						let re = allFiles.find((p)=>{
							return i.parent == p.uuid
						});
						if (re.parent == '') {
							return;
						}
						let rer = re.permission.readlist.find((parentReadItem,index)=>{
							return parentReadItem == userUUID
						})
						if (rer == undefined) {
							//find parent again
							findParent(re);
						}else {
							shareFiles.push(item);
							allFiles[index].share = true;
						}
					};
					findParent((item));
				}
			}
		})
	}catch(err){
		c(err)
	}
	c('screen out share and length is : ' + shareFiles.length );
}