/**
 * @component SharedFiles
 * @description SharedFiles
 * @time 2016-4-28
 * @author liuhua
 **/
  'use strict';
// require core module
 import React, { findDOMNode, Component, PropTypes } from 'react';
 import { Table,TableHeader, TableHeaderColumn, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
 import svg from '../../utils/SVGIcon';
 //import Action
import Action from '../../actions/action';
// import Component 
import Row from './ShareTableRow'

class SharedFiles extends Component {

	constructor(props) {
        super(props);
        // this.state = { deleteShow: false };
    }
	render() {
		return (
			<div className='shared-files-container'>
				{/*<div onClick={this.backRoot}>back root</div>*/}
				<div className="breadcrumb">
				{this.getBreadCrumb()}
				</div>
	
				<table className="fileTable">
					<thead>
						<tr>
							<th>文件名</th>
							<th>分享者</th>
							<th>操作</th>
						</tr>
					</thead>
					<tbody>
						{this.props.state.share.shareChildren.map(item=>(
							<Row 
								key={item.uuid}
								item={item}
								getShareUser={this.getShareUser.bind(this)}
								download={this.download.bind(this,item)}
								enterShare={this.enterShare.bind(this,item)}
							></Row>
							))}
					</tbody>
				</table>
			</div>
		)
	}

	//get  bread
	getBreadCrumb(){
		var _this = this;
		var path = this.props.state.share.sharePath;
		return path.map((item,index)=>{
			return(
				<span key={index} style={{display:'flex',alignItems:'center'}} onClick={_this.enterShare.bind(_this,item.value)}>
					{item.key!=''?<span className='breadcrumb-text'>{item.key}</span>:<span onClick={this.backRoot} className='breadcrumb-home'></span>}
					<span className={index==path.length-1?'breadcrumb-arrow hidden':'breadcrumb-arrow'}></span>
				</span>
			)});
	}

	getShareUser(item) {
		if (item.length == 0) {
			return null
		}

		// let user = this.props.state.login.obj.users.find((i)=>{return item == i.uuid})
    let user = this.props.state.node.server.users.find(i => item === i.uuid) 

		if (user) {
			return user.username
		}else {
			return 'not found'
		}
		
	}

	download(item) {
		if (item.type == 'folder') {
			let t = new Date();
			let folder = [];
			folder.push(item);
			ipc.send('downloadFolder',folder,'share');
		}else {
			let files = [];
			let map = new Map();
			let t = new Date();
			let file = Object.assign({},item,{status:0,downloadTime:Date.parse(t)});
			files.push(file);
			map.set(item.uuid+Date.parse(t),file);	
			let fileObj = {type:'file',data:files,length:files.length,success:0,failed:0,index:0,status:'ready',map:map,key:Date.parse(new Date())};
			this.props.dispatch(Action.addDownload(fileObj));
			ipc.send('download',fileObj);	
			this.props.dispatch(Action.setSnack(files.length+' 个文件添加到下载队列',true));
		}
	}

	enterShare(item) {
		console.log(item);
		if (item.type == 'folder') {
			ipc.send('enterShare',item);
		}

	}

	backRoot() {
		ipc.send('getFilesSharedToMe');
	}
}

function mapStateToProps (state) {
	return {
		data: state.data,
		login:state.login
	}
}

export default SharedFiles;
