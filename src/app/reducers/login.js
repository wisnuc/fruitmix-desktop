
// this is a passive store, synced from node
const login = (state = { state: 'LOGOUT' }, action) => {

	switch (action.type) {
		case 'ADAPTER':
      return action.store.login2
        ? action.store.login2
        : state
			
		default:
			return state
	}
}

export default login
