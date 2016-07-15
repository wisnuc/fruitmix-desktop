/**
 * @component Setting
 * @description Setting
 * @time 2016-5-30
 * @author liuhua
 **/
  'use strict';
// require core module
 import React, { findDOMNode, Component, PropTypes } from 'react';
 import { connect, bindActionCreators } from 'react-redux';

 class Setting extends Component {
 	render() {
 		return (
 			<div className='setting-container'>
	 			<div className='setting-download'>
	 				<span>下载内容保存位置 : </span>
	 				<input type="text" value={this.props.setting.download}/>
	 				<input type="button" value='修改' onClick={this.changeDownloadPath.bind(this)}/>
	 			</div>
 			</div>
 			)
 	}

 	changeDownloadPath() {
 		ipc.send('changeDownloadPath');
 	}
 }

function mapStateToProps (state) {
	return {
		setting: state.setting
	}
}

export default connect(mapStateToProps)(Setting);