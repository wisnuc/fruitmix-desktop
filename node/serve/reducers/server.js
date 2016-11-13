
const defaultState = {
  loginUsers: []
}

const server2 = (state = defaultState, action) => {

  try {
  switch (action.type) {
  case 'SERVER_UPDATE_LOGIN_USERS':
    return Object.assign({}, state, { 
      loginUsers: action.data 
    })

  default:
    console.log('server action')
    return state
  }

  }
  catch (e) { console.log(e) }
}

export default server2

