var path = require('path')

/**
> { ip: '192.168.5.144',
  savePassword: false,
  autoLogin: false,
  username: null,
  password: null,
  customDevice: [],
  download: '/home/ma/review/fruitmix-desktop/download' }

  {  ip:'',
  savePassword:false,
  autoLogin:false,
  username:null,
  password:null,
  customDevice:[],
  download: downloadPath}
**/

const defaultState = {
  ip: '',
  savePassword: false,
  autoLogin: false,
  username: null,
  password: null,
  customDevice: [],
  download: path.join(process.cwd(), 'download')
}

module.exports = (state = defaultState, action) => {

  switch (action.type) {
  case 'CONFIG_INIT':
    return action.data

  case 'CONFIG_SET_IP':
    return Object.assign({}, state, { ip: action.data })

  case 'CONFIG_ADD_CUSTOM_DEVICE':
    return Object.assign({}, state, {
      customDevice: [...state.customDevice, action.data]
    })
  
  case 'CONFIG_DELETE_CUSTOM_DEVICE':
    let address = action.data 
    let index = state.customDevice.findIndex(dev => dev.address === address)
    return index === -1 ? state :
      Object.assign({}, state, {
        customDevice: [
          ...state.customDevice.slice(0, index),
          ...state.customDevice.slice(index + 1) 
        ]
      })

  case 'CONFIG_SET_DOWNLOAD_PATH':
    return Object.assign({}, state, {
      download: action.data
    })

  default:
    return state
  }
}

