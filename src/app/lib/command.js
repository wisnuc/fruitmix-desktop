import store from '../stores/store'
const debug = require('debug')('lib:command')

// obsolete
export const sendCommand = (key, op, callback) => {
  debug('sendCommand', key, op, callback)
  store.dispatch({
    type: 'COMMAND_SEND',
    key, op, callback
  })
}

export const command = (key, cmd, args, callback) => {
  debug('command', key, cmd, args, callback)
  store.dispatch({
    type: 'COMMAND_SEND',
    key,
    op: { cmd, args },
    callback
  })
}
