import Debug from 'debug'
import { ipcMain } from 'electron'
import taskFactory from './commandTaskCreater'
const debug = Debug('lib:command')

const commandMap = new Map()

// evt: electron ipc event, holding sender
// id: should be uuid, identifying the command instance
// op: operation, has cmd and args as props

ipcMain.on('command', (evt, id, op) => {
  const task = taskFactory(evt, id, op, commandMap)
  if (task) task.isIDExist()
  else console.log("command don't have handle")
})

// key: command name, cmd
// val: function (handler)
const registerCommandHandlers = (map) => {
  map.forEach((val, key) => commandMap.set(key, val))
}

export default registerCommandHandlers
