import { ipcMain } from 'electron'

ipcMain.on('LOGIN', (event, device, user) => {
  global.dispatch({ type: 'LOGIN', data: { device, user } })

  /* save last Device info */
  const lastDevice = device.mdev
  global.configuration.updateGlobalConfigAsync({ lastDevice }).catch(e => console.log(e))
  global.configuration.updateUserConfigAsync(user.uuid, { saveToken: lastDevice.saveToken }).catch(e => console.log(e))
})

ipcMain.on('LOGOUT', () => {
  global.dispatch({ type: 'LOGOUT' })
})

ipcMain.on('UPDATE_USER_CONFIG', (event, userUUID, data) => {
  global.configuration.updateUserConfigAsync(userUUID, data).catch(e => console.log(e))
})
