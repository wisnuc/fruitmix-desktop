/**
 * @component Detail
 * @description Detail
 * @time 2016-5-10
 * @author liuhua
 **/
  'use strict';
  // require core module
 import React, { findDOMNode, Component, PropTypes } from 'react';
 //require material
import { Paper, Menu, MenuItem,RaisedButton } from 'material-ui';
//import Action
import Action from '../../actions/action';

 class Detail extends Component {
 	render() {
 		let data = this.props.state.isShow.detail[0];

 		if (data) {
 			 		let style = {
			 			height: (document.body.clientHeight-64)+'px',
			 			width:data.length==0?'0px':'350px',
			 			padding:data.length==0?'0px':'10px 20px'
			 		}
 			return(
	 			<div style={style} className='detail-container'>
	 				<div>类型&nbsp;&nbsp;:&nbsp;&nbsp;{data.type?data.type=='folder'?'文件夹':'文件':null}</div>
	 				<div>大小&nbsp;&nbsp;:&nbsp;&nbsp;{data.type=='folder'?null:(this.getSize(data.attribute.size)||null)}</div>
	 				<div title={data.path||null}>位置&nbsp;&nbsp;:&nbsp;&nbsp;{data.path||null}</div>
	 				<div>所有者&nbsp;&nbsp;:&nbsp;&nbsp;{this.getOwner(data.owner)||null}</div>
	 				<div>上传时间&nbsp;&nbsp;:&nbsp;&nbsp;{data.attribute.createtime||null}</div>
	 				<div>修改时间&nbsp;&nbsp;:&nbsp;&nbsp;{data.attribute.changetime||null}</div>
	 				<RaisedButton label="close" onMouseUp={this.closeDetail.bind(this)} className='detail-close'/>
	 			</div> 
	 			)
 		}else {
 			return false
 		}
 	}

 	closeDetail() {
 		this.props.dispatch(Action.cleanDetail());
 	}
 	getOwner(owner) {
 		let o = this.props.state.login.obj.allUser.find(item=>{
 			return item.uuid = owner
 		});
 		if (o != undefined) {
 			return o.username
 		}else {
 			return false
 		}
 	}
 	getSize(size) {
		size = parseFloat(size);
		if (size < 1024) {
			return size.toFixed(2)+' B'
		}else if (size < 1024*1024) {
			return (size/1024).toFixed(2)+' KB'
		}else if(size<1024*1024*1024) {
			return (size/1024/1024).toFixed(2)+ ' M'
		}else {
			return (size/1024/1024/1024).toFixed(2)+ ' G'
		}
	}
 }

function mapStateToProps (state) {
	return {
		isShow: state.isShow,
		login: state.login
	}
}

 export default Detail;