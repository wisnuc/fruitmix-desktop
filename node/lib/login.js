import { ipcMain } from 'electron'
import { retrieveUsers } from './server'

ipcMain.on('LOGIN', (event, device, user) => {
  global.dispatch({
    type: 'LOGIN',
    data: { device, user }
  })

  process.nextTick(() => {
    retrieveUsers(device.token.data.token).asCallback((err, users) => {
      if (err) return
      const me = users.friends.find(u => u.uuid === user.uuid)
      if (me) {
        global.dispatch({
          type: 'LOGIN_USER',
          data: me
        })
      }
    })
  })
}
)
