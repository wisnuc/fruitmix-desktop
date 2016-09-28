/**
 * @component mediaComponent
 * @description mediaComponent
 * @time 2016-6-25
 * @author liuhua
 **/
 'use strict';
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react';
import { CircularProgress } from 'material-ui';

// import Component 
class Media extends Component {
	render() {
		return (
			<div className='media-image' onClick={this.props.download}>
			{this.getImageContent()}
			</div>
			)
	}

	getImageContent() {
		if (this.props.item.status == 'notReady') {
			return <div className='media-loading'></div>
		}else {
			return <img style={{cursor:'pointer'}} src={this.props.item.path} alt=""/>
		}
	}

	componentDidMount() {
		if (this.props.item.status == 'ready') {
			return	
		}
		return;
		ipc.send('getThumb',this.props.item);
	}

}
export default Media;