const defaultState = {
	data: [],
	status: 'busy'
}

const Media = (state=defaultState,action)=>{
	switch(action.type) {
		case 'SET_MEDIA':
			return Object.assign({},state,{data:action.data,status:'ready'});
		default:
			return state;
	}
}

export default Media;