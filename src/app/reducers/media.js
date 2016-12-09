import Debug from 'debug'

const debug = Debug('reducer:media')

const defaultState = {
	data: [],
	mediaShare : []
}

const Media = (state=defaultState,action)=>{
	switch(action.type) {

		case 'ADAPTER':
			debug(action.store.media)
			return Object.assign({},state,action.store.media)
		default:
			return state;
	}
}

export default Media;
