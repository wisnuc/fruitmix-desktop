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
			var newView = {state:'READY',selectAll:false}
			return Object.assign({},state,{current : newCurrent,view:newView})
		default:
			return state
	}
}

module.exports =  directory;