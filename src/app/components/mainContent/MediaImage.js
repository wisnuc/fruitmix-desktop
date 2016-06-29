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
			return <div><CircularProgress/></div>
		}else {
			return <div style={{cursor:'pointer'}}><img src={this.props.item.path} alt=""/></div>
		}
	}





	componentDidMount() {
		if (this.props.item.status == 'ready') {
			return
		}
		ipc.send('getThumb',this.props.item);
	}

}
export default Media;