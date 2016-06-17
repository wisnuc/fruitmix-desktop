var uploadQueue = [];
var uploadNow = []
ipc.on('uploadFile',(e,files)=>{
	uploadQueue.push(files);
});
function dealUploadQueue () {
	if (uploadQueue.length == 0) {
		return
	}else {
		if (uploadQueue[0].index == file.length) {
			uploadQueue.shift();
			console.log('a upload task over');
			dealUploadQueue();
		}else {
			console.log('upload');
			if (uploadNow.length < 10) {
				let gap = 10 - uploadNow.length;
				for (let i = 0; i < gap; i++) {
					uploadNow.push(uploadQueue[0].index);
				}
			}
		}
	}
}

function modifyData() {
	
}