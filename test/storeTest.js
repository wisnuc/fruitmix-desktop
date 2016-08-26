//import core module
var React = require('react')
var reactDom = require('react-dom')
var render = reactDom.render

var ele  = require('electron')
var ipcRenderer = ele.ipcRenderer

var App = React.createClass({
	
	render: function(){
		return (
			<div></div>
			)
	}
})

// define dom node
var appMountElement = document.getElementById('test')

var render = function() {
	render(<App></App>,appMountElement)
}
