import { store } from '../stores/store'

const sendCommand = (key, op, callback) => {
  console.log('sendCommand', key, op, store)
  store.dispatch({
    type: 'COMMAND_SEND',
    key, op, callback
  })
}

export { sendCommand }
