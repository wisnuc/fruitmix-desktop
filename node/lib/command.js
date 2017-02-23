import Debug from 'debug'
import { ipcMain } from 'electron'
import taskFactory from './commandTaskCreater'
const debug = Debug('lib:command')

let commandMap = new Map()

// evt: electron ipc event, holding sender
// id: should be uuid, identifying the command instance
// op: operation, has cmd and args as props

ipcMain.on('command', (evt, id, op) => {
  let task = taskFactory(evt, id, op, commandMap)
  task.isIDExist()
})
/*
ipcMain.on('command', (evt, id, op) => {

  debug('incoming', id, op)

  // if id is not provided, the command does not need a reply
  if (!id) {
    let handler = commandMap.get(op.cmd)
    if (handler) {
      handler(op.args, (err, data) => {
        debug('command no reply', op, err, data)    
      })
    }
    return    
  }

  // find handler
  let handler = commandMap.get(op.cmd)

  if (handler) {
    handler(op.args, (err, data) => {
      debug('reply', id, err && err.message, data)
      if (err) {
        debug('command handler error', err)
        evt.sender.send('command', { 
          id, 
          err: {
            code: err.code,
            message: err.message
          } 
        })
      }
      else 
        evt.sender.send('command', { id, data })
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
})
*/

// key: command name, cmd
// val: function (handler)
const registerCommandHandlers = map => {
  debug('register command handlers', map)
  map.forEach((val, key) => commandMap.set(key, val))
}

export default registerCommandHandlers

console.log('commandHandler module loaded')

