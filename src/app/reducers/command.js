import Debug from 'debug'
import { ipcRenderer } from 'electron'
import jobFactory from './commandJobCreater'

const debug = Debug('reducer:command')

const command = (state = [], action) => {

  let job, index, newState

  switch (action.type) {
  case 'COMMAND_SEND': 
    if (!action.callback) {
      ipcRenderer.send('command', null, action.op)
      return state
    }

    job = jobFactory(action.key, action.op, action.callback)
    ipcRenderer.send('command', job.id, action.op)
    newState = [...state, job] 
    
    debug('COMMAND_SEND', newState)
    return newState

  case 'COMMAND_RETURN':
    index = state.findIndex(job => job.id === action.id)
    if (index === -1) return state
    job = state[index]
    if (job.callback) 
      job.callback(action.err, action.data)

    newState =  [
      ...state.slice(0, index),
      ...state.slice(index + 1)
    ]
    
    debug('COMMAND_RETURN', newState)
    return newState

  case 'COMMAND_ABORT':
    index = state.findIndex(job => job.id === action.id)     
    if (index === -1) return state
    job = state[index]
    job.abort()
    newState = [
      ...state.slice(0, index),
      ...state.slice(index + 1)
    ]
    
    debug('COMMAND_ABORT', newState)
    return newState

  case 'COMMAND_TICK':

    newState = []     
    state.forEach(job => {
      if (job.isTimeout()) {
        job.fireTimeout() 
      }
      else 
        newState.push(job)
    })

    debug('COMMAND_TICK')
    return newState

  default:
    return state
  }
}

export default command
