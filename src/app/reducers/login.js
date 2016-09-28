//define default state
const defaultState = {
	state: 'READY', // READY, BUSY, REJECTED, TIMEOUT, ERROR, LOGGEDIN
  	obj: {},
  	device: [],
  	selectIndex : 0
}

const loginState = (state = defaultState, action) => {
	switch (action.type) {
		case 'ADAPTER':
			return Object.assign({},state,action.store.login)
		case 'CHECK_USER':
			var checkUser = state.obj.users.find(item => item.uuid == action.uuid)
			checkUser.checked = !checkUser.checked
			return state
		case 'TOGGLE_SHARE':
			
				state.obj.users.forEach(item => {
					item.checked = false
				})
				return state
			
		default:
			return state
	}
};

export default loginState;