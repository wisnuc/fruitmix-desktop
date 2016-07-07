const defaultState = {
	data: [],
	status: 'busy',
	map: null,
	currentMediaImage:{status:'notReady',path:null,open: false},
	size:50
}

const Media = (state=defaultState,action)=>{
	switch(action.type) {
		case 'SET_MEDIA':
			var m = new Map();
			action.data.forEach(item=>{
				m.set(item.hash,item);
			});
			return Object.assign({},state,{data:action.data,status:'ready',map:m});
		case 'SET_THUMB':
			var item = state.map.get(action.data.hash);
			item.status = action.status;
			item.path = action.data.path;
			return Object.assign({},state);
		case 'TOGGLE_MEDIA':
			let currentMediaImage = state.currentMediaImage;
			state.currentMediaImage.open = action.open;

			if (action.open == false) {
				currentMediaImage = {status:'notReady',path:null,open: false};	
			}
			return Object.assign({},state,{currentMediaImage:currentMediaImage});
		case 'SET_MEDIA_IMAGE':
			let image = Object.assign({},action.item,{status:'ready',path:action.item.path,open:true});
			return Object.assign({},state,{currentMediaImage:image});
		case 'SET_MEDIA_SIZE':
			var s;
			if (action.reset) {
				s = 50;
			}else {
				s = state.size+50;
			}
			console.log(s);
			return Object.assign({},state,{size:s});
		default:
			return state;
	}
}

export default Media;