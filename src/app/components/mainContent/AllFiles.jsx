/**
 * @component AllFiles
 * @description AllFiles
 * @time 2016-4-28
 * @author liuhua
 **/
  'use strict';
// require core module
 import React, { findDOMNode, Component, PropTypes } from 'react';
 import { connect, bindActionCreators } from 'react-redux';
//require material
import { Paper, FontIcon, SvgIcon,Snackbar, IconMenu, MenuItem, Dialog, FlatButton, RaisedButton, TextField, Checkbox } from 'material-ui';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import { CircularProgress } from 'material-ui'
import {blue500, red500, greenA200} from 'material-ui/styles/colors';
import svg from '../../utils/SVGIcon';
//import Action
import Action from '../../actions/action';
// import Component 
import FilesTable from './FilesTable';
import Menu from './Menu';
import Detail from './Detail';

class AllFiles extends Component {
	render() {
		var _this = this;
		var children = this.props.data.children;
		var content = this.getTable();

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
				{content}
				<Paper className='file-detail' style={{width:this.props.data.detail.length==0?'0px':'350px'}}>
					<Detail></Detail>
				</Paper>
				<Dialog
					title="新建文件夹"
					actions={folderActions}
					modal={false}
					open={this.props.data.dialogOfFolder}
					onRequestClose={this.handleClose}
			        >
			          <TextField hintText="名称" id='folder-name'/>
			        </Dialog>
			        <Dialog 
			        	title='分享' 
			        	actions={shareActions}
			        	open={this.props.data.dialogOfShare}
			        >
			        	<div className='share-user-list-container'>
			        	{this.props.login.obj.allUser.map((item,index)=>{
			        		return <Checkbox label={item.username} style={styles.checkbox} labelPosition="left" onCheck={this.checkUser.bind(this,item.uuid)}/>
			        	})}
			        	</div>
			        </Dialog>
			</div>
		)
	}
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
			ipc.send('enterChildren',parent);
		}
	}

	selectBreadCrumb(obj) {
		$('.bezierFrame').empty().append('<div class="bezierTransition1"></div><div class="bezierTransition2"></div>');
		if (obj.key == '') {
			ipc.send('getRootData');
			// this.props.dispatch(Action.cleanDetail());
			this.props.dispatch(Action.filesLoading());
		}else {
			// this.props.dispatch(Action.cleanDetail());
			ipc.send('enterChildren',obj.value);
		}
	}

	mouseDown(e) {
		this.props.dispatch(Action.mouseDown(e.nativeEvent.x,e.nativeEvent.y));
	}

	getTable() {
		const listStyle = {
			height: 48,
			lineHeight:'48px'
		}

		if (this.props.data.state=='BUSY') {
			return (<div className='data-loading '><CircularProgress/></div>)
		}else {
			return (
				<Paper className='file-area' onMouseDown={this.mouseDown.bind(this)}>
					<input className='upload-input' type="file" multiple={true} onChange={this.upLoadFile.bind(this)}/>
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
					<div className="all-files-container">
						<FilesTable/>
						<Menu></Menu>
					</div>
					{/*
					<Snackbar
				          open={this.props.data.snackbar!=''?true:false}
				          message={this.props.data.snackbar}
				        />
					*/}
				</Paper>
				)
		}
	}

	upLoadFile(e) {
		for (let i=0;i<e.nativeEvent.target.files.length;i++) {
			var f = e.nativeEvent.target.files[i];
			var t = new Date();
			var file = {
				name:f.name,
				path:f.path,
				size:f.size,
				lastModifiedDate:f.lastModifiedDate,
				dir : this.props.data.directory,
				uploadTime :  Date.parse(t),
				status:0

			}
			this.props.dispatch(Action.addUpload(file));
			ipc.send('uploadFile',file);	
		}
		
	}

	upLoadFolder() {
		let name = $('#folder-name')[0].value;
		ipc.send('upLoadFolder',name,this.props.data.directory);
		this.toggleUploadFolder(false);
	}

	openInputFile() {
		$('.upload-input').trigger('click');
	}

	toggleUploadFolder(b) {
		this.props.dispatch(Action.toggleDialogOfUploadFolder(b));
	}

	toggleShare(b) {
		this.props.dispatch(Action.toggleShare(b));
	}

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

	checkUser(uuid,obj,b) {
		this.props.dispatch(Action.checkUser(uuid,b));
	}
}

function mapStateToProps (state) {
	return {
		data: state.data,
		login: state.login
	}
}
export default connect(mapStateToProps)(AllFiles);