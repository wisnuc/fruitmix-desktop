import deepEqual from 'deep-equal' 

export default (state = { file: null }, action) => {

  switch (action.type) {
  case 'NODE_UPDATE':
    if (state === null || !deepEqual(state.file, action.data.file))
      return action.data
    else
      return Object.assign(action.data, { file: state.file })
  default:
    return state
  }
}
