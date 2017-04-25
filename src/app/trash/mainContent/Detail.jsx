/**
 * @component Detail
 * @description Detail
 * @time 2016-5-10
 * @author liuhua
 **/
  'use strict';
  // require core module
import React, { findDOMNode, Component, PropTypes } from 'react'
import { connect } from 'react-redux'
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
 		this.state = {type:'custom'}
 	}

 	render() {
 		var _this = this
 		let index = this.props.view.menu.index

 		if (this.props.view.detail) {
 			let style = {
			 	height: (document.body.clientHeight-64)+'px',
				width:index == -1?'0px':'220px'
			}
			let data = this.props.file.children[index]
 			return(
	 			<div style={style} className='detail-container'>
	 				<div className='file-infor'>
	 					<div className='detail-title'>文件信息</div>
	 					<div>类型&nbsp;&nbsp;:&nbsp;&nbsp;{data.type?data.type=='folder'?'文件夹':'文件':null}</div>
	 					<div>name&nbsp;&nbsp;:&nbsp;&nbsp;{data.name||null}</div>
		 				<div>大小&nbsp;&nbsp;:&nbsp;&nbsp;{data.type=='folder'?null:(this.getSize(data.size)||null)}</div>
		 				<div title={data.path||null}>位置&nbsp;&nbsp;:&nbsp;&nbsp;{data.path||null}</div>
		 				<div>所有者&nbsp;&nbsp;:&nbsp;&nbsp;{this.getOwner(data.owner)||null}</div>
		 				<div>上传时间&nbsp;&nbsp;:&nbsp;&nbsp;{data.mtime||null}</div>
		 				<div>修改时间&nbsp;&nbsp;:&nbsp;&nbsp;{data.mtime||null}</div>
	 				</div>
	 				<div className='share-infor'>
	 					<div className='detail-title'>分享</div>
	 					<RadioButtonGroup name="typeSelect" valueSelected={this.state.type} onChange ={this.changeShareType.bind(this)} className='detail-share-radio-group'>
	 						<RadioButton value='all' label='所有人' iconStyle={styles.radioIconStyle} labelStyle={styles.radioLabelStyle}/>
	 						<RadioButton value='custom' label='自定义' iconStyle={styles.radioIconStyle} labelStyle={styles.radioLabelStyle}/>
	 					</RadioButtonGroup>
	 					<div className='custom-share-container' style={this.state.type=='all'?{display:'none'}:{}}>
						    
						    {this.getShareList(data)}
	 					</div>
	 					{/*<div className='detail-share-button'>
	 						<span onClick={this.share.bind(this)}>分享</span>
	 					</div>*/}
	 				</div>
	 				<div onMouseUp={this.closeDetail.bind(this)} className='detail-close'>close</div>
	 			</div> 
	 			)
 		}else {
 			return false
 		}
 	}

 	getShareList(data) {
 		var _this = this
 		if (data.type == 'file') {
 			return <div>文件暂时无法进行分享</div>
 		}

 		// return this.props.login.obj.users.map(item => {
    return this.props.node.server.users.map(item => {
						    	let checked = false
						    	if(data.readlist) {
						    		let index = data.readlist.findIndex(i => {
							    		return i == item.uuid
							    	})
							    	if (index != -1) {
							    		checked = true
							    	}
						    	}
						    	return (
						    		<Checkbox
						    			key={item.uuid}
						    			defaultChecked={checked}
								      	label={item.username}
								      	labelPosition="left"
								      	iconStyle={{fill:'5766bd'}}
								      	onCheck={this.checkUser.bind(_this,item.uuid)}
								    />
						    	)
						    })
 	}

 	closeDetail() {
 		this.props.dispatch(Action.cleanDetail());
 	}
 	getOwner(owner) {
 		// let o = this.props.login.obj.users.find(item=>{
    let o = this.props.node.server.users.find(item => {
 			return item.uuid == owner[0]
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
		if (value == 'all') {
			let index = this.props.view.menu.index
			let files = [this.props.file.children[index].uuid]
			let users = []
			// this.props.login.obj.users.forEach( item => {
      this.props.node.server.users.forEach(item => {
				if ((item.uuid != this.props.login.obj.uuid) && (typeof item.uuid == 'string') ) {
					users.push(item.uuid)
				}
			})
			ipc.send('share',files,users)
		}
		this.setState({
			type:value
		})
	}

	checkUser(uuid,obj,checked) {
		c.log(uuid)
		let index = this.props.view.menu.index
		let files = [this.props.file.children[index].uuid]
		let users = this.cloneFun(this.props.file.children[index].readlist)
		if (users == undefined) {
			users = []
		}
		if (checked) {
			c.log(uuid)
			users.push(uuid)
			ipc.send('share',files,users)
		}else {
			let index = users.findIndex(item => item == uuid)
			if (index != -1) {
				users.splice(index,1)
				ipc.send('share',files,users)
			}
		}
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

var mapStateToProps = (state)=>({
	     file: state.file,
	     view: state.view,
	     login: state.login
	})

 export default connect(mapStateToProps)(Detail)
