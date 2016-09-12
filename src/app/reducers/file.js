const defaultDirectory = {
	current : {
		directory: {},
		children:[],
		path:[],
	},
	view : {
		state: 'READY',
		selectAll:false, 
	}
}

const directory = (state = defaultDirectory,action)=> {
	switch (action.type) {
		case 'ADAPTER':
			return Object.assign({},state,action.store.file)
			
		default:
			return state
	}
}

module.exports =  directory;