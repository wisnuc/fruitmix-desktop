const defaultState = {
  state: 'LOGOUT',
  device: null,
  user: null
}

const login = (state = defaultState, action) => {

  switch(action.type) {
    case 'LOGIN':
      return {
        state: 'LOGIN',
        device: action.data.device,
        user: action.data.user
      }

    case 'LOGIN_USER':
      return Object.assign({}, state, {
        user: Object.assign({}, state.user, action.data)
      })

    case 'LOGOUT':
      return defaultState

    default:
      return state
  }
}

export default login

