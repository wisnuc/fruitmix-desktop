import { ipcMain } from 'electron'
import { retrieveUsers } from './server'

ipcMain.on('LOGIN', (event, device, user) => {
  global.dispatch({
    type: 'LOGIN',
    data: { device, user }
  })

  /* save last Device info */
  const lastDevice = device.mdev
  global.configuration.updateGlobalConfigAsync({ lastDevice }).catch(e => console.log(e))

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
