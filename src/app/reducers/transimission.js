const defaultState = {
	upload:[],
	download: [],
	uploadSize:20,
	downloadSize:20
}

const transimission = (state=defaultState,action)=>{
	switch(action.type) {
		case 'LOGIN_OFF':
			return {
	upload:[],
	download: [],
	uploadSize:20,
	downloadSize:20
}
		// case 'ADD_UPLOAD':
		// 	var up = state.upload;
		// 	up.push(action.obj);
		// 	return Object.assign({},state,{upload:up});

		case 'ADD_DOWNLOAD':
			var down = state.download;
			down.push(action.obj);
			return Object.assign({},state,{download:down});

		case 'REFRESH_STATUS_DOWNLOAD':
			state.download.forEach(item=>{
				if (item.type == 'folder') {
					return
				}
				var downloadFIle = item.map.get(action.file);
				if (downloadFIle != undefined) {
					downloadFIle.status = action.status;
				}
			});
			return Object.assign({},state) 
		// case 'REFRESH_STATUS_UPLOAD':
		// 	state.upload.forEach(item=>{
		// 		if (item.type == 'folder') {
		// 			return
		// 		}
		// 		var uploadFIle = item.map.get(action.file);
		// 		if (uploadFIle != undefined) {
		// 			uploadFIle.status = action.status;
		// 		}
		// 	});
		// 	return Object.assign({},state);
		case 'DOWNLOAD_STATUS_OF_FOLDER': 
			var index = state.download.findIndex(item=>{
				return item.type=='folder'&&item.key==action.key
			})
			state.download[index].status = action.status;
			return Object.assign({},state);
		// case 'UPLOAD_STATUS_OF_FOLDER': 
		// 	var index = state.upload.findIndex(item=>{
		// 		return item.type=='folder'&&item.key==action.key
		// 	})
		// 	state.upload[index].status = action.status;
		// 	return Object.assign({},state);
		case 'ADAPTER':
			return Object.assign({},state,action.store.transimission)
		default:
			return state
	}
}

export default transimission;