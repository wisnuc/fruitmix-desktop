import path from 'path'
import DataStore from 'nedb'

const defaultState = {
  state: 'LOGOUT',
  device: null,
  user: null
}

const login = (state = defaultState, action) => {
  // logged in listener
  if (action.type === 'LOGIN') {
    db.uploading = new DataStore({filename: path.join('dbCache', action.data.user.uuid + 'uploading.db'), autoload: true})
    db.uploaded = new DataStore({filename: path.join('dbCache', action.data.user.uuid + 'uploaded.db'), autoload: true})
    db.downloading = new DataStore({filename: path.join('dbCache', action.data.user.uuid + 'downloading.db'), autoload: true})
    db.downloaded = new DataStore({filename: path.join('dbCache', action.data.user.uuid + 'downloaded.db'), autoload: true})
    db.uploading.find({}, (err, data) => console.log('uploading count is : ' + data.length))
    db.uploaded.find({}, (err, data) => console.log('uploaded count is : ' + data.length))
    db.downloading.find({}, (err, data) => console.log('downloading count is : ' + data.length))
    db.downloaded.find({}, (err, data) => console.log('downloaded count is : ' + data.length))
  }
  switch(action.type) {
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

