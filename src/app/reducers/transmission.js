const defaultState = {
	// uploadingTasks: [],
	// uploadedTasks: [],
	// downloadingTasks: [],
	// downloadedTasks:[],
	userTasks: [],
	finishTasks: []
}

const transmission = (state = defaultState, action)=>{
	switch(action.type) {
		case 'LOGIN_OFF':
			return Object.assign({}, state, {
				userTasks:[],
				finishTasks: []
			})

		// case 'UPDATE_UPLOAD':
		// 	return Object.assign({}, state, {
		// 		uploadingTasks: action.userTasks,
		// 		uploadedTasks: action.finishTasks
		// 	})

		// case 'UPDATE_DOWNLOAD':
		// 	return Object.assign({}, state, {
		// 		downloadingTasks: action.userTasks,
		// 		downloadedTasks: action.finishTasks
		// 	})

		case 'UPDATE_TRANSMISSION':
			return Object.assign({}, state, {
				userTasks: action.userTasks,
				finishTasks: action.finishTasks
			})

		default:
			return state
	}
}

export default transmission