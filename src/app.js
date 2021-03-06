import React from 'react'
import ReactDom from 'react-dom'
import { ipcRenderer, remote } from 'electron'
import injectTapEventPlugin from 'react-tap-event-plugin'
import i18n from 'i18n'

import MDNS from './common/mdns'
import Fruitmix from './Fruitmix'

/* modify debug filter before application starts' */
localStorage.debug = '*component*'

/* i18n config */

const lang = navigator.language
i18n.configure({
  updateFiles: false,
  locales: ['en-US', 'zh-CN'],
  directory: remote.require('path').resolve('locales'),
  defaultLocale: /zh/.test(lang) ? 'zh-CN' : 'en-US'
})

/* required by Material UI */
injectTapEventPlugin()

/* render method */
const render = () => ReactDom.render(React.createElement(Fruitmix), document.getElementById('app'))

/* start mdns scan */
global.mdnsStore = []
global.mdns = MDNS(ipcRenderer, global.mdnsStore, render)
global.mdns.scan()

/* set useCapture true to prevent possible losting event */
window.addEventListener('dragover', e => e.preventDefault(), true)
window.addEventListener('drop', e => e.preventDefault(), true)

/* render after config loaded */
ipcRenderer.on('CONFIG_UPDATE', (event, config) => {
  console.log('CONFIG_UPDATE', config)
  global.config = config
  if (config.global && config.global.locales) i18n.setLocale(config.global.locales)
  else i18n.setLocale(/zh/.test(lang) ? 'zh-CN' : 'en-US')
  render()
})
