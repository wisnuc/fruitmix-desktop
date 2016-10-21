//define default state
const defaultState = {
	data: [],
	status: 'busy',
	mediaShare : []
}

const loginState = (state = defaultState, action) => {
	switch (action.type) {
		case 'SET_MEDIA':
			return Object.assign({},state,{data:action.data,status:'ready'});
		case 'SET_MEDIA_SHARE':
			return Object.assign({},state,{mediaShare:action.data})
		case 'SET_THUMB':
			var item = state.map.get(action.data.hash);
			item.status = action.status;
			item.path = action.data.path;
			return Object.assign({},state)
		default:
			return state
	}
};

module.exports = loginState