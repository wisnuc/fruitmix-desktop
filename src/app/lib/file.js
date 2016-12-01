import UUID from 'node-uuid'
import validator from 'validator'
import { sendCommand } from './command'

/**
  children: [], // redundant
  current: {
    context: 
    children: []
    directory: // self
    path: []
  }

  view: {
    selectAll:    // computed state, front-end
    state: 'xxxx' //
    jobId: xxxxx  //
    selected: []  // 
  }
**/

// 1. change/maintain view state
export const fileNav = (context, target) => {

  if (context !== 'HOME_DRIVE')
    return

  if (target === null) {}
  else if (typeof target !== 'string' || !validator.isUUID(target)) {
    return // error
  }

  let key = UUID.v4() 

  sendCommand(key, {
    cmd: 'FILE_NAV',
    args: {
      context: 'HOME_DRIVE',
      target: target
    }
  }) /** err => {

    // TODO if error, may snackbar message
    if (err) { // fail 
      let state
      setImmediate(() => 
        dispatch({
          type: 'FILE_NAV_STOP',
          success: false
        }))
    }
    else { // sucess
      setImmediate(() => 
        dispatch({
          type: 'FILE_NAV_STOP',
          success: true
        }))
    }
  })
  **/

  setImmediate(() => 
    window.store.dispatch({
      type: 'FILE_NAV_START',
      job: key
    }))
}

export const fileCreateNewFolder = (key, target, name, callback) => {
  sendCommand(key, {
    cmd: 'FILE_CREATE_NEW_FOLDER',
    args: { target, name }, 
  }, callback) 
}




