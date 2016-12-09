import Debug from 'debug'
const debug = Debug('reducer:server')

const defaultState = {
  users: []
}

const server2 = (state = defaultState, action) => {

  switch (action.type) {
  case 'SERVER_UPDATE_USERS':
    return Object.assign({}, state, { 
      users: action.data 
    })

  default:
    return state
  }
}

export default server2

