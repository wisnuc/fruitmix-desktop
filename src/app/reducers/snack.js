const defaultData = {
	text: '',
	open: false
}

const snack = (state=defaultData,action)=>{
	switch(action.type) {
		case 'SET_SNACK':
			return Object.assign({},state,{text:action.text,open:action.open});
		default:
			return state
	}
}

export default snack;