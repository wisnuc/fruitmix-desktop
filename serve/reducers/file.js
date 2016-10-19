const defaultDirectory = {
	current : {
		directory: {},
		children:[],
		path:[],
	},
	view : {
		state: 'READY',
		selectAll:false, 
	},
	children : []
}

const directory = (state = defaultDirectory,action)=> {
	switch (action.type) {
		case 'LOADING':
			return Object.assign({},state,{view:{state:'BUSY',selectAll:false}})
		case 'SET_DIR':
			var newCurrent = {
				directory : action.directory,
				children : [],
				path : action.path
			}
			var newView = {state:'READY',selectAll:false}
			return Object.assign({},state,{current : newCurrent,view:newView,children:action.children})
		default:
			return state
	}
}

function cloneFun(obj){
  if(!obj||"object" != typeof obj){
    return null;
  }
  var result = (obj instanceof Array)?[]:{};
  for(var i in obj){
    result[i] = ("object" != typeof obj[i])?obj[i]:cloneFun(obj[i]);
  }
  return result;
}

module.exports =  directory;