//define default state
const defaultState = {
  	findDevice: false,
  	addDevice: false,
  	dialogOfFolder: false,
	dialogOfShare: false,
	detail : false,
	move: {open:false,x:0,y:0,data:[]},
	menu:{show:false,index:-1,x:0,y:0},
	mediaSize: 30,
	currentMediaImage:{status:'notReady',path:null,open: false},
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
			return Object.assign({},state,{detail:true});

		case 'CLEAN_DETAIL':
			return Object.assign({},state,{detail:false});
		case 'TOGGLE_MOVE':
			return Object.assign({},state,{move:{open:action.open,x:action.x,y:action.y}});
		case 'CLOSE_MOVE': 
			return Object.assign({},state,{move: {open:false,x:0,y:0,data:[]}})
		case 'TOGGLE_MENU':
			if (action.index == null) {
				var newMenu = Object.assign({}, state.menu, {show:false})
				return Object.assign({},state,{menu:newMenu});	
			}
			return Object.assign({},state,{menu:{show:action.selected,index:action.index,x:action.x,y: action.y}});
		//media
		case 'SET_MEDIA_SIZE':
			var s
			if (action.reset) {
				s = 30
			}else {
				s = state.mediaSize+30
			}
			return Object.assign({},state,{mediaSize:s});

		case 'TOGGLE_MEDIA':
			let imgObj = {}
			if (action.open == false) {
				imgObj = {status:'notReady',path:null,open: false};	
			}else {
				imgObj = {status:'notReady',path:null,open: true}
			}
			return Object.assign({},state,{currentMediaImage:imgObj});
		case 'SET_MEDIA_IMAGE':

			state.currentMediaImage.status = 'ready'
			state.currentMediaImage.path = action.item.path
			return state

		default:
			return state
	}
};

export default loginState;