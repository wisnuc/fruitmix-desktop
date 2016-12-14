const defaultData = {
	text: '',
	open: false
}

const snack = (state=defaultData, action)=>{
	switch(action.type) {
  case 'SET_SNACK':
    return Object.assign({}, state,{
      text: action.text,
      open: action.open
    })

  case 'CLEAN_SNACK':
    return Object.assign({}, state,{
      text: '',
      open: false
    })

  default:
    return state
	}
}

export default snack;
