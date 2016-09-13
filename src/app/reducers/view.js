//define default state
const defaultState = {
  	findDevice: false,
  	addDevice: false,
  	dialogOfFolder: false,
	dialogOfShare: false,
	detail:[],
	move: {open:false,x:0,y:0,data:[]},
	menu:{show:false,obj:{}},
}

const loginState = (state = defaultState, action) => {
	switch (action.type) {
		case 'TOGGLE_DEVICE':
			return Object.assign({},state,{findDevice:!state.findDevice})
		case 'TOGGLE_ADD_DEVICE':
			return Object.assign({},state,{addDevice:!state.addDevice})
		case 'TOGGLE_DIALOG_FOLDER':
			return Object.assign({},state,{dialogOfFolder:action.isOpen});

		case 'TOGGLE_SHARE':
			return Object.assign({},state,{dialogOfShare:action.isOpen});

		case 'OPEN_DETAIL':
			return Object.assign({},state,{detail:[state.menu.obj]});

		case 'CLEAN_DETAIL':
			return Object.assign({},state,{detail:[]});
		case 'TOGGLE_MOVE':
			return Object.assign({},state,{move:{open:action.open,x:action.x,y:action.y}});
		case 'CLOSE_MOVE': 
			return Object.assign({},state,{move: {open:false,x:0,y:0,data:[]}})
		case 'TOGGLE_MENU':
			if (action.obj)  {
				if (action.selected) {
					return Object.assign({},state,{menu:{show:false,obj:action.obj,x:action.x,y: action.y}});	
				}else {
					return Object.assign({},state,{menu:{show:true,obj:action.obj,x:action.x,y: action.y}});
				}
				
			}else {
				//close menu
				return Object.assign({},state,{menu:{show:false,obj:{}}});
			}
		default:
			return state
	}
};

export default loginState;