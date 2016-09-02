//define default state
const defaultState = {
  	findDevice: false,
  	addDevice: false,
}

const loginState = (state = defaultState, action) => {
	switch (action.type) {
		case 'TOGGLE_DEVICE':
			return Object.assign({},state,{findDevice:!state.findDevice});
		case 'TOGGLE_ADD_DEVICE':
			return Object.assign({},state,{addDevice:!state.addDevice});
		default:
			return state
	}
};

export default loginState;