//define default state
const defaultState = {
	download : '' 
}

const settingState = (state = defaultState, action) => {
	switch (action.type) {
		case 'SET_DOWNLOAD_PATH':
			return Object.assign({},state,{download:action.path});
		default:
			return state
	}
};

module.exports = settingState