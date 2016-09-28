const defaultShare = {
	sharePath:[],
	shareChildren: [],
	filesSharedByMe: []
}

const directory = (state = defaultShare,action)=> {
	switch (action.type) {
		case 'FILES_SHARED_BY_ME':
			return Object.assign({},state,{filesSharedByMe:action.files})
		case 'SET_SHARE_CHILDREN':
			return Object.assign({},state,{shareChildren:action.shareChildren,sharePath:action.sharePath})
		default:
			return state
	}
}

module.exports =  directory;