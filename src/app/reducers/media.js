const defaultState = {
	data: [],
	status: 'busy',
	map: null,
	size:30,
	mediaShare : []
}

const Media = (state=defaultState,action)=>{
	switch(action.type) {
		case 'SET_MEDIA':
			var m = new Map();
			action.data.forEach(item=>{
				m.set(item.digest,item);
			})
			return Object.assign({},state,{data:action.data,status:'ready',map:m});
		case 'SET_THUMB':
			var item = state.map.get(action.data)
			item.status = action.status;
			item.path = action.path;
			if (action.data == '0c6a1d3d64f485ab58c431e2602f67acd855080c198fe794e040e110a823e54a') {
				c.log(' ?!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
				c.log(item)
			}
			return Object.assign({},state);
		case 'SET_MEDIA_SIZE':
			var s;
			if (action.reset) {
				s = 30;
			}else {
				s = state.size+30;
			}
			console.log(s);
			return Object.assign({},state,{size:s})
		case 'SET_MEDIA_SHARE':
			return Object.assign({},state,{mediaShare:action.data})
		case 'ADAPTER':
			return Object.assign({},state,action.store.media)
		default:
			return state;
	}
}

export default Media;