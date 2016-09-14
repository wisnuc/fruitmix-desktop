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
		var _this = this;
		const styles = {
			block: {
				maxWidth: 250,
			},
			checkbox: {
				marginBottom: 16,
			},
		};
		let shareUserList = this.props.state.login.obj.allUser.map((item,index)=>{
						if (item.username == this.props.state.login.obj.username) {
							return
						}
						return <Checkbox key={item.username} label={item.username} style={{marginBottom: 16}} labelPosition="left" onCheck={this.checkUser.bind(this,item.uuid)}/>
					})
		const folderActions = [
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
			];
		const shareActions = [
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
		];
		
		return (
			<div className='all-my-files' style={{height:'100%'}}>
				{this.getTable()}
				{/*file detail*/}
				<Paper className='file-detail' style={{width:this.props.state.view.detail.length==0?'0px':'350px'}}>
					<Detail dispatch={this.props.dispatch} state={this.props.state}></Detail>
				</Paper>
				{/*create new folder dialog*/}
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
				{/*share dialog*/}
				<Dialog 
					title='分享' 
					titleClassName='create-folder-dialog-title'
					actions={shareActions}
					open={this.props.state.view.dialogOfShare}
					className='create-folder-dialog'
				>
					<div className='share-user-list-container'>
					{shareUserList}
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
						<FilesTable dispatch={this.props.dispatch} state={this.props.state}/>
						<Menu dispatch={this.props.dispatch} state={this.props.state}></Menu>
						<Move dispatch={this.props.dispatch} state={this.props.state}></Move>
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
		let files = [];
		let map = new Map();
		var t = new Date();
		for (let i=0;i<e.nativeEvent.target.files.length;i++) {
			var f = e.nativeEvent.target.files[i]
			var file = {
				uploadTime : Date.parse(t),
				parent : this.props.state.file.current.directory.uuid,
				status:0,
				uuid:null,
				checked:false,
				type:'file',
				owner:[this.props.state.login.obj.uuid],
				size:f.size,
				path:f.path,
				name:f.name,
			}
			files.push(file);
			map.set(f.path+Date.parse(t),file);
		}
		let fileObj = {data:files,length:files.length,success:0,failed:0,index:0,status:'ready',parent:this.props.state.file.current.directory.uuid,map:map,key:Date.parse(new Date())};
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
			ipc.send('getRootData');
			// this.props.dispatch(Action.filesLoading());
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
		$('.upload-input').trigger('click');
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
		let files = [];
		let users = [];
		this.props.state.data.children.forEach((item,index)=>{
			if (item.checked) {
				files.push(item);
			}
		});
		this.props.state.login.obj.allUser.forEach((item,index)=>{
			if (item.checked) {
				users.push(item.uuid);
			}
		});
		this.props.dispatch(Action.toggleShare(false));
		this.props.dispatch(Action.cancelUserCheck());
		if (users.length == 0) {
			return
		}
		ipc.send('share',files,users);
	}
	// select users be shared
	checkUser(uuid,obj,b) {
		this.props.dispatch(Action.checkUser(uuid,b));
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