/**
 * @module app
 * @description app main module
 * @time 2016-04-05 12:00
 * @author liuhua
 **/

import Debug from 'debug'
import store from './stores/store'
import { ipcRenderer } from 'electron'

import React from 'react'
import ReactDom from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

//import provider TODO
import { Provider } from 'react-redux'
import Login from './components/login/NewLogin'
import Main from './components/main/Main'

const debug = Debug('main')

// import css
require('../assets/css/app.css')

// required by Material UI
injectTapEventPlugin()

// global import jQuery
global.$ = global.jQuery = global.jQuery || require('jquery')

// root component
const App = () => (
  <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
    { window.store.getState().login.state === 'LOGGEDIN' ? (<Main showAppBar={window.store.getState().view.showAppBar}/>) : <Login /> }
  </MuiThemeProvider>
)

// render method
const render = () => ReactDom.render(<App/>, document.getElementById('app'))

// subscribe render
store.subscribe(() => {
  // console.log(store.getState())
  render()
})

// first render
render()


ipcRenderer.on('stateUpdate',(err,data)=>{
	// mochaState = data
	// Render()
})

ipcRenderer.on('adapter', (err, data) => {
  store.dispatch({
    type: 'NODE_UPDATE',
    data: data
  })
	store.dispatch({
    type: 'ADAPTER',
    store: data
  })
})

// command tick
setInterval(() => {
  if (store.getState().command.length === 0) return
  store.dispatch({ type: 'COMMAND_TICK' })
}, 1000)

// 
ipcRenderer.on('command', (e, {id, err, data}) => {

  console.log(id, err, data)

  store.dispatch({
    type: 'COMMAND_RETURN',
    id, err, data 
  }) 
})

console.log('main module works')
