//define default state
const defaultState = {
	state: 'READY', // READY, BUSY, REJECTED, TIMEOUT, ERROR, LOGGEDIN
	username: null,
  	password: null,
  	obj: {}
}

const loginState = (state = defaultState, action) => {
	switch (action.type) {
		case 'LOGINOUT':
			return Object.assign({}, state, {
				state: 'READY',
				username: null,
				password: null
			});
		case 'LOGIN':
			return Object.assign({}, state, {
				state: 'BUSY',
				username: action.username,
				password: action.password
			});
		case 'REJECTED':
			return Object.assign({}, state, {
				state: 'REJECTED',
				username: null,
				password: null
			});
		case 'TIMEOUT':
			return Object.assign({}, state, {
				state: 'TIMEOUT',
				username: null,
				password: null
			});
		case 'LOGGEDIN':
			var userListArr = action.obj.allUser.map((item)=>{return Object.assign({},item,{checked:false})});
			action.obj.allUser = userListArr;
			return Object.assign({}, state, {
				state: 'LOGGEDIN',
				username: action.username,
				password: action.password,
				obj:action.obj
			});
		case "CHECK_USER":
			var checkedUserArr = state.obj.allUser.map((item)=>{
				if (item.uuid == action.uuid) {
					return Object.assign({},item,{checked:action.b});
				} else {
					return item
				}
			});
			var userObj = Object.assign({},state.obj,{allUser:checkedUserArr});
			return Object.assign({},state,{obj:userObj});
		case 'CANCEL_USER_CHECK':
			var cancelUserArr = state.obj.allUser.map((item)=>{
				item.checked = false;
				return item
			});
			return Object.assign({},state,{obj:Object.assign({},state.obj,{allUser:cancelUserArr})});
		default:
			return state
	}
};

var a = {1:'qwwe',2:'asfta'};
var b = {1:'qqq'}
Object.assign(a,b);
a = {1:'qqq', 2:"asfta"};

export default loginState;