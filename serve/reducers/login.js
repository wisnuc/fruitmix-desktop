//define default state
const defaultState = {
	state: 'READY', // READY, BUSY, REJECTED, TIMEOUT, ERROR, LOGGEDIN
  	obj: {},
  	device: [],
  	selectIndex : 0
}

const loginState = (state = defaultState, action) => {
	switch (action.type) {
		case 'LOGIN':
			return Object.assign({}, state, {state: 'BUSY'})
		case 'LOGGEDIN':
			return Object.assign({},state, {obj:action.obj,state:'LOGGEDIN'})
		case 'REJECTED':
			return Object.assign({}, state, {state: 'REJECTED'})
		case 'LOGIN_OFF':
			return Object.assign({}, state, {state: 'READY',obj: {}})
		case 'LOGINOUT':
			return Object.assign({}, state, {state: 'READY'})

		case 'SET_DEVICE':
			return Object.assign({},state,{device: action.device});
		case 'SET_DEVICE_USED_RECENTLY':
			var i = state.device.findIndex(item=>{
				return item.address == action.ip
			});
			if (i != -1) {
				c('index != -1 : ' + i)
				return Object.assign({},state,{selectIndex:i})
			}
			return state

		default:
			return state
	}
};

module.exports = loginState