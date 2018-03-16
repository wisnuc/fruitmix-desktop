const { ipcMain } = require('electron')

/*  Config will update 4 times:
 *    init: before LOGIN, get all kind of app path, get lastDevice info
 *    Login: update current device and user info
 *    update last device: updateGlobalConfigAsync({ lastDevice })
 *    update saved Token: updateUserConfigAsync(user.uuid, { saveToken: lastDevice.saveToken })
 */

ipcMain.on('LOGIN', (event, device, user) => {
  global.dispatch({ type: 'LOGIN', data: { device, user } })

  /* save last Device info */
  const lastDevice = device.mdev
  global.configuration.updateGlobalConfigAsync({ lastDevice })
    .catch(e => console.error('updateGlobalConfigAsync error', e))

  if (lastDevice.saveToken !== undefined) {
    global.configuration.updateUserConfigAsync(user.uuid, { saveToken: lastDevice.saveToken })
      .catch(e => console.error('updateUserConfigAsync error', e))
  }
})

ipcMain.on('LOGOUT', () => {
  global.dispatch({ type: 'LOGOUT' })
})

ipcMain.on('UPDATE_USER_CONFIG', (event, userUUID, data) => {
  global.configuration.updateUserConfigAsync(userUUID, data)
    .catch(e => console.error('updateUserConfigAsync error', e))
})
