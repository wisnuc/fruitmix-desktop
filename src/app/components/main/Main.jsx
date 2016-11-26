/**
 * @component Main
 * @description main interface
 * @time 2016-4-26
 * @author liuhua
 **/
import { ipcRenderer } from 'electron'

import React from 'react';

import {Avatar, Menu, Paper, Snackbar, MenuItem, IconButton, Divider } from 'material-ui';

import SocialNotifications from 'material-ui/svg-icons/social/notifications'

import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import NavigationApps from 'material-ui/svg-icons/navigation/apps'
import NavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less'
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more'
import ActionSettings from 'material-ui/svg-icons/action/settings'
import ActionAccountCircle from 'material-ui/svg-icons/action/account-circle'


import { fileNav } from '../../lib/file'
import FileApp from '../file/FileApp'


import LeftNav from './LeftNav';


const storeState = () => window.store.getState()


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

const motionSharpCurveDuration = 150
const motionSharpCurve = (prop) => `${prop} ${motionSharpCurveDuration}ms cubic-bezier(0.4, 0.0, 0.6, 1)`

const TopBar = ({style, showAppBar}) => (

  <div style={style}>
    <Paper style={{ 
      height: '100%', backgroundColor: '#FFF',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
    }}
    zDepth={3}
    >

      <div style={{marginLeft: 72, width: (210 - 72), fontSize: 16, opacity:0.54}}>闻上云管家</div>
      
      <Avatar style={{marginRight: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
      <Avatar style={{marginRight: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
      <Avatar style={{marginRight: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
      <Avatar style={{marginRight: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
      <Avatar style={{marginRight: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
      <Avatar style={{marginRight: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
      <Avatar style={{marginRight: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
      <Avatar style={{marginRight: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
      
      <div style={{flex:'1 0'}} />

      <IconButton iconStyle={{opacity: 0.54}}><NavigationApps /></IconButton>
      <IconButton iconStyle={{opacity: 0.54}}><ActionSettings /></IconButton> 
      <IconButton iconStyle={{opacity: 0.54}}><SocialNotifications /></IconButton>
      <IconButton iconStyle={{opacity: 0.54}}><ActionAccountCircle /></IconButton>
      <div style={{width: 64}} />
    </Paper>
  </div>
)

class Main extends React.Component {

	constructor(props) {
    super(props);
    this.state = { showAppBar: props.showAppBar }
  }

  componentWillReceiveProps(nextProps) {
    
  }

	render() {

    const topBarHeight = 48
    const showAppBar = window.store.getState().view.showAppBar
  
    return (

      <div style={{width: '100%', height: '100%'}}>

        <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}>
          <TopBar 
            style= {{
              position: 'absolute', 
              width: '100%', 
              height: topBarHeight, 
              top: this.props.showAppBar ? 0 : -topBarHeight,
              transition: motionSharpCurve('top'),
            }} 
            showAppBar={showAppBar} />

          <FileApp 
            style={{
              position: 'absolute', 
              width: '100%', 
              top: this.props.showAppBar ? topBarHeight : 0, 
              height: this.props.showAppBar ? `calc(100% - ${topBarHeight}px)` : '100%', 
              transition: motionSharpCurve('top'),
            }}
            showAppBar={showAppBar} />
        </div>

        <IconButton 
          style={{position: 'absolute', 
            top: showAppBar ? (topBarHeight - 48) / 2 : (56 - 48 ) / 2,
            transition: motionSharpCurve('top'),
            right: 0,
            zIndex: 10000
          }}

          iconStyle={{opacity: 0.54}} 
          onTouchTap={toggleAppBar} 
        >
          { showAppBar ? <NavigationExpandLess /> : <NavigationExpandMore /> }
        </IconButton>

        <Snackbar 
          style={{textAlign:'center'}} 
          open={storeState().snack.open} 
          message={storeState().snack.text} 
          autoHideDuration={3000} 
          onRequestClose={() => window.store.dispatch() /* TODO */}
        />
      </div>
	  )
	}

	//close snackbar
	cleanSnack() {
		this.props.dispatch(Action.cleanSnack());
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

}

export default Main


