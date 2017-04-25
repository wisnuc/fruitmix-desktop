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
import MDNS from './lib/mdns'
import { command } from './lib/command'

import { teal500 } from 'material-ui/styles/colors'

import Main from './main'

const debug = Debug('app')

// start mdns scan
const mdns = MDNS(ipcRenderer, store)
mdns.scan()

// import css
require('../assets/css/app.css')

// required by Material UI
injectTapEventPlugin()

// global import jQuery
global.$ = global.jQuery = global.jQuery || require('jquery')

global.theme = getMuiTheme({ 
  fontFamily: 'Roboto, Noto Sans SC, sans-serif',
  palette: {
    primary1Color: teal500
  }
})

// root component
const App = () => <MuiThemeProvider muiTheme={theme}><Main /></MuiThemeProvider>

// render method
const render = () => ReactDom.render(<App/>, document.getElementById('app'))

// subscribe render
store.subscribe(() => { render() })

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

  store.dispatch({
    type: 'COMMAND_RETURN',
    id, err, data 
  }) 
})

ipcRenderer.on('CONFIG_LOADED', (event, config) => {

  console.log('CONFIG_LOADED', config)
})

// document.addEventListener('dragenter', (e) => {
//   console.log('....drag.....')
//   e.preventDefault()
// })

document.addEventListener('dragover', (e) => {
  e.preventDefault()
})

document.addEventListener('drop', (e) => {
  e.preventDefault()
})

debug('fruitmix app module loaded')

global.$ = global.jQuery = global.jQuery || require('jquery')

// first render
render()

