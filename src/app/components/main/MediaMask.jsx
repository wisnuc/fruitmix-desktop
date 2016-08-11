/**
 * @component mediaMsk
 * @description mediaMask
 * @time 2016-6-28
 * @author liuhua
 **/

 'use strict';
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react';
import { CircularProgress } from 'material-ui';
//import Action
import Action from '../../actions/action';

class Mask extends Component {
	render() {
		let style = {
			height:'100%',
			display:this.props.state.media.currentMediaImage.open?'block':'none'
		} 
		return (
			<div className='media-mask' style={style}>
			<span className='media-mask-close' onClick={this.close.bind(this)}>关闭</span>
			{this.getMediaImage()}
			</div>
			)
	}

	getMediaImage() {
		if (this.props.state.media.currentMediaImage.status == 'notReady') {
			return <CircularProgress/>
		}else {
			// let item  = this.props.state.media.currentMediaImage;
			// let width = document.body.clientWidth;
			// let height = document.body.clientHeight;
			// let scale = width/height;
			// let imageScale = item.width/item.height;
			let style = {};
			// if (item.width < width && item.height < height) {
			// 	console.log(item);
			// 	c.log(width);
			// 	c.log(height);
			// 	style = {marginTop:height/2+'px',marginLeft:width/2+'px',transform:'translate('+(-item.width/2)+'px,'+(-item.height/2)+'px)'};
			// }else {
			// 	c.log('2');
			// 	if (imageScale > scale) {
			// 		style = {maxWidth:'90%'};
			// 	}else {
			// 		style = {maxHeight:'90%'};
			// 	}	
			// }
			
			return <img style={style} className='media-mask-image' src={this.props.state.media.currentMediaImage.path} alt=""/>
		}
	}

	close() {
		this.props.dispatch(Action.toggleMedia(false));
	}
}

function mapStateToProps (state) {
	return {
		media: state.media,
	}
}

export default Mask