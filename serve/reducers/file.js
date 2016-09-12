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
		case 'LOADING':
			return Object.assign({},state,{view:{state:'BUSY',selectAll:false}})
		case 'SET_DIR':
			var newCurrent = {
				directory : action.directory,
				children : action.children,
				path : action.path
			}
			return Object.assign({},state,{current : newCurrent})

		default:
			return state
	}
}

module.exports =  directory;