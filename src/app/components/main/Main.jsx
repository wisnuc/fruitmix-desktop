/**
 * @component Main
 * @description main interface
 * @time 2016-4-26
 * @author liuhua
 **/
import { ipcRenderer } from 'electron'

import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';

//require material
import { Avatar, SvgIcon, Subheader, List, ListItem, Popover, Menu, TextField, Drawer, Paper, Snackbar, FlatButton, RaisedButton, IconMenu, MenuItem, IconButton, Dialog, Divider } from 'material-ui';

import SocialNotifications from 'material-ui/svg-icons/social/notifications'

import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import NavigationApps from 'material-ui/svg-icons/navigation/apps'
import NavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less'
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'
import FileCloudCircle from 'material-ui/svg-icons/file/cloud-circle'
import FileFolderShared from 'material-ui/svg-icons/file/folder-shared'
import FileFileUpload from 'material-ui/svg-icons/file/file-upload'
import FileFileDownload from 'material-ui/svg-icons/file/file-download'
import SocialShare from 'material-ui/svg-icons/social/share'
import SocialPeople from 'material-ui/svg-icons/social/people'
import ActionSettings from 'material-ui/svg-icons/action/settings'
import ActionInfo from 'material-ui/svg-icons/action/info'
import ActionAccountCircle from 'material-ui/svg-icons/action/account-circle'
import DeviceStorage from 'material-ui/svg-icons/device/storage'

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import enhanceWithClickOutside from 'react-click-outside'
//import Action
import Action from '../../actions/action'

import FileUploadButton from '../file/FileUploadButton'

import AppBar from './AppBar'
import LeftNav from './LeftNav';
import Content from './Content';
import Multiple from '../mainContent/Multiple';
//import Users from './userDialog';
import svg from '../../utils/SVGIcon'

import ScrollArea from 'react-scrollbar'
//import Mask from './MediaMask'

import AllFiles from '../mainContent/AllFiles'

const storeState = () => window.store.getState()

import { fileNav } from '../../lib/file'

const LEFTNAV_WIDTH = 210


const toggleAppBar = () => window.store.dispatch({ type: 'TOGGLE_APPBAR' })


const renderLeftNav = () => (
    <Menu style={{fontSize: 14, fontWeight: 700}} width={240}>
      <MenuItem style={{fontSize: 23, fontWeight: 700}} primaryText='我的文件' leftIcon={<DeviceStorage />} />
      <MenuItem primaryText='我分享的文件' leftIcon={<SocialShare />} />
      <Divider />
      <MenuItem primaryText='分享给我的文件' leftIcon={<SocialPeople />} />
      <Divider />
      <MenuItem primaryText='上传任务' leftIcon={<FileFileUpload />} />
      <MenuItem primaryText='下载任务' leftIcon={<FileFileDownload />} />
      <Divider />
      <MenuItem primaryText='test icon' leftIcon={<FileIcon />} />
    </Menu> 
  )

const FileToolbar = ({showAppBar, showDetail, toggleLeftNav}) => {

  return (
    <Paper id='layout-middle-container-upper' 
      style={{ 
        position: 'absolute', width: '100%', height: 56,
        backgroundColor: '#2196F3',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }} 
      rounded={false} 
      zDepth={showAppBar ? 0 : 1}
    >
      <IconButton id='file-toolbar-menu-icon' key='toolbar-menu' 
        style={{marginLeft: 4}}
        iconStyle={{color: '#000', opacity:0.54}} 
        onTouchTap={() => toggleLeftNav()}
      > 
        <NavigationMenu />
      </IconButton>

      <div key='toolbar-title' style={{marginLeft: 20, fontSize: 21, whiteSpace: 'nowrap', color: '#FFF' }}>文件</div>

      <div key='toolbar-spacer-middle' style={{width: '100%'}} />

      <IconButton iconStyle={{color: '#000', opacity: 0.54}}>
        <FileCreateNewFolder />
      </IconButton>

      <IconButton iconStyle={{color: showDetail ? '#FFF' : '#000', opacity: showDetail ? 1 : 0.54}} 
        onTouchTap={() => window.store.dispatch({ type: 'TOGGLE_SOMETHING' })}>
        <ActionInfo />
      </IconButton> 

      <div style={{width: (showAppBar || showDetail) ? 0 : 48, height:48, transition: 'width 150ms'}} />

    </Paper>
  )
}

class FileDetailToolbar extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { showAppBar, showBanner, nudgeBanner } = this.props
    return (
      <Paper id='layout-right-container-upper' 
        style={{
          position: 'absolute', 
          width: '100%', height: 56, 

          backgroundColor:'#1976D2',

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        rounded={false} 
        zDepth={showAppBar ? 0 : 1}
      >
        <div style={{flex: '1'}} />
        <IconButton style={{opacity: showBanner ? 0.54 : 0}}><ActionInfo /></IconButton>
        <div style={{width: nudgeBanner ? 48 : 0, height:48, transition: 'width 150ms'}} />
      </Paper>
    )
  }
}

class FileApp extends React.Component {

  constructor(props) {
    super(props)
    this.state = this.propsToState(props)
    this.toggleLeftNavBound = this.toggleLeftNav.bind(this)
  }

  // functional
  propsToState(props) {

   let state = {
      showAppBar: props.showAppBar,
      showDetail: props.showDetail,
      nudgeBanner: !props.showAppBar && !props.showDetail
    } 

    if (props.showDetail) {
      state.detailShowBanner = true
      state.detailNudgeBanner = !props.showAppBar
    }

    if (!this.state) {
      state.leftNav = false
    }
    else {
      state.leftNav = this.state.leftNav
    }

    return state
  }

  toggleLeftNav() {
    this.setState(Object.assign({}, this.state, { leftNav: !this.state.leftNav }))
  }

  // state delay
  componentWillReceiveProps(nextProps) {

    let nextState = this.propsToState(nextProps)

    if (this.state.showDetail === false && nextProps.showDetail === true) {
      this.setState(Object.assign({}, nextState, { detailShowBanner: false }))
      return setTimeout(() => this.setState(nextState), 450)
    }
    else if (this.state.showDetail === true && nextProps.showDetail === false) {
      this.setState(Object.assign({}, this.state, { detailShowBanner: false }))
      return setTimeout(() => this.setState(nextState), 450)
    }
    
    this.setState(nextState)
  } 

  render() {

    const detailWidth = 500
    const { showAppBar, showDetail } = this.props

    return (

      <div id='layout-main-container' 
        style={{
          position: 'absolute', 
          width: '100%', 
          top: this.state.showAppBar ? 64 : 0, 
          height: this.state.showAppBar ? 'calc(100% - 64px)' : '100%', 
          transition: 'top 150ms',
          backgroundColor:'blue'
        }}
      >
        { false && ( // don't delete me, floating left nav
        <Paper style={{
          width: 280, 
          height: '100%', 
          position: 'absolute', 
          left: this.state.leftNav ? 0 : -280, 
          transition: 'left 100ms', 
          zIndex: 1000 }} 
          rounded={false}
          zDepth={2} 
        >
          { renderLeftNav() }
        </Paper> ) }

        {/* this.state.leftNav && <div style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: 'black', zIndex: 999, opacity:0.05}} onTouchTap={this.toggleLeftNavBound} /> */}

        <div id='layout-middle-container' 
          style={{
            position: 'absolute',

            // imporant! using props (next)
            width: this.props.showDetail ? `calc(100% - ${detailWidth}px)` : '100%', 
            transition: 'width 300ms',
            height:'100%'
          }}
        >
          {/* important ! */}
          <Divider />

          <FileToolbar showAppBar={showAppBar} showDetail={showDetail} toggleLeftNav={this.toggleLeftNavBound} />

          <div id='layout-middle-container-spacer' style={{height: 56}} />

          <div id='layout-middle-container-lower' style={{
            width: '100%', 
            height: 'calc(100% - 56px)', 
            backgroundColor: '#EEEEEE', 
            display:'flex'
          }}>

            <div style={{
              position: 'absolute',
              width: LEFTNAV_WIDTH,
              height: '100%',
              left: this.state.leftNav ? 0 : -LEFTNAV_WIDTH,
              transition: 'left 300ms'
            }}>
              <Menu autoWidth={false} listStyle={{width: LEFTNAV_WIDTH}}>
                <MenuItem style={{fontSize: 14}} primaryText='我的文件' leftIcon={<DeviceStorage />} animation={null}/>
                <MenuItem style={{fontSize: 14}} primaryText='我分享的文件' leftIcon={<SocialShare />} />
                <Divider />
                <MenuItem style={{fontSize: 14}} primaryText='分享给我文件' leftIcon={<SocialPeople />} />
                <Divider />
                <MenuItem style={{fontSize: 14}} primaryText='上传任务' leftIcon={<FileFileUpload />} />
                <MenuItem style={{fontSize: 14}} primaryText='下载任务' leftIcon={<FileFileDownload />} />
              </Menu> 
            </div>

            <div style={{
              // for suppressed leftNav, TODO
              marginLeft: this.state.leftNav ? LEFTNAV_WIDTH : 0, 
              transition: 'margin-left 300ms', 

              width: '100%', 
              height: '100%', 
              backgroundColor:'yellow', 
              // overflow: 'auto'
            }}>
              {/* <Content dispatch={window.store.dispatch} state={storeState()}/> */}
              <AllFiles dispatch={window.store.dispatch} state={window.store.getState()}/>
            </div>
          </div>

        </div> 
        <div id='layout-rightnav-container' 
          style={{
            width: detailWidth, 
            height: '100%', 
            backgroundColor: '#EBEBEB', 
            position: 'absolute', 
            right: showDetail ? 0 : -detailWidth, 
            transition: 'right 300ms'
        }}>
          <Divider />

          { this.state.showDetail && <FileDetailToolbar showAppBar={this.state.showAppBar} showBanner={this.state.detailShowBanner} nudgeBanner={this.state.detailNudgeBanner} /> }
        </div>
      </div>
    )
  }
}

class Main extends Component {

	constructor(props) {
    super(props);
    this.state = { userDialog: false, popover: false };
  }

	getChildContext() {
		const muiTheme = getMuiTheme(lightBaseTheme);
		return {muiTheme};
	}

	componentDidMount() {

		var _this = this

    fileNav('HOME_DRIVE', null)

		// ipcRenderer.send('getRootData')
		// ipcRenderer.send('getMediaData')
		// ipcRenderer.send('getMoveData')
		// ipcRenderer.send('getFilesSharedToMe')
		// ipcRenderer.send('getFilesSharedToOthers')
		// ipcRenderer.send('getMediaShare')

		// this.props.dispatch(Action.filesLoading());

		// ipcRenderer.on('receive',function (err,dir,children,path) {
		// 	_this.props.dispatch(Action.setDirctory(dir,children,path))
		// });
		ipcRenderer.on('setTree',(err,tree)=>{
			this.props.dispatch(Action.setTree(tree));
		});

		// ipcRenderer.on('uploadSuccess',(err,file,children)=>{
		// 		this.props.dispatch(Action.refreshDir(children));
		// });

		// ipcRenderer.on('setShareChildren',(err,shareChildren,sharePath)=>{
		// 	this.props.dispatch(Action.setShareChildren(shareChildren,sharePath));
		// });

		ipcRenderer.on('refreshStatusOfUpload',(err,tasks)=>{
			this.props.dispatch(Action.refreshStatusOfUpload(tasks));
		});

		ipcRenderer.on('refreshStatusOfDownload',(err,file,status)=>{
			this.props.dispatch(Action.refreshStatusOfDownload(file,status));
		})

		// ipcRenderer.on('refreshDownloadStatusOfFolder',(err,key,status)=>{
		// 	this.props.dispatch(Action.refreshDownloadStatusOfFolder(key,status));
		// });

		// ipcRenderer.on('refreshUploadStatusOfFolder',(err,key,status)=>{
		// 	this.props.dispatch(Action.refreshUploadStatusOfFolder(key,status));
		// });


		ipcRenderer.on('deleteSuccess',(err,obj,children,dir)=>{
			if (dir.uuid == storeState().data.directory.uuid) {
				this.props.dispatch(Action.refreshDir(children));
			}
		});

		ipcRenderer.on('message',(err,message,code)=>{
			this.props.dispatch(Action.setSnack(message,true));
			switch(code) {
				case 1:
					this.props.dispatch(Action.getDataFailed());
			}
		});

		ipcRenderer.on('treeChildren',(err,treeChildren)=>{
			this.props.dispatch(Action.setTree(treeChildren));
		});
		//media--------------------------------------------------------------------------
		// ipcRenderer.on('mediaFinish',(err,media)=>{
		// 	this.props.dispatch(Action.setMedia(media));
		// });

		// ipcRenderer.on('getThumbSuccess',(err,item,path)=>{
		// 	this.props.dispatch(Action.setThumb(item,path,'ready'));
		// });

		// ipcRenderer.on('getThumbFailed',(err,item)=>{
		// 	this.props.dispatch(Action.setThumb(item,'failed'));
		// });

		ipcRenderer.on('donwloadMediaSuccess',(err,item)=>{
			this.props.dispatch(Action.setMediaImage(item));
		});

		// ipcRenderer.on('mediaShare', (err,data) => {
		// 	this.props.dispatch(Action.setMediaShare(data))
		// })

		// ipcRenderer.on('getShareThumbSuccess', (err, item, path) => {
		// 	this.props.dispatch(Action.setShareThumb(item,path))
		// })

		//transmission---------------------------------------------------------------------
		// ipcRenderer.on('transmissionDownload',(err,obj)=>{
		// 	this.props.dispatch(Action.addDownload(obj));
		// });

		// ipcRenderer.on('transmissionUpload',(err,obj)=>{
		// 	this.props.dispatch(Action.addUpload(obj));
		// });

		ipcRenderer.on('setUsers',(err,user)=>{
			this.props.dispatch({type:'SET_USER',user:user});
		});

		ipcRenderer.on('setDownloadPath',(err,path)=>{
			this.props.dispatch({type:'SET_DOWNLOAD_PATH',path:path});
		})

		ipcRenderer.on('setMoveData', (err,data) => {
			this.props.dispatch(Action.setMoveData(data))
		})

		setTimeout(()=>{
		},2000)
	}

	render() {

    const showAppBar = window.store.getState().view.showAppBar
    const showDetail = window.store.getState().view.toggle

    return (

      <div style={{width: '100%', height: '100%'}}>

        <Paper id='layout-appbar' style={{

          position: 'absolute', 
          width: '100%', 
          height: 64, 

          top: showAppBar ? 0 : -64, 
          transition: 'top 150ms',

          display: 'flex',
          alignItems: 'center', 
          justifyContent: 'space-between', 
          backgroundColor: '#FFF' 

        }}
          rounded={false}
        >

          <div style={{marginLeft: 72, fontSize: 16, opacity:0.54}}>闻上云管家</div>
          
          <Avatar style={{marginLeft: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
          <Avatar style={{marginLeft: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
          <Avatar style={{marginLeft: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
          <Avatar style={{marginLeft: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
          <Avatar style={{marginLeft: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
          <Avatar style={{marginLeft: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
          <Avatar style={{marginLeft: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
          <Avatar style={{marginLeft: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
          
          <div style={{flex:'1 0'}} />

          <IconButton iconStyle={{opacity: 0.54}}><NavigationApps /></IconButton>
          <IconButton iconStyle={{opacity: 0.54}}><ActionSettings /></IconButton> 
          <IconButton iconStyle={{opacity: 0.54}}><SocialNotifications /></IconButton>
          <IconButton iconStyle={{opacity: 0.54}}><ActionAccountCircle /></IconButton>
          <div style={{width: 64, height: 64}} />
        </Paper>

        <FileApp showAppBar={showAppBar} showDetail={showDetail} />

        <Snackbar 
          style={{textAlign:'center'}} 
          open={storeState().snack.open} 
          message={storeState().snack.text} 
          autoHideDuration={3000} 
          onRequestClose={this.cleanSnack.bind(this)}
        />

        <IconButton
          id='floating-home' 
          style={{ position: 'absolute',
            top: showAppBar ? 8 : 4,
            transition: 'top 150ms',
            right: 0,
            zIndex: 9999
          }}
          iconStyle={{opacity: 0.54}} 
          onTouchTap={toggleAppBar} 
        >
          { showAppBar ? <NavigationExpandLess /> : <NavigationExpandMore /> }
        </IconButton>
      </div>
	  )
	}

	//close snackbar
	cleanSnack() {
		this.props.dispatch(Action.cleanSnack());
	}
}

Main.childContextTypes = {
	muiTheme: React.PropTypes.object.isRequired
}

export default Main


