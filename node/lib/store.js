const path = require('path')
const { app } = require('electron')
const { combineReducers, createStore } = require('redux')
const DB = require('./db')

/* reducer: global config */
const config = (state = {}, action) => {
  switch (action.type) {
    case 'CONFIG_INIT':
      return action.data

    case 'CONFIG_UPDATE':
      return action.data

    default:
      return state
  }
}

/* reducer: user config */
const userConfig = (state = {}, action) => {
  switch (action.type) {
    case 'USER_CONFIG_UPDATE':
      return action.data

    default:
      return state
  }
}

const defaultState = {
  state: 'LOGOUT',
  device: null,
  user: null
}

/* reducer: login */
const login = (state = defaultState, action) => {
  if (action.type === 'LOGIN') {
    const dbPath = path.join(app.getPath('appData'), 'wisnuc', 'dbCache')
    const uuid = action.data.user.uuid
    global.DB = new DB(path.join(dbPath, `${uuid}-v1.db`))
    global.DB.initialize(err => err && console.log('initialize db error', err))
  }

  switch (action.type) {
    case 'LOGIN':
      return ({ state: 'LOGIN', device: action.data.device, user: action.data.user })

    case 'LOGOUT':
      return defaultState

    default:
      return state
  }
}

const store = createStore(combineReducers({ config, userConfig, login }))

global.dispatch = action => store.dispatch(action)

module.exports = store
