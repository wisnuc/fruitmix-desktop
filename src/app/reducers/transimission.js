const defaultState = {
	upload:[],
	download: [],
	uploadFinish: true,
	downloadFinish: true
}

const transimission = (state=defaultState,action)=>{
	switch(action.type) {
		case 'LOGIN_OFF':
			return Object.assign({}, state, {
				upload:[],
				download: [],
				uploadFinish: true,
				downloadFinish: true
			})
		case 'REFRESH_STATUS_DOWNLOAD':
			return Object.assign({},state,{
				download:action.tasks,
				downloadFinish:action.downloadFinish == undefined?state.uploadFinish:action.downloadFinish
			})

		case 'REFRESH_STATUS_UPLOAD':
			return Object.assign({},state,{
				upload:action.tasks,
				uploadFinish:action.uploadFinish == undefined?state.uploadFinish:action.uploadFinish})
		default:
			return state
	}
}

export default transimission;