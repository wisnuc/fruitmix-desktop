class StateMachine {
  constructor(obj) {
    Object.assign(this, obj)
  }

  setState(NewState) {
    this.destructor() 
    return NewState(this) 
  }

  destructor() {}
}

class PlainView extends StateMachine {

  constructor(obj) {
    super(obj)
  }

  selectChild(childUUID) {
    this.selection.add(childUUID)
    return new PlainView(this)
  }

  setSelection(arr) {
    this.selection = new Set(arr) 
    return new PlainView(this)
  }
}

class ContextView extends StateMachine {

  constructor(obj) {
    super(obj)
    // build menu items here
  }
}

class UploadView extends StateMachine {
  
  constructor(obj) {
    super(obj)

  }
}

class MoveFilesView extends StateMachine {

  constructor(obj) {
    super(obj)
  }
}

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
	children : [],
  stm: new PlainView({
    cwd: '',
    selection: new Set()
  })
}

const directory = (state = defaultDirectory,action)=> {

	switch (action.type) {
		case 'ADAPTER':
			return Object.assign({}, state, action.store.file, {
        stm: (state.current.directory.uuid !== action.store.file.current.directory.uuid) ?
          state.stm.setSelection([]) :
          state.stm
      })

		case 'SELECT_CHILDREN':
			var allSelected = true;
			var newChildren = state.children.map((item,index)=>{
				return index == action.rowNumber?Object.assign({},item,{checked:!item.checked}):item
			});
			// //is all children selected?
			for (let item of newChildren) {
				if (item.checked == false) {
					allSelected = false;
					break;
				}
			}
			return Object.assign({},state,{
				view:Object.assign({},state.view,{selectAll:allSelected}),
				children: newChildren,
        stm: state.stm.selectChild(state.children[action.rowNumber].uuid)
			})

		case 'SELECT_ALL_CHILDREN':
			var children = state.children.map((item,index)=> {
				return state.view.selectAll?Object.assign({},item,{checked:false}):Object.assign({},item,{checked:true});
			});
			return Object.assign({},state,{
				view:Object.assign({},state.view,{selectAll:!state.view.selectAll}),
				current:Object.assign({},state.current,{children:children}),
				children:children,
        stm: state.stm.setSelection(state.view.selectAll ? state.children.map(child => child.uuid) : []) 
			});		
		default:
			return state
	}
}

module.exports =  directory;
