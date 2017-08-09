import React from 'react'
import ReactDom from 'react-dom'
import Debug from 'debug'
import { ipcRenderer } from 'electron'

import injectTapEventPlugin from 'react-tap-event-plugin'
import MDNS from './common/mdns'
import Fruitmix from './Fruitmix'

import '../assets/css/mdc.theme.css'
import '../assets/css/mdc.button.css'
import '../assets/css/app.css'

/* modify debug filter before application starts' */
const debug = Debug('app')
localStorage.debug = '*component*'

/* required by Material UI */
injectTapEventPlugin()

/* render method */
const render = () => ReactDom.render(<Fruitmix />, document.getElementById('app'))

/* start mdns scan */
global.mdnsStore = []
global.mdns = MDNS(ipcRenderer, global.mdnsStore, render)
global.mdns.scan()

document.addEventListener('dragover', (e) => {
  e.preventDefault()
})

document.addEventListener('drop', (e) => {
  e.preventDefault()
})

/* load config and first render */
ipcRenderer.on('CONFIG_LOADED', (event, config) => {
  console.log('CONFIG_LOADED', config)
  global.config = config
  render()
})

