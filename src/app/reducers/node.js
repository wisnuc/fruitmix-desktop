
export default (state = null, action) => {

  switch (action.type) {
  case 'NODE_UPDATE':
    return action.data
  default:
    return state
  }
}
