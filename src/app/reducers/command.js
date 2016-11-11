import { ipcRenderer } from 'electron'
import UUID from 'node-uuid'

/***
op:
{
  cmd: // string
  args: // object
}
***/

class Job { 

  constructor(key, op, callback) {
    this.id = UUID.v4()
    this.key = key
    this.cmd = op.cmd
    this.args = op.args
    this.timeout = op.timeout || 5000 // default timeout 5 seconds
    this.callback = callback
    this.timestamp = new Date().getTime()
  }
  
  abort() {
    if (this.callback) {
      let err = new Error('aborted')
      err.code = 'EABORT'
      this.callback(err)
    }
  }

  isTimeout() {
    new Date().getTime() - this.timestamp > this.timeout 
  }

  timeout() {
    if (this.callback) {
      let err = new Error('timeout')
      err.code = 'ETIMEOUT'
      this.callback(err)
    }
  } 
}

const commander = (state = [], action) => {

  let job, index

  switch (action.type) {
  case 'COMMAND_SEND': 
    job = new Job(action.key, action.op, action.callback)
    ipcRenderer.send('command', job.id, job.op)
    return [...state, job] 

  case 'COMMAND_RETURN':
    index = state.findIndex(job => job.id === action.id)
    if (index === -1) return state
    job = state[index]
    if (job.callback) 
      job.callback(action.err, action.data)

    return [
      ...state.slice(0, index),
      ...state.slice(index + 1)
    ]

  case 'COMMAND_ABORT':
    index = state.findIndex(job => job.id === action.id)     
    if (index === -1) return state
    job = state[index]
    job.abort()
    return [
      ...state.slice(0, index),
      ...state.slice(index + 1)
    ]

  case 'COMMAND_TICK':
    let newState = []     
    state.forEach(job => {
      if (job.isTimeout()) job.timeout() 
      else newState.push(job)
    })
    return newState
  }
}

export default Command

