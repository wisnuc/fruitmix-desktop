const debug = require('debug')('reducer:file')

const isLeftClick = e => true
const isRightClick = e => true
const getX = e => 1
const getY = e => 1


class StateMachine {

  // enter
  constructor(obj) {
    Object.assign(this, obj)
  }

  // NewState is a class / constructor
  setState(NewState) {
    this.destructor() 
    return new NewState(this) 
  }

  // exit
  destructor() {}
}

class Clicked extends StateMachine {

  constructor(obj) {
    super(obj)
  }

  leftClick(childUUID, column) {
    // do nothing
    this.childUUID = childUUID
    this.column = column
    return this.setState(Clicking)
  }
}

class Clicking extends StateMachine {

  constructor(obj) {
    super(obj)
    this.timer = setTimeout(() => {
      // fire old one
      window.store.dispatch({
        type: 'FILE_ROW_RAWCLICK_TIMEOUT',
        childUUID: this.childUUID, 
        column: this.column
      })

      window.store.dispatch({
        type: this.column === 'name' ? 
          'FILE_ROW_NAME_LEFTCLICK' :
          'FILE_ROW_NONNAME_LEFTCLICK',
        data: this.childUUID
      })
    }, 250)
  }

  // column: name or nonname
  leftClick(childUUID, column) {

    if (childUUID !== this.childUUID) {
      // fire old one
      setImmediate(() => window.store.dispatch({
        type: this.column === 'name' ? 
          'FILE_ROW_NAME_LEFTCLICK' :
          'FILE_ROW_NONNAME_LEFTCLICK',
        data: this.childUUID
      }))
      // switch back and forth
      return this.setState(Clicked).leftClick(childUUID, column)
    } 
    else {
      //fire double click
      setImmediate(() => window.store.dispatch({
        type: this.column === 'name' ?
          'FILE_ROW_NAME_DOUBLECLICK' :
          'FILE_ROW_NONNAME_DOUBLECLICK',
        data: this.childUUID
      }))

      return this.setState(Clicked)  
    }
  }

  destructor() {

    if (this.timer) {
      debug('clear Timeout')
      clearTimeout(this.timer)
    }
    delete this.timer
  }
}

class PlainView extends StateMachine {

  constructor(obj) {
    super(obj)
  }

  destructor() {
  }

  selectChild(childUUID) {
    this.selection.add(childUUID)
    return new PlainView(this)
  }

  toggleSelection(childUUID) {

    if (this.selection.has(childUUID))
      this.selection.delete(childUUID) 
    else
      this.selection.add(childUUID)
    return new PlainView(this)
  }

  setSelection(arr) {
    this.selection = new Set(arr) 
    return new PlainView(this)
  }

  setEditing(childUUID) {
    this.editing = childUUID
    return new PlainView(this)
  }

  resetEditing(childUUID) {
    if (this.editing === childUUID) {
      delete this.editing
      return new PlainView(this)
    }
    else
      return this
  }

  // TODO
  rowNameOnClick(childUUID) {
    return this.setEditing(childUUID)
  }

  // TODO
  rowNonnameOnClick(childUUID) {
    return this.toggleSelection(childUUID) 
  }

  rowNameLeftClick(childUUID) {
    /// FIXME
    return this
  }

  rowNameDoubleClick(childUUID) {
    /// FIXME
    return this
  }

  rowNonnameLeftClick(childUUID) {
    return this.toggleSelection(childUUID)
  }

  rowNonnameDoubleClick(childUUID) {
    // return this. TODO
    return this
  }

  rowNameOnBlur(childUUID) {
    return this.resetEditing(childUUID)
  }

  rowRightClick(childUUID) {
    debug('rowRightClick not implemented yet')
    return this
  }

  rowMouseEnter(childUUID) {
    debug('rowMouseEnter', childUUID)
    this.mouseOver = childUUID
    debug('this', this)
    let stm = new PlainView(this)
    debug('stm mouseover', stm.mouseOver)
    return stm 
  }

  rowMouseLeave(childUUID) {
    debug('rowMouseLeave', childUUID)
    if (this.mouseOver === childUUID) {
      delete this.mouseOver
      return new PlainView(this)
    }
    return this
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

  click: new Clicked({}),
  stm: new PlainView({
    cwd: '',
    selection: new Set()
  })
}

const directory = (state = defaultDirectory,action)=> {

	switch (action.type) {

		// case 'ADAPTER':
		// 	return Object.assign({}, state, action.store.file, {
  //       stm: (state.current.directory.uuid !== action.store.file.current.directory.uuid) ?
  //         state.stm.setSelection([]) :
  //         state.stm
  //     })

    /** raw click for click machine begin **/

    case 'FILE_ROW_RAWCLICK':
      debug(action.type, action.childUUID, action.column)
      return Object.assign({}, state, {
        click: state.click.leftClick(action.childUUID, action.column)
      })

    case 'FILE_ROW_RAWCLICK_TIMEOUT':
      debug(action.type, action.childUUID, action.column)
      return Object.assign({}, state, {
        click: state.click.setState(Clicked)
      })

    /** raw click for click machine end **/

    case 'FILE_ROW_CHECKBOX_ONCHECK': // action.data is uuid
      debug(action.type, action.data)
      return Object.assign({}, state, {
        stm: state.stm.toggleSelection(action.data)
      })

    case 'FILE_ROW_NAME_ONBLUR':
      debug(action.type, action.data)
      return Object.assign({}, state, {
        stm: state.stm.rowNameOnBlur(action.data)
      })

    case 'FILE_ROW_MOUSE_ENTER':
      debug('mouse enter')
      return Object.assign({}, state, {
        stm: state.stm.rowMouseEnter(action.data)
      })

    case 'FILE_ROW_MOUSE_LEAVE':
      debug('mouse leave')
      return Object.assign({}, state, {
        stm: state.stm.rowMouseLeave(action.data)
      })

    // buffered click
    case 'FILE_ROW_NAME_LEFTCLICK':
      debug(action.type, action.data)
      return Object.assign({}, state, {
        stm: state.stm.rowNameLeftClick(action.data)
      })
  
    // detected double click
    case 'FILE_ROW_NAME_DOUBLECLICK':
      debug(action.type, action.data)
      return Object.assign({}, state, {
        stm: state.stm.rowNameDoubleClick(action.data)
      })

    case 'FILE_ROW_NONNAME_LEFTCLICK':
      debug(action.type, action.data)
      return Object.assign({}, state, {
        stm: state.stm.rowNonnameLeftClick(action.data)
      })

    case 'FILE_ROW_NONNAME_DOUBLECLICK':
      debug(action.type, action.data)
      return Object.assign({}, state, {
        stm: state.stm.rowNonnameDoubleClick(action.data)
      })

    case 'FILE_ROW_RIGHTCLICK':
      debug(action.type, action.data)
      return Object.assign({}, state, {
        stm: state.stm.rowRightClick(action.data) 
      })

    case 'FILE_EDITNAME':
      return Object.assign({}, state, {
        stm: state.stm.setEditing(action.data)
      })
      
		default:
			return state
	}
}

module.exports =  directory;
