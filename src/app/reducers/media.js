import Debug from 'debug'
const debug = Debug('reducer:media')

const defaultState = {
	data: [],
	status: 'busy',
	size:30,
	mediaShare : []
}

const Media = (state=defaultState,action)=>{
	switch(action.type) {
		// case 'SET_MEDIA':
		// 	var m = new Map()
		// 	action.data.forEach(item=>{
		// 		m.set(item.digest,item)
		// 	})
		// 	return Object.assign({},state,{data:action.data,status:'ready',map:m})
		// case 'SET_THUMB':
		// 	var item = state.map.get(action.data)
		// 	item.status = action.status
		// 	item.path = action.path
		// 	return Object.assign({},state)
		// case 'SET_SHARE_THUMB':
		// 	state.mediaShare.forEach(item => {
		// 		item.doc.contents.forEach( pic => {
		// 			if (pic.digest == action.data) {
		// 				pic.path = action.path
		// 			}
		// 		})
		// 	})
		// return Object.assign({},state)
		case 'SET_MEDIA_SIZE':
			var s
			if (action.reset) {
				s = 30
			}else {
				s = state.size+30
			}
			return Object.assign({},state,{size:s})
		// case 'SET_MEDIA_SHARE':
		// 	return Object.assign({},state,{mediaShare:action.data})

		case 'ADAPTER':
			debug(action.store.media)
			return Object.assign({},state,action.store.media)
		default:
			return state;
	}
}

export default Media;
