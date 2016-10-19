const defaultDirectory = {
	current : {
		directory: {},
		children:[],
		path:[],
	},
	view : {
		state: 'READY',
		selectAll:false, 
	},
	children : []
}

const directory = (state = defaultDirectory,action)=> {
	switch (action.type) {
		case 'ADAPTER':
			return Object.assign({},state,action.store.file)
		case 'SELECT_CHILDREN':
			var allSelected = true;
			//setSelectedChildren
			var newChildren = state.children.map((item,index)=>{
				return index == action.rowNumber?Object.assign({},item,{checked:!item.checked}):item
			});
			// //is all children selected?
			for (let item of newChildren) {
				if (item.checked == false) {
					allSelected = false;
					break;
				}
			}
			return Object.assign({},state,{
				view:Object.assign({},state.view,{selectAll:allSelected}),
				children:newChildren
			})
		case 'SELECT_ALL_CHILDREN':
			var children = state.children.map((item,index)=> {
				return state.view.selectAll?Object.assign({},item,{checked:false}):Object.assign({},item,{checked:true});
			});
			return Object.assign({},state,{
				view:Object.assign({},state.view,{selectAll:!state.view.selectAll}),
				current:Object.assign({},state.current,{children:children}),
				children:children
			});		
		default:
			return state
	}
}

module.exports =  directory;