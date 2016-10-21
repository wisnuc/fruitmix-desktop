/**
 * @component Main
 * @description main interface
 * @time 2016-4-26
 * @author liuhua
 **/

 'use strict';
// require core module
 import React, { Component, PropTypes } from 'react';
 import { findDOMNode } from 'react-dom';
 import CSS from '../../utils/transition';

//require material
import { TextField, Drawer, Paper, Snackbar, FlatButton, IconMenu, MenuItem, IconButton, Dialog } from 'material-ui';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

//import Action
import Action from '../../actions/action';

//import CSS
import css  from  '../../../assets/css/main';

//import component
import LeftNav from './LeftNav';
import Content from './Content';
import Multiple from '../mainContent/Multiple';
//import Users from './userDialog';
import AppBar from './AppBar'

import svg from '../../utils/SVGIcon'

//import Mask from './MediaMask'

class Main extends Component {

	getChildContext() {
		const muiTheme = getMuiTheme(lightBaseTheme);
		return {muiTheme};
	}
	constructor(props) {
        super(props);
        this.state = { userDialog: false};
    }
	componentDidMount() {
		var _this = this
		ipc.send('getRootData')
		ipc.send('getMediaData')
		ipc.send('getMoveData')
		ipc.send('getFilesSharedToMe')
		ipc.send('getFilesSharedToOthers')
		ipc.send('getMediaShare')

		// this.props.dispatch(Action.filesLoading());

		// ipc.on('receive',function (err,dir,children,path) {
		// 	_this.props.dispatch(Action.setDirctory(dir,children,path))
		// });
		ipc.on('setTree',(err,tree)=>{
			this.props.dispatch(Action.setTree(tree));
		});

		// ipc.on('uploadSuccess',(err,file,children)=>{
		// 		this.props.dispatch(Action.refreshDir(children));
		// });

		// ipc.on('setShareChildren',(err,shareChildren,sharePath)=>{
		// 	this.props.dispatch(Action.setShareChildren(shareChildren,sharePath));
		// });

		ipc.on('refreshStatusOfUpload',(err,file,status)=>{
			this.props.dispatch(Action.refreshStatusOfUpload(file,status));
		});

		ipc.on('refreshStatusOfDownload',(err,file,status)=>{
			this.props.dispatch(Action.refreshStatusOfDownload(file,status));
		})

		ipc.on('refreshDownloadStatusOfFolder',(err,key,status)=>{
			this.props.dispatch(Action.refreshDownloadStatusOfFolder(key,status));
		});

		ipc.on('refreshUploadStatusOfFolder',(err,key,status)=>{
			this.props.dispatch(Action.refreshUploadStatusOfFolder(key,status));
		});


		ipc.on('deleteSuccess',(err,obj,children,dir)=>{
			if (dir.uuid == this.props.state.data.directory.uuid) {
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
		//media--------------------------------------------------------------------------
		// ipc.on('mediaFinish',(err,media)=>{
		// 	this.props.dispatch(Action.setMedia(media));
		// });

		// ipc.on('getThumbSuccess',(err,item,path)=>{
		// 	this.props.dispatch(Action.setThumb(item,path,'ready'));
		// });

		// ipc.on('getThumbFailed',(err,item)=>{
		// 	this.props.dispatch(Action.setThumb(item,'failed'));
		// });

		ipc.on('donwloadMediaSuccess',(err,item)=>{
			this.props.dispatch(Action.setMediaImage(item));
		});

		// ipc.on('mediaShare', (err,data) => {
		// 	this.props.dispatch(Action.setMediaShare(data))
		// })

		// ipc.on('getShareThumbSuccess', (err, item, path) => {
		// 	this.props.dispatch(Action.setShareThumb(item,path))
		// })

		//transmission---------------------------------------------------------------------
		ipc.on('transmissionDownload',(err,obj)=>{
			this.props.dispatch(Action.addDownload(obj));
		});

		ipc.on('transmissionUpload',(err,obj)=>{
			this.props.dispatch(Action.addUpload(obj));
		});

		ipc.on('setUsers',(err,user)=>{
			this.props.dispatch({type:'SET_USER',user:user});
		});

		ipc.on('setDownloadPath',(err,path)=>{
			this.props.dispatch({type:'SET_DOWNLOAD_PATH',path:path});
		})

		ipc.on('setMoveData', (err,data) => {
			this.props.dispatch(Action.setMoveData(data))
		})

		setTimeout(()=>{
			//ipc.send('createMediaShare',["2844489f0916f3db01e88b751343ff8a7b0b450f382b54fc2b3823fa3465864e","b827ccd8f259a497f51890b22ef76359d8dc692c94a9046c4e689c73e81e6afd"],["e5f23cb9-1852-475d-937d-162d2554e22c"])
		},2000)
	}

	render() {
		// if (this.props.state.view.currentMediaImage.open) {
		// 	m = <Mask dispatch={this.props.dispatch} state={this.props.state}/>
		// }
		return (<CSS opts={['app',true,true,true,500,5000,5000]} style={{height:'100%'}}>
			<div className="main" key='main' onMouseMove={this.mouseMove.bind(this)} onMouseUp={this.mouseUp.bind(this)} onClick={this.triggerClick.bind(this)}>

				{/*Multiple select frame*/}
				{/*<Multiple dispatch={this.props.dispatch} state={this.props.state}/>*/}

				{/*Bar*/}
				<AppBar/>

				{/*Left Nav*/}
				<LeftNav/>

				{/*Content*/}
				<Paper className={"content-container "+(this.props.state.navigation.menu?'content-has-left-padding':'no-padding')} zDepth={0}>
					<Content dispatch={this.props.dispatch} state={this.props.state}/>
				</Paper>

				<Snackbar style={{textAlign:'center'}} open={this.props.state.snack.open} message={this.props.state.snack.text} autoHideDuration={3000} onRequestClose={this.cleanSnack.bind(this)}/>
			</div></CSS>
			);
	}

	

	triggerClick(e) {
		if (this.props.state.view.menu.show) {
			this.props.dispatch(Action.toggleMenu(null,0,0,false));
		}
	}
	//draw multiple select frame
	mouseMove(e) {
		return 
		 e.preventDefault(); e.stopPropagation();
		if (this.props.state.multiple.multiple.isShow == true&&this.props.state.data.state != 'BUSY') {
			this.props.dispatch(Action.mouseMove(e.nativeEvent.x,e.nativeEvent.y));
		}
	}
	//multiple select and hide frame
	mouseUp() {
		return 
		if (this.props.state.multiple.multiple.isShow == true) {
		let mul = this.props.state.multiple.multiple;
 			let height = Math.abs(mul.top-mul.height);;
 			let part = Math.ceil(height/51);
 			let top = Math.min(mul.top,mul.height)+document.getElementsByClassName('file-area')[0].scrollTop;
 			let bottom = Math.max(mul.top,mul.height)+document.getElementsByClassName('file-area')[0].scrollTop;

 			let position = this.props.state.data.position;
 			for (let i = 0;i < position.length; i++) {
 				if (position[i].bottom<top) {
 					if (this.props.state.data.children[i].checked == true) {
 						this.props.dispatch(Action.selectChildren(i));
 					}
 					continue;
 				}
 				if (position[i].bottom>top&&position[i].top<top) {
 					if (this.props.state.data.children[i].checked == false) {
 						this.props.dispatch(Action.selectChildren(i));
 						if (this.props.state.data.detail.length!=0) {
 							this.props.dispatch(Action.setDetail([this.props.state.data.children[i]]));
 						}

 					}

 					continue;
 				}
 				if (position[i].bottom<bottom&&position[i].top>top) {
 					if (this.props.state.data.children[i].checked == false) {
 						this.props.dispatch(Action.selectChildren(i));
 						if (this.props.state.data.detail.length!=0) {
 							this.props.dispatch(Action.setDetail([this.props.state.data.children[i]]));
 						}
 					}
 					continue;
 				}
 				if (position[i].top<bottom&&position[i].bottom>bottom) {
 					if (this.props.state.data.children[i].checked == false) {
 						this.props.dispatch(Action.selectChildren(i));
 						if (this.props.state.data.detail.length!=0) {
 							this.props.dispatch(Action.setDetail([this.props.state.data.children[i]]));
 						}
 					}
 					continue;
 				}
 				if (position[i].top>bottom) {
 					if (this.props.state.data.children[i].checked == true) {
 						this.props.dispatch(Action.selectChildren(i));
 					}
 					continue;
 				}
 			}
			var num = [];
			var dis = this.props.state.data.multiple;

			this.props.dispatch(Action.mouseUp());
		}
	}
	//close snackbar
	cleanSnack() {
		this.props.dispatch(Action.cleanSnack());
	}

	componentWillReceiveProps() {
		c.log('-2')
		c.log((new Date()).getTime())
	}

	componentDidUpdate() {
		c.log('-1')
		c.log((new Date()).getTime())	
	}
}

Main.childContextTypes = {
	muiTheme: React.PropTypes.object.isRequired
}



//export component
export default Main;
