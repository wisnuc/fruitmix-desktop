/**
 * @component multiple
 * @description multiple
 * @time 2016-5-11
 * @author liuhua
 **/

   'use strict';
  // require core module
 import React, { findDOMNode, Component, PropTypes } from 'react';
 import { connect, bindActionCreators } from 'react-redux';

 class Multiple extends Component {
 	render() {
 		let style = this.getPositon();
 		return(
 			<div style={style}>

 			</div>
 			);
 	}

 	getPositon() {
 		let mul = this.props.multiple.multiple;
 		if (mul.isShow) {
 			let startX,startY,width,height;
 			startX= Math.min(mul.left,mul.width);
 			startY = Math.min(mul.top,mul.height);
 			width = Math.abs(mul.left-mul.width);
 			height = Math.abs(mul.top-mul.height);
 			var dom = document.getElementsByClassName('file-area')[0]
 			return {
 				position:'absolute',
 				left:startX,
 				top:startY,
 				width:width,
 				height:height,
 				border:'solid 1px rgba(0,0,0,.1)',
 				zIndex:999,
 				boxSizing:'border-box',
 				backgroundColor:'rgba(0,0,0,.1)'
 			}
 		}else {
 			return {display:'none'};
 		}
 	}


 }

 function mapStateToProps (state) {
	return {
		data: state.data,
		multiple:state.multiple
	}
}

 export default connect(mapStateToProps)(Multiple);