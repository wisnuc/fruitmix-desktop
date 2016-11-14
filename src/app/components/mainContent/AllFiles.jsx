/**
 * @component AllFiles
 * @description AllFiles
 * @time 2016-4-28
 * @author liuhua
 **/
  'use strict';
// require core module
 import React, { findDOMNode, Component, PropTypes } from 'react';
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
		var _this = this
		return (
			<div className='all-my-files' style={{height:'100%'}}>
				{this.getTable()}
				{/*file detail*/}
				{this.getDetail()}
				{/*create new folder dialog*/}
				{this.getCreateFolderDialog()}
				{/*share dialog*/}
				{this.getShareDialog()}
			</div>
		)
	}
	//get table 
	getTable() {
		const listStyle = {
			height: 48,
			lineHeight:'48px'
		}

		if (this.props.state.file.view.state=='BUSY') {
			return (<div className='data-loading '><CircularProgress/></div>)
		}else {
			return (
				<Paper className='file-area' onScroll={this.scrollEvent.bind(this)} onMouseDown={this.mouseDown.bind(this)}>
					{/*upload input*/}
					<input className='upload-input' type="file" onChange={this.upLoadFile.bind(this)} multiple={true}/>
					{/*bread crumb*/}
					<div className='breadcrumb'>
						{this.getBreadCrumb()}
						<IconMenu className='breadcrumb-add'
						      iconButtonElement={<span style={{cursor:'pointer'}}>{svg.add()}</span>}
						      anchorOrigin={{horizontal: 'left', vertical: 'top'}}
						      targetOrigin={{horizontal: 'left', vertical: 'top'}}
						    >
						    <MenuItem innerDivStyle={listStyle} primaryText="新建文件夹" onClick={this.toggleUploadFolder.bind(this,true)}/>
							<MenuItem innerDivStyle={listStyle} primaryText="上传文件" onClick={this.openInputFile.bind(this)}/>
							<MenuItem innerDivStyle={listStyle} primaryText="上传文件夹" onClick={this.openInputFolder.bind(this)}/>
						</IconMenu>
					</div>
					{/*file table body*/}
					<div className="all-files-container">
						<FilesTable/>
						<Menu></Menu>
						{/*<Move dispatch={this.props.dispatch} state={this.props.state}></Move>*/}
					</div>
				</Paper>
				)
		}
	}

	getDetail() {
		if (!this.props.state.view.detail) {
			return null
		}else {
			return (
				<Paper className='file-detail' style={{width:this.props.state.view.detail?'220px':'0px'}}>
					<Detail></Detail>
				</Paper>
				)
		}
	}

	getCreateFolderDialog() {
		if (!this.props.state.view.dialogOfFolder) {
			return null
		}else {
			let folderActions = [
			<FlatButton
				label="取消"
				primary={true}
				onTouchTap={this.toggleUploadFolder.bind(this,false)}
				labelStyle={{color:'#000',fontSize:'15px'}}
			/>,
			<FlatButton
				label="确认"
				primary={true}
				onTouchTap={this.upLoadFolder.bind(this)}
				backgroundColor='#ef6c00'
				labelStyle={{color:'#fff',fontSize:'16px'}}
				hoverColor='#ef6c00'
			/>,
			]
			return (
				<Dialog
					title="新建文件夹"
					titleClassName='create-folder-dialog-title'
					actions={folderActions}
					modal={false}
					open={this.props.state.view.dialogOfFolder}
					className='create-folder-dialog'
				       >
				    <div className='create-folder-dialog-label'>名称</div>
				    <TextField fullWidth={true} hintText="名称" id='folder-name'/>
				</Dialog>
			)
		}
	}

	getShareDialog() {
		if (!this.props.state.view.dialogOfShare) {
			return null
		}else {
			//let shareUserList = this.props.state.login.obj.users.map((item,index)=>{
      let shareUserList = this.props.state.node.server.users.map((item, index) => {
						if (item.username == this.props.state.login.obj.username) {
							return
						}
						return <Checkbox key={item.username} label={item.username} style={{marginBottom: 16}} labelPosition="left" onCheck={this.checkUser.bind(this,item.uuid)}/>
					})
			let shareActions = [
				<FlatButton
					label="取消"
					primary={true}
					onTouchTap={this.toggleShare.bind(this,false)}
					labelStyle={{color:'#000',fontSize:'15px'}}
				/>,
				<FlatButton
					label="确认"
					primary={true}
					onTouchTap={this.share.bind(this)}
					backgroundColor='#ef6c00'
					labelStyle={{color:'#fff',fontSize:'16px'}}
					hoverColor='#ef6c00'
				/>,
			]

			return (
				<Dialog 
					title='分享' 
					titleClassName='create-folder-dialog-title'
					actions={shareActions}
					open={this.props.state.view.dialogOfShare}
					className='create-folder-dialog'>
					<div className='share-user-list-container'>
					{shareUserList}
					</div>
				</Dialog>
				)
		}
	}
	//open multiple select
	mouseDown(e) {
		// this.props.dispatch(Action.mouseDown(e.nativeEvent.x,e.nativeEvent.y));
	}
	//upload file
	upLoadFile(e) {
		let files = [];
		let map = new Map();
		let t = new Date();
		let dirUUID = this.props.state.file.current.directory.uuid
		for (let i=0;i<e.nativeEvent.target.files.length;i++) {
			var f = e.nativeEvent.target.files[i]
			var file = {
				uploadTime : Date.parse(t), // nonsense TODO
				parent : dirUUID,			// target
				status:0,					// 0, 100 progress
				uuid:null,					// return uuid
				checked:false,				// not used
				type:'file',				// file type (file or folder)
				owner:[this.props.state.login.obj.uuid],	// not used
				size:f.size,				// file size
				path:f.path,				// file local path (with name)
				name:f.name,				// file name (basename)
			}
			files.push(file);
			map.set(f.path+Date.parse(t),files[files.length-1]);
		}
		let fileObj = {data:files,map:map,length:files.length,success:0,failed:0,index:0,status:'ready',parent:this.props.state.file.current.directory.uuid,key:Date.parse(new Date())};
		this.props.dispatch(Action.addUpload(fileObj));
		ipc.send('uploadFile',fileObj);	
		this.props.dispatch(Action.setSnack(files.length+' 个文件添加到上传队列',true));
	}
	//get  bread
	getBreadCrumb(){
		var _this = this;
		var path = this.props.state.file.current.path;
		var pathArr = [];
		pathArr = path.map((item,index)=>{
			return(
				<span key={index} style={{display:'flex',alignItems:'center'}} onClick={_this.selectBreadCrumb.bind(_this,item)}>
					{item.key!=''?<span className='breadcrumb-text'>{item.key}</span>:<span className='breadcrumb-home'></span>}
					<span className={index==path.length-1?'breadcrumb-arrow hidden':'breadcrumb-arrow'}></span>
				</span>
			)});
		return pathArr;
	}
	//select bread crumb
	selectBreadCrumb(obj) {
		$('.bezierFrame').empty().append('<div class="bezierTransition1"></div><div class="bezierTransition2"></div>');
		if (obj.key == '') {
			// ipc.send('getRootData');
			// this.props.dispatch(Action.filesLoading());
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<')
      fileNav('HOME_DRIVE', null) 
		}else {
			this.props.dispatch(Action.cleanDetail());
			ipc.send('enterChildren',obj.value);
		}
	}
	//create new folder
	upLoadFolder() {
		let name = $('#folder-name')[0].value;
		ipc.send('upLoadFolder',name,this.props.state.file.current.directory);
		this.toggleUploadFolder(false);
	}
	//open input of files
	openInputFile() {
		// $('.upload-input').trigger('click');
		ipc.send('uploadFile')
	}
	//toggle dialog of upload folder
	openInputFolder() {
		ipc.send('openInputOfFolder');
	}
	//toggle dialog of upload files
	toggleUploadFolder(b) {
		this.props.dispatch(Action.toggleDialogOfUploadFolder(b));
	}

	//toggle dialog of share
	toggleShare(b) {
		this.props.dispatch(Action.toggleShare(b));
	}
	//share files or folders
	share() {
		let files = []
		let users = []
		this.props.state.file.current.children.forEach(item => {
			if (item.checked) {
				files.push(item.uuid)
			}
		})
		//this.props.state.login.obj.users.forEach((item,index)=>{
    this.props.state.node.server.users.forEach((item, index) => {
			if (item.checked) {
				users.push(item.uuid);
			}
		})

		if (users.length == 0) {
			return
		}
		this.props.dispatch(Action.toggleShare(false));
		this.props.dispatch(Action.cancelUserCheck());
		
		ipc.send('share',files,users);
	}
	// select users be shared
	checkUser(uuid) {
		this.props.dispatch(Action.checkUser(uuid))
	}
	//scrollEvent 
	scrollEvent() {
		// let dom = document.getElementsByClassName('file-area')[0]
		// let sTop = dom.scrollTop;
		// let sHeight = dom.scrollHeight;
		// let cHeight = dom.clientHeight;
		// if (cHeight+sTop == sHeight) {
		// 	if (this.props.state.data.children.length <= this.props.state.data.showSize) {
		// 		return
		// 	}
		// 	this.props.dispatch(Action.setFilesSize(false));
		// }
	}
}

export default AllFiles;
