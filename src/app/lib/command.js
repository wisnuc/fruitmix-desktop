import store from '../store/store'

const sendCommand = (key, op, callback) => {
  store.dispatch({
    type: 'COMMAND_SEND',
    key, op, callback
  })
}

export { sendCommand }
