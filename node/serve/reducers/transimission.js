//define default state
const defaultState = {
	upload:[],
	download: [],
	uploadSize:20,
	downloadSize:20
}

const transimission = (state = defaultState, action) => {
	switch (action.type) {
		case 'SET_UPLOAD':
			return Object.assign({}, state, {upload:action.data})
		default:
			return state
	}
};

module.exports = transimission