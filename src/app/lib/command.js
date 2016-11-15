import Debug from 'debug'
import { store } from '../stores/store'

const debug = Debug('lib:command')

const sendCommand = (key, op, callback) => {

  debug('sendCommand', key, op, callback)

  store.dispatch({
    type: 'COMMAND_SEND',
    key, op, callback
  })
}

export { sendCommand }
