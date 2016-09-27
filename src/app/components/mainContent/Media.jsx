/**
 * @component media
 * @description media
 * @time 2016-6-25
 * @author liuhua
 **/
  'use strict';
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react';
import { CircularProgress } from 'material-ui';
//import Action
import Action from '../../actions/action';
// import Component 
import M from './MediaImage';

class Media extends Component {
	render() {
		return (
			<div className='all-my-files' style={{height:'100%'}} >
				{this.getContent()}
			</div>
		)
	}

	getContent() {
		if (this.props.state.media.status == 'busy') {
			return (<div className='data-loading '><CircularProgress/></div>)
		}else {
			return (
				<div style={{width:'100%'}} className='mediaContainer' onWheel={this.scrollEvent.bind(this)}>
					{this.props.state.media.data.map((item,index)=>{
						if (index >this.props.state.view.mediaSize) {
							return null
						}
						return <M key={item.hash} item={item} download={this.downloadImage.bind(this,item)}></M>
					})}
				</div>
				)
		}
	}

	downloadImage(item) {
		this.props.dispatch(Action.toggleMedia(true));
		ipc.send('getMediaImage',item);
	}

	scrollEvent() {
		c.log('scroll');
		let dom = document.getElementsByClassName('mediaContainer')[0]
		let sTop = dom.scrollTop;
		let sHeight = dom.scrollHeight;
		let cHeight = dom.clientHeight;
		if (cHeight+sTop == sHeight) {
			if (this.props.state.media.data.length <= this.props.state.media.size) {
				return
			}
			this.props.dispatch(Action.setMediaSize(false));
		}
	}
}

export default Media;