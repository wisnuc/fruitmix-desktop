const defaultState = {
	upload:[],
	download: []
}

const transimission = (state=defaultState,action)=>{
	switch(action.type) {
		case 'LOGIN_OFF':
			return {
				upload:[],
				download: []
			}
		case 'REFRESH_STATUS_DOWNLOAD':
			return Object.assign({},state,{download:action.tasks})

		case 'REFRESH_STATUS_UPLOAD':
			return Object.assign({},state,{upload:action.tasks})
		default:
			return state
	}
}

export default transimission;