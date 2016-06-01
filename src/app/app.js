  /**
   * @module app
   * @description app main module
   * @time 2016-04-05 12:00
   * @author liuhua
   **/
   
//import core module
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux'
import { Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
 import CSS from './utils/transition';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

// global import jQuery
global.$ = global.jQuery = global.jQuery || require('jquery');

//import css
require('../assets/css/app.css');

//import component
import Login  from'./components/login/Login';// login
import NoFondPath  from'./components/404';//404
import Main from './components/main/Main';//main


//import store
import configureStore from './stores/store';
const store = configureStore();

//APP component
var App = React.createClass({
	render() {
		return(
			<div className="app" onselectstart="return false">
				<CSS opts={['app',true,true,true,500,5000,5000]}>
					{this.props.children}
				</CSS>
			</div>
			)
	},
});

//router
var routes = (
	<Provider store={store}>
		<Router history={hashHistory}>
			<Route path="/" component={App}>
		    		<Route key='login' path="login" component={Login}/>
		    		<Route key='main' path='main' component={Main}/>
		    		<Route key='*'path="*" component={NoFondPath}/>
		    		<IndexRoute key='login' component={Login}/>
		    	</Route>
		</Router>
	</Provider>
	);

// define dom node
var appMountElement = document.getElementById('app');

//define render function
var Render = () =>{
	render(routes,appMountElement);
};

//render
Render();








