
const defaultState = {
  users: []
}

const server2 = (state = defaultState, action) => {

  try {
  switch (action.type) {
  case 'SERVER_UPDATE_USERS':
    return Object.assign({}, state, { 
      users: action.data 
    })

  default:
    console.log('server action')
    return state
  }

  }
  catch (e) { console.log(e) }
}

export default server2

