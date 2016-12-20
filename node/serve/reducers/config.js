var path = require('path')

const defaultState = {
  ip: '',
  download: global.downloadPath}

module.exports = (state = defaultState, action) => {

  switch (action.type) {
  case 'CONFIG_INIT':
    return action.data

  case 'CONFIG_SET_IP':
    return Object.assign({}, state, { ip: action.data })

  case 'CONFIG_SET_DOWNLOAD_PATH':
    return Object.assign({}, state, {
      download: action.data
    })

  default:
    return state
  }
}

