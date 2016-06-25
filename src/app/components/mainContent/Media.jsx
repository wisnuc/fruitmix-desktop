/**
 * @component media
 * @description media
 * @time 2016-6-25
 * @author liuhua
 **/
  'use strict';
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { CircularProgress } from 'material-ui';
// import Component 
import M from './MediaImage';

class Media extends Component {
	render() {
		return (
			<div className='all-my-files' style={{height:(document.body.clientHeight-64)+'px'}} >
				{this.getContent()}
			</div>
		)
	}
	getContent() {
		if (this.props.media.status == 'busy') {
			return (<div className='data-loading '><CircularProgress/></div>)
		}else {
			return (
				<div style={{width:'100%'}}>
					{this.props.media.data.map(item=>{
						return <M key={item.hash} item={item}></M>
					})}
				</div>
				)
		}
	}
}

function mapStateToProps (state) {
	return {
		media: state.media,
	}
}

export default connect(mapStateToProps)(Media);