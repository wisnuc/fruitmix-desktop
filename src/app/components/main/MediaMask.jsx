/**
 * @component mediaMsk
 * @description mediaMask
 * @time 2016-6-28
 * @author liuhua
 **/

 'use strict';
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { CircularProgress } from 'material-ui';
//import Action
import Action from '../../actions/action';

class Mask extends Component {
	render() {
		let style = {
			minHeight:document.body.clientHeight+'px',
			display:this.props.media.currentMediaImage.open?'block':'none'
		}
		return (
			<div className='media-mask' style={style}>
			<span className='media-mask-close' onClick={this.close.bind(this)}>close</span>
			{this.getMediaImage()}
			</div>
			)
	}

	getMediaImage() {
		if (this.props.media.currentMediaImage.status == 'notReady') {
			return <CircularProgress/>
		}else {
			return <img className='media-mask-image' src={this.props.media.currentMediaImage.path} alt=""/>
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

export default connect(mapStateToProps)(Mask)