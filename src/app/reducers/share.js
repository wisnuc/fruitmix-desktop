const defaultShare = {
	sharePath:[],
	shareChildren: [],
	filesSharedByMe: []
}

const directory = (state = defaultShare,action)=> {
	switch (action.type) {
		case 'ADAPTER':
			return Object.assign({},state,action.store.share)
		default:
			return state
	}
}

module.exports =  directory;