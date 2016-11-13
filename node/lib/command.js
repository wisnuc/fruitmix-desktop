import Debug from 'debug'
const debug = Debug('lib:command')

let commandMap = new Map()

export const commandHandler = (evt, id, op) => {

  let handler = commandMap.get(op.cmd)
  if (handler) {
    handler(op.args, (err, data) => 
      evt.sender.send('command', { id, err, data }))
  }
  else {
    evt.sender.send('command', { 
      id,
      err: {
        code: 'ENOCOMMAND',
        message: `command ${op.cmd} not found`
      },
    })
  }
}

// key: command name, cmd
// val: function (handler)
const registerCommandHandlers = map => 
  map.forEach((val, key) => commandMap.set(key, val))

export default registerCommandHandlers

console.log('commandHandler module loaded')
