//define default state
const defaultState = {
	state: 'READY', // READY, BUSY, REJECTED, TIMEOUT, ERROR, LOGGEDIN
  obj: {},
  device: [],
  selectIndex : 0
}

const listeners = []

export const addListener = listener => listeners.push(listener)

const loginState = (state = defaultState, action) => {

  // logged in listener
  if (action.type === 'LOGGEDIN') 
    setImmediate(() => listeners.forEach(l => l(action.type)))

	switch (action.type) {
		case 'LOGIN':
			return Object.assign({}, state, {state: 'BUSY'})
		case 'LOGGEDIN':
			return Object.assign({}, state, {obj:action.obj, state:'LOGGEDIN'})
		case 'REJECTED':
			return Object.assign({}, state, {state: 'REJECTED'})
		case 'LOGIN_OFF':
			return Object.assign({}, state, {state: 'READY', obj: {}})
		case 'LOGINOUT':
			return Object.assign({}, state, {state: 'READY'})

    case 'CONFIG_SET_IP': {
      let selectIndex = state.device.findIndex(dev => dev.address === action.data)
      return (selectIndex !== -1) ? Object.assign({}, state, { selectIndex }) : state
    }

		case 'SET_DEVICE':
			return Object.assign({},state,{device: action.device});

		case 'DELETE_SERVER':
			var IPIndex = state.device.findIndex(item => {
				return item.address == action.item.address
			})
			if (IPIndex != -1) {
				state.device.splice(IPIndex,1)
			}
			return state
		default:
			return state
	}
}

export default loginState

