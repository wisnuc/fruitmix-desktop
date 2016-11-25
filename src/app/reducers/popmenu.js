
const reducer = (state = null, action) => {
  switch(action.type) {
  case 'POPMENU_CLOSE':
    return null
  case 'POPMENU_OPEN':
    return action.data
  default:
    return state
  }
}

export default reducer
