/**
 * @component Main
 * @description main interface
 * @time 2016-4-26
 * @author liuhua
 **/

 'use strict';
// require core module
 import React, { findDOMNode, Component, PropTypes } from 'react';
 import { connect } from 'react-redux';
 import CSS from '../../utils/transition';

//require material
import { AppBar, TextField, Drawer, Paper, Snackbar, FlatButton } from 'material-ui';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

//import Action
import Action from '../../actions/action'

//import CSS
import css  from  '../../../assets/css/main';

//import component
import LeftNav from './LeftNav';
import Content from './Content';
import Multiple from '../mainContent/Multiple';

// require common mixins
import ImageModules from '../Mixins/ImageModules'; 

class Main extends Component {
	mixins: [ImageModules]

	getChildContext() {
		const muiTheme = getMuiTheme(lightBaseTheme);
		return {muiTheme}; 
	}
	componentDidMount() {
		var _this = this;
		ipc.send('getRootData');
		ipc.send('getMediaData');
		this.props.dispatch(Action.filesLoading());

		ipc.on('receive',function (err,dir,children,parent,path,shareChildren) {
			_this.props.dispatch(Action.setDirctory(dir,children,parent,path,shareChildren));
		});
		ipc.on('setTree',(err,tree)=>{
			this.props.dispatch(Action.setTree(tree));
		});
		ipc.on('receiveFile',(err,data)=>{
			console.log(data);
		});

		ipc.on('refresh',(err,data)=>{
			console.log('refresh')
			console.log(data);
		});

		ipc.on('sendMessage',(err,data)=>{
			console.log(data);
		});

		ipc.on('uploadSuccess',(err,file,children)=>{
				this.props.dispatch(Action.refreshDir(children));
		});

		ipc.on('refreshStatusOfUpload',(err,file,status)=>{
			this.props.dispatch(Action.refreshStatusOfUpload(file,status));
		});

		ipc.on('refreshStatusOfDownload',(err,file,status)=>{
			this.props.dispatch(Action.refreshStatusOfDownload(file,status));
		})

		ipc.on('deleteSuccess',(err,obj,children,dir)=>{
			if (dir.uuid == this.props.data.directory.uuid) {
				this.props.dispatch(Action.refreshDir(children));
			}
		});

		ipc.on('message',(err,message,code)=>{
			this.props.dispatch(Action.setSnack(message,true));
			switch(code) {
				case 1:
					this.props.dispatch(Action.getDataFailed());
			}
		});

		ipc.on('treeChildren',(err,treeChildren)=>{
			this.props.dispatch(Action.setTree(treeChildren));
		});

		ipc.on('mediaFinish',(err,media)=>{
			this.props.dispatch(Action.setMedia(media));
		});

		ipc.on('getThumbSuccess',(err,item)=>{
			this.props.dispatch(Action.setThumb(item));
		});
	}

	render() {
		return (<CSS opts={['app',true,true,true,500,5000,5000]}>
			<div className="main" key='main' onMouseMove={this.mouseMove.bind(this)} onMouseUp={this.mouseUp.bind(this)} onClick={this.triggerClick.bind(this)}>
				{/*Multiple select frame*/}
				<Multiple/>
				{/*Bar*/}
				<AppBar 
				className='app-bar' title='my cloud' iconElementRight={<FlatButton label={this.props.login.obj.username} />}
				onLeftIconButtonTouchTap={this.leftNavClick.bind(this)}
				>
				</AppBar>
				{/*Left Nav*/}
				<Drawer width={200} open={this.props.navigation.menu} className='left-nav'>
					<LeftNav/>
				</Drawer>
				{/*Content*/}
				<Paper className={"content-container "+(this.props.navigation.menu?'content-has-left-padding':'no-padding')} style={{paddingTop:64}} zDepth={0}>
					<Content></Content>
				</Paper>
				<Snackbar open={this.props.snack.open} message={this.props.snack.text} autoHideDuration={3000} onRequestClose={this.cleanSnack.bind(this)}/>
			</div></CSS>
			);
	}

	triggerClick(e) {
		if (this.props.data.menu.show) {
			this.props.dispatch(Action.toggleMenu());
		}
	}
	//toggle left navigation
	leftNavClick() {
		this.props.dispatch(Action.navToggle());
	}
	//draw multiple select frame
	mouseMove(e) {
		 e.preventDefault(); e.stopPropagation();
		if (this.props.multiple.multiple.isShow == true&&this.props.data.state != 'BUSY') {
			this.props.dispatch(Action.mouseMove(e.nativeEvent.x,e.nativeEvent.y));
		}
	}
	//multiple select and hide frame
	mouseUp() {
		if (this.props.multiple.multiple.isShow == true) {
		let mul = this.props.multiple.multiple;
 			let height = Math.abs(mul.top-mul.height);;
 			let part = Math.ceil(height/51);
 			let top = Math.min(mul.top,mul.height)+document.getElementsByClassName('file-area')[0].scrollTop;
 			let bottom = Math.max(mul.top,mul.height)+document.getElementsByClassName('file-area')[0].scrollTop;

 			let position = this.props.data.position;
 			for (let i = 0;i < position.length; i++) {
 				if (position[i].bottom<top) {
 					if (this.props.data.children[i].checked == true) {
 						this.props.dispatch(Action.selectChildren(i));	
 					}
 					continue;
 				}
 				if (position[i].bottom>top&&position[i].top<top) {
 					if (this.props.data.children[i].checked == false) {
 						this.props.dispatch(Action.selectChildren(i));	
 						if (this.props.data.detail.length!=0) {
 							this.props.dispatch(Action.setDetail([this.props.data.children[i]]));
 						}
 						
 					}

 					continue;
 				}
 				if (position[i].bottom<bottom&&position[i].top>top) {
 					if (this.props.data.children[i].checked == false) {
 						this.props.dispatch(Action.selectChildren(i));	
 						if (this.props.data.detail.length!=0) {
 							this.props.dispatch(Action.setDetail([this.props.data.children[i]]));
 						}
 					}
 					continue;
 				}
 				if (position[i].top<bottom&&position[i].bottom>bottom) {
 					if (this.props.data.children[i].checked == false) {
 						this.props.dispatch(Action.selectChildren(i));	
 						if (this.props.data.detail.length!=0) {
 							this.props.dispatch(Action.setDetail([this.props.data.children[i]]));
 						}
 					}
 					continue;
 				}
 				if (position[i].top>bottom) {
 					if (this.props.data.children[i].checked == true) {
 						this.props.dispatch(Action.selectChildren(i));	
 					}
 					continue;	
 				}
 			}
			var num = [];
			var dis = this.props.data.multiple;

			this.props.dispatch(Action.mouseUp());
		}
	}
	//close snackbar
	cleanSnack() {
		this.props.dispatch(Action.cleanSnack());
	}
}

Main.childContextTypes = {
	muiTheme: React.PropTypes.object.isRequired
}

function mapStateToProps (state) {
	return {
		navigation: state.navigation,
		login: state.login,
		data: state.data,
		multiple:state.multiple,
		snack: state.snack
	}
}

//export component
export default connect(mapStateToProps)(Main);