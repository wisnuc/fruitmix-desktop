import path from 'path'
import DataStore from 'nedb'
import { app } from 'electron'

const defaultState = {
  state: 'LOGOUT',
  device: null,
  user: null
}

const login = (state = defaultState, action) => {
  // logged in listener
  if (action.type === 'LOGIN') {
    const dbPath = path.join(app.getPath('appData'), 'wisnuc', 'dbCache')
    const uuid = action.data.user.uuid
    global.db.uploading = new DataStore({ filename: path.join(dbPath, `${uuid}uploading.db`), autoload: true })
    global.db.uploaded = new DataStore({ filename: path.join(dbPath, `${uuid}uploaded.db`), autoload: true })
    global.db.downloading = new DataStore({ filename: path.join(dbPath, `${uuid}downloading.db`), autoload: true })
    global.db.downloaded = new DataStore({ filename: path.join(dbPath, `${uuid}downloaded.db`), autoload: true })
    /*
    global.db.uploading.find({}, (err, data) => console.log(`uploading count is : ${data.length}`))
    global.db.uploaded.find({}, (err, data) => console.log(`uploaded count is : ${data.length}`))
    global.db.downloading.find({}, (err, data) => console.log(`downloading count is : ${data.length}`))
    global.db.downloaded.find({}, (err, data) => console.log(`downloaded count is : ${data.length}`))
    */
  }
  switch (action.type) {
    case 'LOGIN':
      return {
        state: 'LOGIN',
        device: action.data.device,
        user: action.data.user
      }

    case 'LOGIN_USER':
      return Object.assign({}, state, {
        user: Object.assign({}, state.user, action.data)
      })

    case 'LOGOUT':
      return defaultState

    default:
      return state
  }
}

export default login
