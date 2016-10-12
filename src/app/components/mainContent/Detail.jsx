/**
 * @component Detail
 * @description Detail
 * @time 2016-5-10
 * @author liuhua
 **/
  'use strict';
  // require core module
 import React, { findDOMNode, Component, PropTypes } from 'react'
 //require material
import { Paper, Menu, MenuItem, Checkbox } from 'material-ui'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton'
import ActionFavorite from 'material-ui/svg-icons/action/favorite'
//import Action
import Action from '../../actions/action'

const styles = {
	radioIconStyle : {fill:'#5766bd',marginBottom:'20px'},
	radioLabelStyle : {marginLeft:'-10px'},
	buttonStyle : {position:'absolute',left:'0px'}
}

class Detail extends Component {
 	constructor(props) {
 		super(props)
 		this.state = {type:'custom',arr:[]}
 	}

 	render() {
 		c.log(this.state.type)
 		c.log(this.state.arr)
 		var _this = this
 		let data = this.props.state.view.detail[0];

 		if (data) {
 			 	let style = {
			 		height: (document.body.clientHeight-64)+'px',
			 		width:data.length==0?'0px':'220px'
			 	}
 			return(
	 			<div style={style} className='detail-container'>
	 				<div className='file-infor'>
	 					<div className='detail-title'>文件信息</div>
	 					<div>类型&nbsp;&nbsp;:&nbsp;&nbsp;{data.type?data.type=='folder'?'文件夹':'文件':null}</div>
		 				<div>大小&nbsp;&nbsp;:&nbsp;&nbsp;{data.type=='folder'?null:(this.getSize(data.size)||null)}</div>
		 				<div title={data.path||null}>位置&nbsp;&nbsp;:&nbsp;&nbsp;{data.path||null}</div>
		 				<div>所有者&nbsp;&nbsp;:&nbsp;&nbsp;{this.getOwner(data.owner)||null}</div>
		 				<div>上传时间&nbsp;&nbsp;:&nbsp;&nbsp;{data.mtime||null}</div>
		 				<div>修改时间&nbsp;&nbsp;:&nbsp;&nbsp;{data.mtime||null}</div>
	 				</div>
	 				<div className='share-infor'>
	 					<div className='detail-title'>分享</div>
	 					<RadioButtonGroup valueSelected={this.state.type} onChange ={this.changeShareType.bind(this)} className='detail-share-radio-group'>
	 						<RadioButton value='all' label='所有人' iconStyle={styles.radioIconStyle} labelStyle={styles.radioLabelStyle}/>
	 						<RadioButton value='custom' label='自定义' iconStyle={styles.radioIconStyle} labelStyle={styles.radioLabelStyle}/>
	 					</RadioButtonGroup>
	 					<div className='custom-share-container' style={this.state.type=='all'?{display:'none'}:{}}>
						    {this.props.state.login.obj.allUser.map(item => {
						    	let checked = false
						    	let index = this.props.state.view.detail[0].readlist.findIndex(i => {
						    		return i == item.uuid
						    	})
						    	if (index != -1) {
						    		checked = true
						    	}
						    	return (
						    		<Checkbox
						    			defaultChecked={checked}
								      	label={item.username}
								      	labelPosition="left"
								      	iconStyle={{fill:'5766bd'}}
								      	onCheck={this.checkUser.bind(_this,item.uuid)}
								    />
						    	)
						    })}
	 					</div>
	 					{/*<div className='detail-share-button'>
	 						<span onClick={this.share.bind(this)}>分享</span>
	 					</div>*/}
	 				</div>
	 				<div onMouseUp={this.closeDetail.bind()} className='detail-close'>close</div>
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

	changeShareType(o,value) {
		this.setState({
			type:value
		})
	}

	checkUser(uuid,obj,checked) {
		c.log(uuid)
		let files = [this.props.state.view.detail[0].uuid]
		let users = this.cloneFun(this.props.state.view.detail[0].readlist)
		c.log(users.length)
		if (checked) {
			users.push(uuid)
			c.log(users.length)
			ipc.send('share',files,users)
		}else {

		}
	}

	share() {

	}


	cloneFun(obj){
	  if(!obj||"object" != typeof obj){
	    return null;
	  }
	  var result = (obj instanceof Array)?[]:{};
	  for(var i in obj){
	    result[i] = ("object" != typeof obj[i])?obj[i]:cloneFun(obj[i]);
	  }
	  return result;
	}
}


 export default Detail;