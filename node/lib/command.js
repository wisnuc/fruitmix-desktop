import Debug from 'debug'
import { ipcMain } from 'electron'
const debug = Debug('lib:command')

let commandMap = new Map()

const commandHandler = (evt, id, op) => {

  debug('incoming', id, op)

  let handler = commandMap.get(op.cmd)
  if (handler) {
    handler(op.args, (err, data) => {
      debug('reply', id, err && err.message, data)
      evt.sender.send('command', { id, err, data })
    })
  }
  else {
    debug('reply command handler not found', id, op)
    evt.sender.send('command', { 
      id,
      err: {
        code: 'ENOCOMMAND',
        message: `command ${op.cmd} not found`
      },
    })
  }
}

ipcMain.on('command', commandHandler)

// key: command name, cmd
// val: function (handler)
const registerCommandHandlers = map => 
  map.forEach((val, key) => commandMap.set(key, val))

export default registerCommandHandlers

console.log('commandHandler module loaded')
