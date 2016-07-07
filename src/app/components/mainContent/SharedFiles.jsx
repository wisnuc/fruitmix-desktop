/**
 * @component SharedFiles
 * @description SharedFiles
 * @time 2016-4-28
 * @author liuhua
 **/
  'use strict';
// require core module
 import React, { findDOMNode, Component, PropTypes } from 'react';
 import { connect, bindActionCreators } from 'react-redux';
 import { Table,TableHeader, TableHeaderColumn, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
 import svg from '../../utils/SVGIcon';
 //import Action
import Action from '../../actions/action';
// import Component 
import Row from './ShareTableRow'

class SharedFiles extends Component {

	constructor(props) {
        super(props);
        this.state = { deleteShow: false };
    }
	render() {
		console.log(this);
		return (
			<div className='shared-files-container'>
				{/*<div onClick={this.backRoot}>back root</div>*/}
				<div className="breadcrumb"></div>
	
				<table className="fileTable">
					<thead>
						<tr>
							<th>文件名</th>
							<th>分享者</th>
							<th>操作</th>
						</tr>
					</thead>
					<tbody>
						{this.props.data.shareChildren.map(item=>(
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

	getShareUser(item) {
		let user = this.props.login.obj.allUser.find((i)=>{return item == i.uuid});
		return user.username;
		console.log(user);
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

		// let files = [];
		// let map = new Map();
		// let t = new Date();
		// let folder = [];
		// this.props.data.children.forEach(item=>{
		// 	if (item.checked && item.type != 'folder') {
		// 		let file = Object.assign({},item,{status:0,downloadTime:Date.parse(t)});
		// 		files.push(file);
		// 		map.set(item.uuid+Date.parse(t),file);	
		// 	}
		// 	if (item.checked && item.type == 'folder') {
		// 		folder.push(item);
		// 	}
		// });
		// let fileObj = {type:'file',data:files,length:files.length,success:0,failed:0,index:0,status:'ready',map:map,key:Date.parse(new Date())};
		// if (folder.length != 0) {
		// 	ipc.send('downloadFolder',folder);
		// }	
		// if (fileObj.length != 0) {
		// 	this.props.dispatch(Action.addDownload(fileObj));
		// 	ipc.send('download',fileObj);	
		// 	this.props.dispatch(Action.setSnack(files.length+' 个文件添加到下载队列',true));
		// }
	}

	enterShare(item) {
		if (item.type == 'folder') {
			ipc.send('enterShare',item);
		}
	}

	backRoot() {
		ipc.send('backShareRoot');
	}
}

function mapStateToProps (state) {
	return {
		data: state.data,
		login:state.login
	}
}

export default connect(mapStateToProps)(SharedFiles);