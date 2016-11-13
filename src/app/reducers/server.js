
export default (state = null, action) => {

  switch (action.type) {
  case 'SERVER_UPDATE':
    return action.data
  default:
    return state
  }
}
