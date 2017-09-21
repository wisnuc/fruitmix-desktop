import { ipcMain } from 'electron'

ipcMain.on('LOGIN', (event, device, user) => {
  global.dispatch({ type: 'LOGIN', data: { device, user } })

  /* save last Device info */
  const lastDevice = device.mdev
  global.configuration.updateGlobalConfigAsync({ lastDevice }).catch(e => console.log(e))
})

ipcMain.on('LOGOUT', () => {
  global.dispatch({ type: 'LOGOUT' })
})
