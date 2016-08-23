  /**
   * @module app
   * @description app main module
   * @time 2016-04-05 12:00
   * @author liuhua
   **/
   
//import core module
import React from 'react'
import { render } from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'

import { ipcRenderer } from 'electron'
window.ipc = ipcRenderer

//import component
import Login  from'./components/login/Login'// login
import Main from './components/main/Main'//main


// global import jQuery
global.$ = global.jQuery = global.jQuery || require('jquery')

//import css
require('../assets/css/app.css')

//import store
import configureStore from './stores/store'

const store = configureStore()

injectTapEventPlugin()

var storeLock = false

var waitForRender = null

window.c = console

window.onresize = function() {
	// store.dispatch({type:''})
}

window.mocha = false

window.mochaState = store.getState()

if (mocha) {
	window.dispatch = (action)=>{ipc.send('dispatch',action)}
}else {
	window.dispatch = (action)=>{store.dispatch(action)}
}

//APP component
var App = React.createClass({
	render: function(){
		let state = store.getState()
		let isLogin 
		if (mocha) {
			isLogin = mochaState.login.state == 'LOGGEDIN'?true:false
		}else {
			isLogin = state.login.state == 'LOGGEDIN'?true:false
		}
		return(
				<div className="app">	
						{/*<button onClick={this.save}>store</button>*/}
						{isLogin && <Main state={mocha?mochaState:state} dispatch={dispatch}/>}
						{!isLogin && <Login state={mocha?mochaState:state} dispatch={dispatch}/>}	
						{/*<div onClick={this.submit}>submit>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>></div>*/}
				</div>
			)
	},

	save : function () {
		ipc.send('store', store.getState())
	}
})

// define dom node
var appMountElement = document.getElementById('app')

//define render function
var Render = () =>{
	render(<App></App>,appMountElement)
}

//render
Render()

//subscribe store change
store.subscribe(()=>{
	if (storeLock) {
		clearTimeout(waitForRender)
		waitForRender = setTimeout(()=>{storeLock = false;Render()},50)
	}else {
		Render()
		storeLock = true
		waitForRender = setTimeout(()=>{storeLock = false},50)
	}
	
})

var clearLock = ()=>{
	return setTimeout(()=>{storeLock = false; Render()},50)
}

ipc.on('stateUpdate',(err,data)=>{
	mochaState = data
	Render()
})








