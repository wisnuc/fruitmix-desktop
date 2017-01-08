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
			
		default:
			return state
	}
}

export default loginState;
