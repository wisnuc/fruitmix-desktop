/**
 * @author liuhua
 * @time 2016-4-5
 * @description 404页面
**/

'use strict';

// require core module
var React = require('react');
import { Link } from 'react-router'
var ImageModules = require('./Mixins/ImageModules');

require('../../assets/css/404.css');

// define about component
var NofondPage = React.createClass({

	mixins: [ ImageModules ],
	
	render() {
		return (
			<div className="noFondPage bg">
				<div className="cont">
					<div className="c1"><img src={ this.defineImageModules()['not-found'] } className="img1" /></div>
					<h2>哎呀…您访问的页面不存在</h2>
					<div className="c2">
					<Link to="/index" activeClassName="active" activeStyle={{color: '#c00'}}>index</Link>
						<a href="#/index" className="re">返回</a>
						<a href="#/index" className="home">网站首页</a>
						<a href="#" className="sr">搜索一下页面相关信息</a>
					</div>
					<div className="c3">
						<a href="#" className="c3">ME</a>
						提醒您 - 您可能输入了错误的网址，或者该网页已删除或移动
					</div>
				</div>
			</div>
		);
	}
});

// export NofondPage component
module.exports = NofondPage;