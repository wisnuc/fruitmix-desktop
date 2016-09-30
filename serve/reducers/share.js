const defaultShare = {
	sharePath:[],
	shareChildren: [],
	filesSharedWithMe: []
}

const directory = (state = defaultShare,action)=> {
	switch (action.type) {
		case 'FILES_SHARED_WITH_ME':
			return Object.assign({},state,{filesSharedWithMe:action.files})
		default:
			return state
	}
}

module.exports =  directory;