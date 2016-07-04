const defaultState = {
	upload:[],
	dowload: [],
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
			var dowload = state.dowload.concat([action.obj]);
			//add property status for each item
			for (let i =0; i < dowload.length; i++) {
				dowload[i].status = 0
			}
			return Object.assign({},state,{dowload:dowload});

					state.upload.forEach(item=>{
				var uploadFIle = item.map.get(action.file);
				if (uploadFIle != undefined) {
					uploadFIle.status = action.status;
				}
			});
			return Object.assign({},state) 

		case 'REFRESH_STATUS_DOWNLOAD':
			var newDownloadArr = state.dowload;
			var downloadArrIndex = null;
			for (let i=0;i<newDownloadArr.length;i++) {
				console.log(newDownloadArr[i].uuid);
				if (newDownloadArr[i].uuid == action.file.uuid) {
					downloadArrIndex = i;
					break;
				}
				
			}
			newDownloadArr[downloadArrIndex].status = action.status;
			if (downloadArrIndex !=null) {
				return Object.assign({},state,{download:newDownloadArr})
			}else {
				return state
			}

		case 'REFRESH_STATUS_UPLOAD':
			// var newUploadArr = state.upload;
			// var uploadArrIndex = null;
			// for (let i = 0;i<newUploadArr.length;i++) {
			// 	if (newUploadArr[i].name == action.file.name) {
			// 		uploadArrIndex = i;
			// 		break;
			// 	}
				
			// }
			// newUploadArr[uploadArrIndex].status = action.status;
			// if (uploadArrIndex !=null) {
			// 	return Object.assign({},state,{upload:newUploadArr})
			// }else {
			// 	return state;
			// }
			// for (let item of status.upload) {
			// 	item.map.get();
			// }
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