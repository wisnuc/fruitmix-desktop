const defaultState = {
	upload:[],
	download: [],
	uploadSize:20,
	downloadSize:20
}

const transmission = (state=defaultState,action)=>{
	switch(action.type) {
		case 'ADD_UPLOAD':
			var up = state.upload;
			up.push(action.obj);
			return Object.assign({},state,{upload:up});

		case 'ADD_DOWNLOAD':
			var down = state.download;
			down.push(action.obj);
			return Object.assign({},state,{download:down});

		case 'REFRESH_STATUS_DOWNLOAD':
			state.download.forEach(item=>{
				var uploadFIle = item.map.get(action.file);
				if (uploadFIle != undefined) {
					uploadFIle.status = action.status;
				}
			});
			return Object.assign({},state) 
		case 'REFRESH_STATUS_UPLOAD':
			state.upload.forEach(item=>{
				var uploadFIle = item.map.get(action.file);
				if (uploadFIle != undefined) {
					uploadFIle.status = action.status;
				}
			});
			return Object.assign({},state) 

		default:
			return state
	}
}

export default transmission;