/**
 * @component Menu
 * @description Menu
 * @time 2016-5-9
 * @author liuhua
 **/

  'use strict';
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react'
import { connect } from 'react-redux'
//require material
import { Paper, Menu, MenuItem } from 'material-ui';
//import Action
import Action from '../../actions/action';
import { sendCommand } from '../../lib/command'

class PopMenu extends Component {

	render() {
		let menu = window.store.getState().view.menu;
		let style = {
			display:'none'
		}
		if (menu.show) {
			style = Object.assign({},style,{
				display: menu.show?'block':'none',
				left: window.store.getState().navigation.menu?menu.x-249:menu.x,
				top: menu.y-132+document.getElementsByClassName('file-area')[0].scrollTop
			});
		}
		return (
			<div className='MenuContainer menu' style={style}>
				<Paper zDepth={2}>
					<Menu className='menu-list' desktop={true} autoWidth={false}>
						<MenuItem primaryText='详细信息' onTouchTap={this.detail.bind(this)}></MenuItem>
						<MenuItem primaryText='重命名' onClick={this.rename2.bind(this)}></MenuItem>
						{/*<MenuItem primaryText='移至' onTouchTap={this.moveto.bind(this)}></MenuItem>*/}
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
		this.props.dispatch(Action.openDetail());
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

  // delete
	remove() {
		let arr = [];
		window.store.getState().file.children.forEach(item=>{
			if (item.checked) {
				arr.push(item)
			}
		});
		// ipc.send('delete',arr,window.store.getState().file.current.directory);
    sendCommand(null, {
      cmd: 'FILE_DELETE',
      args: {
        dir: window.store.getState().file.current.directory,
        children: arr
      } 
    }) 
	}

  rename2() {
    sendCommand(null, {
      cmd: 'FILE_RENAME',
      args: {
        dir: window.store.getState().file.current.directory,
        child: window.store.getState().file.children[window.store.getState().view.menu.index] 
      }
    })
  }

	//rename
	rename() {

		let index = window.store.getState().view.menu.index 
		let uuid = window.store.getState().file.children[index].uuid
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

	dowload() {
		let files = [];
		let folders = [];
		// let map = new Map();
		// let t = new Date();
		window.store.getState().file.children.forEach(item=>{
			if (item.checked && item.type != 'folder') {
				// let file = Object.assign({},item,{status:0,downloadTime:Date.parse(t)});
				files.push(item);
				// map.set(item.uuid+Date.parse(t),file);	
			}
			if (item.checked && item.type == 'folder') {
				folders.push(item);
			}
		});
		// let fileObj = {type:'file',data:files,length:files.length,success:0,failed:0,index:0,status:'ready',map:map,key:Date.parse(new Date())};
		if (folders.length != 0) {
			ipc.send('downloadFolder',folders);
		}	
		if (files.length != 0) {
			// this.props.dispatch(Action.addDownload(fileObj));
			ipc.send('downloadFile',files);	
			// this.props.dispatch(Action.setSnack(files.length+' 个文件添加到下载队列',true));
		}
	}
}

/**
var mapStateToProps = (state)=>({
	file: state.file,
	navigation: state.navigation,
	view: state.view,
})
**/

export default PopMenu
