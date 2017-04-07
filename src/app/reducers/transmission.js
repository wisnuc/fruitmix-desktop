const defaultState = {
	upload: [],
	download: [],
	uploadFinish: true,
	downloadFinish: true,
	uploadingTasks: [],
	uploadedTasks: [],
	downloadingTasks: [],
	downloadedTasks:[]
}

const transmission = (state = defaultState, action)=>{
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

		case 'UPDATE_UPLOAD':
			// console.log(action.userTasks)
			return Object.assign({}, state, {
				uploadingTasks: action.userTasks,
				uploadedTasks: action.finishTasks
			})

		case 'UPDATE_DOWNLOAD':
			// console.log(action.userTasks)
			return Object.assign({}, state, {
				downloadingTasks: action.userTasks,
				downloadedTasks: action.finishTasks
			})

		default:
			return state
	}
}

export default transmission