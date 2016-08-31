//define default state
const defaultState = {
	state: 'READY', // READY, BUSY, REJECTED, TIMEOUT, ERROR, LOGGEDIN
  	obj: {},
  	device: [],
  	deviceUsedRecently: ''   
}

const loginState = (state = defaultState, action) => {
	switch (action.type) {
		case 'LOGGEDIN':
			return Object.assign({},state, {obj:action.obj,state:'LOGGEDIN'})
		case 'LOGINOUT':
			return Object.assign({}, state, {state: 'READY'})

		case 'SET_DEVICE':
			return Object.assign({},state,{device: action.device});
		case 'SET_DEVICE_USED_RECENTLY':
			var i = state.device.findIndex(item=>{
				return item.addresses[0] == action.ip
			});
			if (i != -1) {
				state.device[i].active = true;
			}

		default:
			return state
	}
};

module.exports = loginState;                             