  /**
   * @module app
   * @description app main module
   * @time 2016-04-05 12:00
   * @author liuhua
   **/
   
//import core module
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
 import CSS from './utils/transition'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

// global import jQuery
global.$ = global.jQuery = global.jQuery || require('jquery')

var {ipcRenderer} = require('electron')
window.ipc = ipcRenderer
//import css
require('../assets/css/app.css')
//import component
import Login  from'./components/login/Login'// login
import Main from './components/main/Main'//main


//import store
import configureStore from './stores/store'
const store = configureStore()

window.c = console
window.onresize = function() {
	store.dispatch({type:''})
}
//APP component
var App = React.createClass({
	render: function(){
		console.log('render >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
		let state = store.getState()
		let isLogin = state.login.state == 'LOGGEDIN'?true:false
		return(
			<Provider store={store}>
				<div className="app">	
						{isLogin && <Main/>}
						{!isLogin && <Login state={state} dispatch={store.dispatch}/>}	
				</div>
			</Provider>
			)
	},
})

// define dom node
var appMountElement = document.getElementById('app')

//define render function
var Render = () =>{
	render(<App></App>,appMountElement)
};

//render
Render()

//subscribe store change
store.subscribe(()=>{
	Render()
})








