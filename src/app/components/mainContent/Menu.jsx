/**
 * @component Menu
 * @description Menu
 * @time 2016-5-9
 * @author liuhua
 **/

  'use strict';
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react';
import { connect } from 'react-redux';
//require material
import { Paper, Menu, MenuItem } from 'material-ui';
//import Action
import Action from '../../actions/action';

class PopMenu extends Component {
	render() {
		let menu = this.props.data.menu;
		let style = {
			display:'none'
		}
		if (menu.show) {
			style = Object.assign({},style,{
				display: menu.show?'block':'none',
				left: this.props.navigation.menu?menu.x-249:menu.x,
				top: menu.y-132+document.getElementsByClassName('file-area')[0].scrollTop
			});
		}
		return (
			<div className='MenuContainer menu' style={style}>
				<Paper zDepth={2}>
					<Menu className='menu-list' desktop={true} autoWidth={false}>
						<MenuItem primaryText='详细信息' onTouchTap={this.detail.bind(this)}></MenuItem>
						<MenuItem primaryText='重命名' onClick={this.rename.bind(this)}></MenuItem>
						<MenuItem primaryText='移至' onTouchTap={this.moveto.bind(this)}></MenuItem>
						<MenuItem primaryText='分享' onTouchTap={this.share.bind(this)}></MenuItem>
						<MenuItem primaryText='删除' onTouchTap={this.remove.bind(this)}></MenuItem>
						<MenuItem primaryText='下载' onClick={this.dowload.bind(this)}></MenuItem> 
					</Menu>
				</Paper>
			</div>
		)
	}
	//open detail of files
	detail() {
		this.props.dispatch(Action.setDetail(this.props.data.menu.objArr));
	}
	//rename
	rename() {
		let uuid = this.props.data.menu.objArr[0].uuid;
		let dom = $('div[data-uuid='+uuid+']>span:eq(1)')[0];
		let oldName = dom.innerHTML;
		//edit position point to end
		var editor = dom;
		$('div[data-uuid='+uuid+']>span:eq(1)').attr('contenteditable','true').focus(function(){
			var sel,range;
			if (window.getSelection && document.createRange) {
				range = document.createRange();
				range.selectNodeContents(editor);
				range.collapse(true);
				range.setEnd(editor, editor.childNodes.length);
				range.setStart(editor, 0);
				sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
			} else if (document.body.createTextRange) {
				range = document.body.createTextRange();
				range.moveToElementText(editor);
				range.collapse(true);
				range.select();
			}
		}).keydown(function(e){
			if (e.keyCode == 13) {
				$(this).trigger('blur');
			}
		}).blur(function() {
			$(this).attr('contenteditable','false');
			let name = dom.innerHTML;
			ipc.send('rename',uuid,name,oldName);
		});
		//resolve bug that dom will blur when be focused
		setTimeout(function(){
			dom.focus();
		},0)
	}

	moveto() {
		if (!!this.props.data.directory.uuid) {
			ipc.send('getTreeChildren',this.props.data.directory.uuid);
		}else {
			ipc.send('getTreeChildren');
		}
		
		this.props.dispatch(Action.toggleMove(true,this.props.data.menu.x,this.props.data.menu.y));
	}
	//toggle dialog of share
	share() {
		this.props.dispatch(Action.toggleShare(true));
	}

	remove() {
		let arr = [];
		this.props.data.children.forEach(item=>{
			if (item.checked) {
				arr.push(item)
			}
		});
		ipc.send('delete',arr,this.props.data.directory);
	}

	dowload() {
		let files = [];
		let folder = [];
		let map = new Map();
		let t = new Date();
		this.props.data.children.forEach(item=>{
			if (item.checked && item.type != 'folder') {
				let file = Object.assign({},item,{status:0,downloadTime:Date.parse(t)});
				files.push(file);
				map.set(item.uuid+Date.parse(t),file);	
			}
			if (item.checked && item.type == 'folder') {
				folder.push(item);
			}
		});
		let fileObj = {type:'file',data:files,length:files.length,success:0,failed:0,index:0,status:'ready',map:map,key:Date.parse(new Date())};
		if (folder.length != 0) {
			ipc.send('downloadFolder',folder);
		}	
		if (fileObj.length != 0) {
			this.props.dispatch(Action.addDownload(fileObj));
			ipc.send('download',fileObj);	
			this.props.dispatch(Action.setSnack(files.length+' 个文件添加到下载队列',true));
		}
	}

	triggerClick(e) {
		if (this.props.data.menu.show) {
			this.props.dispatch(Action.toggleMenu());
		}
	}
}

function mapStateToProps (state) {
	return {
		data: state.data,
		navigation: state.navigation
	}
}

export default connect(mapStateToProps)(PopMenu);