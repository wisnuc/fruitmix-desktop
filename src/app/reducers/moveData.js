const defaultState = {
	data : []
}

const MoveData = (state=defaultState,action)=>{
	switch(action.type) {
		case 'SET_MOVE_DATA':
		c.log(action.data)
			return Object.assign(state,{data:action.data})
		default:
			return state;
	}
}

export default MoveData