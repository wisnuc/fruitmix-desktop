import Debug from 'debug'
const debug = Debug('reducer:maintenance')

const reducer = (state = null, action) => {

  switch(action.type) {
  case 'ENTER_MAINTENANCE':
    debug('ENTER_MAINTENANCE', action.data) 
    return action.data

  case 'EXIT_MAINTENANCE':
    debug('EXIT_MAINTENANCE')
    return null

  default:
    return state
  }
}

export default reducer

