/**
 * @component AllFiles
 * @description AllFiles
 * @time 2016-4-28
 * @author liuhua
 **/
  'use strict';
// require core module
 import React, { findDOMNode, Component, PropTypes } from 'react';
 import { connect } from 'react-redux';
//require material
import { Paper, FontIcon, SvgIcon, IconMenu, MenuItem, Dialog, FlatButton, RaisedButton, TextField, Checkbox, CircularProgress } from 'material-ui';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import {blue500, red500, greenA200} from 'material-ui/styles/colors';
import svg from '../../utils/SVGIcon';
//import Action
import Action from '../../actions/action';
// import Component 
import FilesTable from './FilesTable';
import Menu from './Menu';
import Detail from './Detail';
import Move from './Move';

class AllFiles extends Component {
	render() {
		var _this = this;
		const folderActions = [
			<FlatButton
				label="Cancel"
				primary={true}
				onTouchTap={this.toggleUploadFolder.bind(this,false)}
			/>,
			<FlatButton
				label="Submit"
				primary={true}
				keyboardFocused={true}
				onTouchTap={this.upLoadFolder.bind(this)}
			/>,
			];
		const shareActions = [
			<FlatButton
				label="Cancel"
				primary={true}
				onTouchTap={this.toggleShare.bind(this,false)}
			/>,
			<FlatButton
				label="Submit"
				primary={true}
				keyboardFocused={true}
				onTouchTap={this.share.bind(this)}
			/>,
		];
		const styles = {
			block: {
				maxWidth: 250,
			},
			checkbox: {
				marginBottom: 16,
			},
		};
		return (
			<div className='all-my-files' style={{height:(document.body.clientHeight-64)+'px'}}>
				{this.getTable()}
				{/*file detail*/}
				<Paper className='file-detail' style={{width:this.props.isShow.detail.length==0?'0px':'350px'}}>
					<Detail></Detail>
				</Paper>
				{/*create new folder dialog*/}
				<Dialog
					title="新建文件夹"
					actions={folderActions}
					modal={false}
					open={this.props.isShow.dialogOfFolder}
					onRequestClose={this.handleClose}
			        >
			    	<TextField hintText="名称" id='folder-name'/>
			    </Dialog>
				{/*share dialog*/}
				<Dialog 
					title='分享' 
					actions={shareActions}
					open={this.props.isShow.dialogOfShare}
				>
					<div className='share-user-list-container' style={{'overflow-y':'scroll'}}>
					{this.props.login.obj.allUser.map((item,index)=>{
						return <Checkbox key={item.username} label={item.username} style={styles.checkbox} labelPosition="left" onCheck={this.checkUser.bind(this,item.uuid)}/>
					})}
					</div>
				</Dialog>
			</div>
		)
	}
	//get table 
	getTable() {
		const listStyle = {
			height: 48,
			lineHeight:'48px'
		}

		if (this.props.data.state=='BUSY') {
			return (<div className='data-loading '><CircularProgress/></div>)
		}else {
			return (
				<Paper className='file-area' onScroll={this.scrollEvent.bind(this)} onMouseDown={this.mouseDown.bind(this)}>
					{/*upload input*/}
					<input className='upload-input' type="file" onChange={this.upLoadFile.bind(this)} multiple={true} webkitdirectory={true}/>
					{/*bread crumb*/}
					<div className='breadcrumb'>
						<SvgIcon onClick={this.backToParent.bind(this)} color={greenA200} style={{marginLeft:10,marginRight:14,cursor:'pointer'}}>
						{svg['back']()}
						</SvgIcon>
						{this.getBreadCrumb()}
						<IconMenu style={{display:'flex',alignItems:'center',marginRight:10}}
						      iconButtonElement={<span style={{cursor:'pointer'}}>{svg.add()}</span>}
						      anchorOrigin={{horizontal: 'left', vertical: 'top'}}
						      targetOrigin={{horizontal: 'left', vertical: 'top'}}
						    >
						    	<MenuItem innerDivStyle={listStyle} primaryText="新建文件夹" onClick={this.toggleUploadFolder.bind(this,true)}/>
							<MenuItem innerDivStyle={listStyle} primaryText="上传文件" onClick={this.openInputFile.bind(this)}/>
						</IconMenu>
					</div>
					{/*file table body*/}
					<div className="all-files-container">
					{/*<video src="http://192.168.5.181:9220/kktv4/get?api_name=Distro.FruitMix.Media.Data&reqid=39&sid=5fdeb8d8dd7bc970&xid=eba41e11964f360a464a740793c99463" controls="controls"></video>*/}
						<FilesTable/>
						<Menu></Menu>
						<Move></Move>
					</div>
				</Paper>
				)
		}
	}
	//open multiple select
	mouseDown(e) {
		// this.props.dispatch(Action.mouseDown(e.nativeEvent.x,e.nativeEvent.y));
	}
	//upload file
	upLoadFile(e) {
		// let files = [];
		// for (let i=0;i<e.nativeEvent.target.files.length;i++) {
		// 	var f = e.nativeEvent.target.files[i];
		// 	var t = new Date();
		// 	var file = {
		// 		name:f.name,
		// 		path:f.path,
		// 		size:f.size,
		// 		lastModifiedDate:f.lastModifiedDate,
		// 		parent : {uuid:this.props.data.directory.uuid},
		// 		uploadTime :  Date.parse(t),
		// 		status:0
		// 	}
		// 	files.push(file);
		// }
		// this.props.dispatch(Action.addUpload(files));
		// ipc.send('uploadFile',files);	
		// this.props.dispatch(Action.setSnack(files.length+' 个文件添加到下载队列',true));
		//--------------------------------------------------------------------------------------------------------------------------------------------------------
		let files = [];
		let obj = {};
		let map = new Map();
		console.log(e.nativeEvent.target.files);
		for (let i=0;i<e.nativeEvent.target.files.length;i++) {
			var f = e.nativeEvent.target.files[i];
			var t = new Date();
			var file = {
				name:f.name,
				path:f.path,
				size:f.size,
				lastModifiedDate:f.lastModifiedDate,
				parent : {uuid:this.props.data.directory.uuid},
				uploadTime :  Date.parse(t),
				status:0,
				uuid:null
			}
			files.push(file);
			map.set(f.path+Date.parse(t),file);
		}
		let fileObj = {data:files,length:files.length,success:0,failed:0,index:0,status:'ready',parent:this.props.data.directory.uuid,map:map,key:Date.parse(new Date())};
		this.props.dispatch(Action.addUpload(fileObj));
		ipc.send('uploadFile',fileObj);	
		this.props.dispatch(Action.setSnack(files.length+' 个文件添加到上传队列',true));
	}
	//get  bread
	getBreadCrumb(){
		var _this = this;
		var path = this.props.data.path;
		var pathArr = [];
		pathArr = path.map((item,index)=>(
				<span key={index} style={{display:'flex',alignItems:'center'}}>
					<span 
					style={{display:'flex',alignItems:'center',marginRight:10,cursor:'pointer'}}
					onClick={_this.selectBreadCrumb.bind(_this,item)}>
						{item.key!=''?item.key:<SvgIcon>{svg['home']()}</SvgIcon>}
					</span>
					<span style={{marginRight:5}}>></span>
				</span>
			));
		return pathArr;

	}
	//back
	backToParent () {
		$('.bezierFrame').empty().append('<div class="bezierTransition1"></div><div class="bezierTransition2"></div>');
		let parent = this.props.data.parent;
		let path = this.props.data.path;
		if (path.length == 1) {
			return;
		}else if (path.length == 2) { 
			ipc.send('getRootData');
			this.props.dispatch(Action.filesLoading());
		}else {
			this.props.dispatch(Action.cleanDetail());
			ipc.send('enterChildren',parent);
		}
	}
	//select bread crumb
	selectBreadCrumb(obj) {
		$('.bezierFrame').empty().append('<div class="bezierTransition1"></div><div class="bezierTransition2"></div>');
		if (obj.key == '') {
			ipc.send('getRootData');
			this.props.dispatch(Action.filesLoading());
		}else {
			this.props.dispatch(Action.cleanDetail());
			ipc.send('enterChildren',obj.value);
		}
	}
	//create new folder
	upLoadFolder() {
		let name = $('#folder-name')[0].value;
		ipc.send('upLoadFolder',name,this.props.data.directory);
		this.toggleUploadFolder(false);
	}
	//open input of files
	openInputFile() {
		$('.upload-input').trigger('click');
	}
	//toggle dialog of upload
	toggleUploadFolder(b) {
		this.props.dispatch(Action.toggleDialogOfUploadFolder(b));
	}
	//toggle dialog of share
	toggleShare(b) {
		this.props.dispatch(Action.toggleShare(b));
	}
	//share files or folders
	share() {
		let files = [];
		let users = [];
		this.props.data.children.forEach((item,index)=>{
			if (item.checked) {
				files.push(item);
			}
		});
		this.props.login.obj.allUser.forEach((item,index)=>{
			if (item.checked) {
				users.push(item.uuid);
			}
		});
		this.props.dispatch(Action.toggleShare(false));
		this.props.dispatch(Action.cancelUserCheck());
		console.log(files);
		console.log(users[0]);
		ipc.send('share',files,users);
	}
	// select users be shared
	checkUser(uuid,obj,b) {
		this.props.dispatch(Action.checkUser(uuid,b));
	}
	//scrollEvent 
	scrollEvent() {
		let dom = document.getElementsByClassName('file-area')[0]
		let sTop = dom.scrollTop;
		let sHeight = dom.scrollHeight;
		let cHeight = dom.clientHeight;
		if (cHeight+sTop == sHeight) {
			if (this.props.data.children.length <= this.props.data.showSize) {
				return
			}
			this.props.dispatch(Action.setFilesSize(false));
		}
	}
}

function mapStateToProps (state) {
	return {
		data: state.data,
		login: state.login,
		isShow: state.isShow
	}
}
export default connect(mapStateToProps)(AllFiles);