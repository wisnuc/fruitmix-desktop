const defaultState = {
	tree: {isNull:true}
}

const Tree = (state=defaultState,action)=>{
	switch(action.type) {
		case 'SET_TREE':
			return Object.assign({},state, {tree:action.tree});
		default:
			return state;
	}
}

export default Tree;