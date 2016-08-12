/**
 * @component Setting
 * @description Setting
 * @time 2016-5-30
 * @author liuhua
 **/
  'use strict';
// require core module
 import React, { findDOMNode, Component, PropTypes } from 'react';

 class Setting extends Component {
 	render() {
 		return (
 			<div className='setting-container'>
	 			<div className='setting-download'>
	 				<span>下载内容保存位置 : </span>
	 				<input className='change-path-text' type="text" value={this.props.state.setting.download}/>
	 				<input className='change-path-button' type="button" value='修改' onClick={this.changeDownloadPath.bind(this)}/>
	 			</div>
 			</div>
 			)
 	}

 	changeDownloadPath() {
 		ipc.send('changeDownloadPath');
 	}
 }


export default Setting;