const defaultState = {
	download : ''
}

const Setting = (state=defaultState,action)=>{
	switch(action.type) {
		case 'SET_DOWNLOAD_PATH':
			return Object.assign({},state,{download:action.path});
		case 'ADAPTER':
			return Object.assign({},state,action.store.setting)
		default:
			return state;
	}
}

export default Setting;