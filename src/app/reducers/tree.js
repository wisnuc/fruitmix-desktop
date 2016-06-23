const defaultState = {
	isNull:true,
	tree: [],
	name: null
}

const Tree = (state=defaultState,action)=>{
	switch(action.type) {
		case 'SET_TREE':
			return Object.assign({},state,action.tree);
		default:
			return state;
	}
}

export default Tree;