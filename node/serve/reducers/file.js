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
    return Object.assign({}, state, {
      view: { state:'BUSY', selectAll:false }
    })

  case 'SET_DIR':
    var current = {
      directory : action.directory,
      children : [],
      path : action.path
    }
    var view = { state:'READY', selectAll:false }
    return Object.assign({}, state, {
      current,
      view,
      children: action.children
    })
    return

  case 'SET_DIR2':
    let current = Object.assign({}, action.data, { children: [] })
    return Object.assign({}, state, {
      current,
      view: {
        state: 'READY',
        selectAll: false
      },
      children: action.data.children 
    })

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
