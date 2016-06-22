const defaultState = {
	dialogOfFolder: false,
	dialogOfShare: false,
	detail:[],
}

const isShow = (state=defaultState,action)=>{
	switch(action.type) {
		case 'TOGGLE_DIALOG_FOLDER':
			return Object.assign({},state,{dialogOfFolder:action.isOpen});

		case 'TOGGLE_SHARE':
			return Object.assign({},state,{dialogOfShare:action.isOpen});

		case 'SET_DETAIL':
			return Object.assign({},state,{detail:action.objArr});

		case 'CLEAN_DETAIL':
			return Object.assign({},state,{detail:[]});

		default:
			return state;
	}
}

export default isShow;